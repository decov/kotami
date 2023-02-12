// consts
const { EmbedBuilder } = require('discord.js');

const { getSettings: registerGuild } = require('@schemas/Guild');

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Guild} guild
 */
module.exports = async (client, guild) => {
    if (!guild.available)
        return;
    
    client.logger.log(`saiu do servidor ${guild.name} que possui ${guild.memberCount} membros...`);

    const settings = await getSettings(guild);

    settings.data.leftAt = new Date();

    await settings.save();

    if (!client.joinLeaveWebhook)
        return;

    let ownerTag;

    const ownerId = guild.ownerId || settings.data.owner;

    try {
        const owner = await client.users.fetch(ownerId);

        ownerTag = owner.tag;
    } catch (err) {
        ownerTag = 'usuário deletado';
    }

    const embed = new EmbedBuilder()
        .setTitle('saiu do servidor')
        .setThumbnail(guild.iconURL())
        .setColor(client.config.EMBED_COLORS.ERROR)
        .setFields(
            {
                name: 'nome de servidor',
                value: guild.name || "NA",
                inline: false
            },
            
            {
                name: 'id',
                value: guild.id,
                inline: false
            },

            {
                name: 'dono',
                value: `${ownerTag} [\`${ownerId}\`]`,
                inline: false
            },

            {
                name: 'membros',
                value: `\`\`\`yaml\n${guild.memberCount}\`\`\``,
                inline: false
            }
        )
        .setFooter({ text: `servidor #${client.guilds.cache.size}` });

    client.joinLeaveWebhook.send({
        username: 'saída',
        avatarURL: client.user.displayAvatarURL(),
        embeds: [embed]
    });
};