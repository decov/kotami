// consts
const { ApplicationCommandOptionType } = require('discord.js');

const { kickTarget } = require('@helpers/ModUtils');

/**
 * @type {import('@structures/Command')}
 */
module.exports = {
    name: 'kick',
    description: 'expulsa o membro especificado do servidor',
    category: 'MODERATION',

    botPermissions: [
        'KickMembers'
    ],

    userPermissions: [
        'KickMembers'
    ],

    command: {
        enabled: true,
        usage: '<id|@membro> [motivo]',
        minArgsCount: 1
    },

    slashCommand: {
        enabled: true,

        options: [
            {
                name: 'user',
                description: 'selecione o membro que deseja expulsar',
                type: ApplicationCommandOptionType.User,
                required: true
            },
            {
                name: 'reason',
                description: 'especifique o motivo da expulsão',
                type: ApplicationCommandOptionType.String,
                required: false
            }
        ]
    },

    async messageRun(message, args) {
        const target = await message.guild.resolveMember(args[0], true);

        if (!target)
            return message.safeReply(`nenhum usuário encontrado com ${args[0]}...`);

        const reason = message.content.split(args[0])[1].trim();

        const response = await kick(message.member, target, reason);

        await message.safeReply(response);
    },

    async interactionRun(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');

        const target = await interaction.guild.members.fetch(user.id);

        const response = await kick(interaction.member, target, reason);
        
        await interaction.followUp(response);
    }
};

async function kick(issuer, target, reason) {
    const response = await kickTarget(issuer, target, reason);

    if (typeof response === 'boolean')
        return `${target.user.tag} foi expulso com sucesso...`;

    if (response === 'BOT_PERM')
        return `eu não tenho permissão para expulsar o membro ${target.user.tag}...`;

    else if (response === 'MEMBER_PERM')
        return `você não tem permissão para expulsar o membro ${target.user.tag}...`;

    else
        return `ocorreu um erro ao expulsar ${target.user.tag}...`;
}