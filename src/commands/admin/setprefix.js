// consts
const { ApplicationCommandOptionType } = require('discord.js');

/**
 * @type {import('@structures/Command')}
 */
module.exports = {
    name: 'setprefix',
    description: 'selecione o prefixo no qual o bot deverá atender',
    category: 'ADMIN',

    userPermissions: [
        'ManageGuild'
    ],

    command: {
        enabled: true,
        usage: '<novo-prefixo>',
        minArgsCount: 1
    },

    slashCommand: {
        enabled: true,
        ephemeral: true,

        options: [
            {
                name: 'prefixo',
                description: 'o novo prefixo que será configurado',
                type: ApplicationCommandOptionType.String,
                required: true
            }
        ]
    },

    async messageRun(message, args, data) {
        const newPrefix = args[0];

        const response = await setNewPrefix(
            newPrefix,
            data.settings
        );

        await message.safeReply(response);
    },

    async interactionRun(interaction, data) {
        const response = await setNewPrefix(
            interaction.options.getString('prefixo'),
            data.settings
        );

        await interaction.followUp(response);
    }
};

async function setNewPrefix(newPrefix, settings) {
    if (newPrefix.length > 2)
        return 'o tamanho do prefixo não pode ultrapassar 2 caracteres...';

    settings.prefix = newPrefix;

    await settings.save();

    return `agora meu prefixo é \`${newPrefix}\`...`;
}