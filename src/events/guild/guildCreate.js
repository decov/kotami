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

    if (!guild.members.cache.has(guild.ownerId))
        await guild.fetchOwner({ cache: true }).catch(() => {});

    client.logger.log(`entrou no servidor ${guild.name} que possui ${guild.memberCount} membros...`);

    await registerGuild(guild);

    if (!client.joinLeaveWebhook)
        return;

    const embed = new EmbedBuilder()
        .setTitle('entrou no servidor')
        .setThumbnail(guild.iconURL())
        .setColor(client.config.EMBED_COLORS.SUCCESS)
        .addFields(
            {
                name: 'nome de servidor',
                value: guild.name,
                inline: false
            },

            {
                name: 'id',
                value: guild.id,
                inline: false
            },

            {
                name: 'dono',
                value: `${client.users.cache.get(guild.ownerId).tag} [\`${guild.ownerId}\`]`,
                inline: false
            },

            {
                name: 'membros',
                value: `\`\`\`yaml\n${guild.memberCount}\`\`\``,
                inline: false
            }
        )
        .setFooter({ text: `servidor #${client.guilds.cache.size}...` });

    client.joinLeaveWebhook.send({
        username: 'entrada',
        avatarURL: client.user.displayAvatarURL(),
        embeds: [embed]
    });
};