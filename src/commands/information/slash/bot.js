// consts
const {
    EmbedBuiler,
    ButtonBuilder,
    ActionRowBuilder,
    ApplicationCommandOptionType,
    ButtonStyle
} = require('discord.js');

const { timeformat } = require('@helpers/Utils');

const {
    EMBED_COLORS,
    SUPPORT_SERVER,
    DASHBOARD
} = require('@root/config.js');

const botstats = require('../shared/botstats');

/**
 * @type {import('@structures/Command')}
 */
module.exports = {
    name: 'bot',
    description: 'comandos relacionados ao bot',
    category: 'INFORMATION',

    botPermissions: [
        'EmbedLinks'
    ],

    command: {
        enabled: false
    },

    slashCommand: {
        enabled: true,

        options: [
            {
                name: 'invite',
                description: 'obter o convite do bot',
                type: ApplicationCommandOptionType.Subcommand
            },

            {
                name: 'stats',
                description: 'obter estatísticas do bot',
                type: ApplicationCommandOptionType.Subcommand
            },
            
            {
                name: 'uptime',
                description: 'retorna o uptime do bot',
                type: ApplicationCommandOptionType.Subcommand
            }
        ]
    },

    async interactionRun(interaction) {
        const sub = interaction.options.getSubcommand();

        if (!sub)
            return interaction.followUp('não é um subcomando válido...');

        // convite
        if (sub === 'invite') {
            const response = botInvite(interaction.client);

            try {
                await interaction.user.send(response);

                return interaction.followUp('cheque a sua dm para mais informações minha...');
            } catch (ex) {
                return interaction.followUp('eu não consegui te enviar minhas informações... sua dm está aberta?');
            }
        }

        // estatísticas
        else if (sub === 'stats') {
            const response = botstats(interaction.client);

            return interaction.followUp(response);
        }

        // uptime
        else if (sub === 'uptime') {
            await interaction.followUp(`meu uptime: \`${timeformat(process.uptime())}\``);
        }
    }
};

function botInvite(client) {
    // embed
    const embed = new EmbedBuiler()
        .setAuthor({
            name: 'invite'
        })
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setThumbnail(client.user.displayAvatarURL())
        .setDescription('olá. obrigado por ter considerado me convidar. use o botão abaixo para navegador por onde desejar...');

    // botões
    let components = [];

    components.push(new ButtonBuilder()
        .setLabel('link do invite')
        .setURL(client.getInvite())
        .setStyle(ButtonStyle.Link)
    );

    if (SUPPORT_SERVER) {
        components.push(new ButtonBuilder()
            .setLabel('servidor de suporte')
            .setURL(SUPPORT_SERVER)
            .setStyle(ButtonStyle.Link)
        );
    }

    let buttonsRow = new ActionRowBuilder()
        .addComponents(components);

    return {
        embeds: [embed],
        components: [buttonsRow]
    };
}