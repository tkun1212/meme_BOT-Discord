const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('サイコロを振ります')
        .addIntegerOption(option =>
            option.setName('sides')
                .setDescription('サイコロの面数を指定します (2~1000)')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('count')
                .setDescription('サイコロの個数を指定します (1~100)')
                .setRequired(true)
        ),
    async execute(sidesInput, countInput, id, replyMethod) {
        const [sidesMin, sidesMax] = [2, 1000];
        const [countMin, countMax] = [1, 100]; // 200 -> 100 に制限

        const sides = Math.max(sidesMin, Math.min(sidesInput, sidesMax));
        const count = Math.max(countMin, Math.min(countInput, countMax));

        function roll(diceSides) {
            return Math.floor(Math.random() * diceSides) + 1;
        }

        const result = Array.from({ length: count }, () => roll(sides));
        const total = result.reduce((sum, value) => sum + value, 0);

        if (count >= 15) {
            try {
                const fileTime = Date.now();
                const filePath = path.join(__dirname, '..', 'temp', `dice_results_${fileTime}.txt`);
                const fileContent = `サイコロの結果:\n${result.join(', ')}`;
                await fs.writeFile(filePath, fileContent, { encoding: 'utf-8' });

                const attachment = new AttachmentBuilder(filePath).setName(`dice_results_${fileTime}.txt`);

                await replyMethod({
                    content: `🎲 サイコロの結果の合計は **${total}** です！\n詳細は添付ファイルをご覧ください。`,
                    files: [attachment]
                });

                await fs.unlink(filePath); // ファイル削除処理
            } catch (err) {
                console.error('Error handling dice results file:', err);
                await replyMethod({
                    content: 'サイコロの結果を保存する際にエラーが発生しました。'
                });
            }
        } else {
            await replyMethod({
                content: `🎲 サイコロの結果は\n${result.join(', ')}\n合計: **${total}**\nです！`
            });
        }
    },
    async executeSlash(interaction) {
        const sides = interaction.options.getInteger('sides');
        const count = interaction.options.getInteger('count');

        await this.execute(sides, count, interaction.id, (msg) => interaction.reply(msg));
    },
    async executeMessage(message, args) {
        const sides = parseInt(args[0]);
        const count = parseInt(args[1]);

        await this.execute(sides, count, message.id, (msg) => message.reply(msg));
    }
};
