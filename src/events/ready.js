const logger = require('../utils/logger.js');
const { ActivityType } = require('discord.js');
const { GUILD_ID } = process.env;

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        if (!client.user) {
            logger.error('Client user is not initialized.');
            return;
        }

        logger.info(`Client logged in successfully: ${client.user.tag} (ID: ${client.user.id})`);

        const updatePresence = async () => {
            try {
                // /help のステータスを設定
                await client.user.setPresence({
                    activities: [{
                        type: ActivityType.Playing,
                        name: '/help',
                    }],
                    status: 'online',
                });

                // 5秒ごとにめめ鯖の人数を取得して表示
                setTimeout(async () => {
                    try {
                        const guild = await client.guilds.fetch(GUILD_ID);
                        const memberCount = guild.memberCount;  // メンバー数を取得

                        // メンバー数をステータスに反映
                        await client.user.setPresence({
                            activities: [{
                                type: ActivityType.Playing,
                                name: `${memberCount}人がめめ鯖を`,
                            }],
                            status: 'online',
                        });
                    } catch (err) {
                        logger.error('Failed to fetch guild or member count:', err);
                    }
                }, 5000);
            } catch (err) {
                logger.error('Error while setting status:', err);
            }
        };

        // 初回のステータス更新
        updatePresence();

        // 定期的にステータスを切り替え（5秒ごとに）
        setInterval(updatePresence, 10000);  // 10秒ごとに切り替え（/help -> メンバー数 -> /help -> メンバー数 の繰り返し）
    },
};
