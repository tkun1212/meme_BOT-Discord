const logger = require('../utils/logger.js');
const commandArgs = require('../data/commandArgs.json');
const aliases = require('../data/commandAliases.json');

const prefix = '.';
const commandCache = new Map();

/**
 * コマンド名またはエイリアスから実際のコマンド名を解決する
 * @param {string} inputName 
 * @returns {string}
 */
function resolveCommandName(inputName) {
    return Object.keys(aliases).find(cmd =>
        cmd === inputName || (Array.isArray(aliases[cmd]) && aliases[cmd].includes(inputName))
    ) || inputName;
}

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (!message.content.startsWith(prefix) || message.author.bot || !message.guild) return;

        const inputArgs = message.content.slice(prefix.length).trim().split(/\s+/);
        const commandName = inputArgs.shift().toLowerCase();
        const resolvedName = resolveCommandName(commandName);

        let command = commandCache.get(resolvedName);

        if (!command) {
            try {
                command = require(`../commands/${resolvedName}.js`);
                commandCache.set(resolvedName, command);
            } catch (err) {
                logger.warn(`Command not found or failed to load: ${resolvedName}`);
                return;
            }
        }

        if (typeof command.executeMessage !== 'function') {
            logger.warn(`Command "${resolvedName}" does not export "executeMessage"`);
            return;
        }

        logger.info(`Command called: "${resolvedName}" by ${message.author.tag} (ID: ${message.author.id})`);

        const args = (commandArgs[resolvedName] || []).map(arg => {
            switch (arg) {
                case 'client': return client;
                case 'args': return inputArgs;
                default: return undefined;
            }
        });

        try {
            await command.executeMessage(message, ...args);
        } catch (error) {
            logger.error(`Error executing command "${resolvedName}":`, error);
            try {
                await message.reply({
                    content: 'コマンド実行中にエラーが発生しました。Bot管理者に連絡してください。',
                });
            } catch (replyError) {
                logger.error('Error sending error message to user:', replyError);
            }
        }
    }
};
