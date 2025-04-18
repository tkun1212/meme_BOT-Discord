const { MessageFlags } = require('discord.js');
const logger = require('../utils/logger.js');
const commandArgs = require('../data/commandArgs.json');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isCommand()) return;

        const { commandName, user } = interaction;

        let command;
        try {
            // コマンドファイルを読み込む
            command = require(`../commands/${commandName}.js`);
        } catch (err) {
            // コマンドが見つからない場合は警告
            logger.warn(`Command module not found: ${commandName}`);
            return;
        }

        // コマンドが executeSlash メソッドを持っていない場合は警告
        if (typeof command.executeSlash !== 'function') {
            logger.warn(`Command "${commandName}" does not export "executeSlash"`);
            return;
        }

        // コマンドが呼ばれたことをログに記録
        logger.info(`Command called: "${commandName}" by ${user.tag} (ID: ${user.id})`);

        // コマンド引数の取得
        const args = (commandArgs[commandName] || []).map(arg => {
            if (arg === 'client') return client;
            return undefined;
        });

        try {
            // コマンドの実行
            await command.executeSlash(interaction, ...args);
        } catch (error) {
            // コマンド実行時のエラーをログに記録
            logger.error(`Error executing slash command "${commandName}":`, error);

            // ユーザーに返すエラーメッセージ
            const errorMessage = 'コマンド実行中にエラーが発生しました。Bot管理者に連絡してください。';
            const shouldFollowUp = interaction.replied || interaction.deferred;

            try {
                // エラーメッセージをエフェメラル（1度だけ表示）で送信
                await interaction[shouldFollowUp ? 'followUp' : 'reply']({
                    content: errorMessage,
                    flags: MessageFlags.Ephemeral
                });
            } catch (replyError) {
                // エラーメッセージ送信時のエラーをログに記録
                logger.error('Error sending error response to user:', replyError);
            }
        }
    }
};
