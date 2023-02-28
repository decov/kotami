// consts
const {
    EmbedBuilder,
    ApplicationCommandOptionType,
    ChannelType
} = require('discord.js');

const { stripIndent } = require('common-tags');

const { EMBED_COLORS } = require('@root/config');

/**
 * @type {import('@structures/Command')}
 */
module.exports = {
    name: 'automod',
    description: 'sistema de automod e suas configurações',

    category: 'ADMIN',

    userPermissions: [
        'ManageGuild'
    ],

    command: {
        enabled: true,
        minArgsCount: 1,

        subcommands: [
            {
                trigger: 'status',
                description: 'checa pela configuração do automod no servidor',
            },
            {
                trigger: 'strikes <número>',
                description: 'número máximo de strikes que um membro pode receber antes de tomar uma atitude',
            },
            {
                trigger: 'action <TIMEOUT|KICK|BAN>',
                description: 'define a ação a ser executada após receber strikes máximos',
            },
            {
                trigger: 'debug <on|off>',
                description: 'ativa o automod para mensagens enviadas por administradores e moderadores',
            },
            {
                trigger: 'whitelist',
                description: 'retorna uma lista de canais que estão na wishlist',
            },
            {
                trigger: 'whitelistadd <canal>',
                description: 'adiciona o canal selecionado da whitelist',
            },
            {
                trigger: 'whitelistremove <canal>',
                description: 'remove o canal selecionado da whitelist',
            }
        ]
    },

    slashCommand: {
        enabled: true,
        ephemeral: true,

        options: [
            {
                name: 'status',
                description: 'checa pela configuração do automod',
                type: ApplicationCommandOptionType.Subcommand
            },

            {
                name: 'strikes',
                description: 'seta o número máximo de strikes que um membro pode receber antes de tomar uma atitude',
                type: ApplicationCommandOptionType.Subcommand,

                options: [
                    {
                        name: 'amount',
                        description: 'número de strikes (padrão: 5)',
                        required: true,
                        type: ApplicationCommandOptionType.Integer
                    }
                ]
            },

            {
                name: 'action',
                description: 'definir a ação a ser executada após receber golpes máximos',
                type: ApplicationCommandOptionType.Subcommand,

                options: [
                    {
                        name: 'action',
                        description: 'ação a executar',

                        type: ApplicationCommandOptionType.String,
                        required: true,

                        choices: [
                            {
                                name: 'TIMEOUT',
                                value: 'TIMEOUT'
                            },

                            {
                                name: 'KICK',
                                value: 'KICK'
                            },

                            {
                                name: 'BAN',
                                value: 'BAN'
                            }
                        ]
                    }
                ]
            },

            {
                name: 'debug',
                description: 'ativa/desativa automod para mensagens enviadas por administradores e moderadores',
                type: ApplicationCommandOptionType.Subcommand,

                options: [
                    {
                        name: 'status',
                        description: 'status de configuração',
                        required: true,
                        type: ApplicationCommandOptionType.String,

                        choices: [
                            {
                                name: 'ON',
                                value: 'ON'
                            },

                            {
                                name: 'OFF',
                                value: 'OFF'
                            }
                        ]
                    }
                ]
            },

            {
                name: 'whitelist',
                description: 'ver canais que estão na whitelist',
                type: ApplicationCommandOptionType.Subcommand
            },

            {
                name: 'whitelistadd',
                description: 'adiciona um canal para a whitelist',
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: 'channel',
                        description: 'canal que será adicionado',
                        required: true,
                        type: ApplicationCommandOptionType.Channel,

                        channelTypes: [
                            ChannelType.GuildText
                        ]
                    }
                ]
            },

            {
                name: 'whitelistremove',
                description: 'remove um canal para a whitelist',
                type: ApplicationCommandOptionType.Subcommand,

                options: [
                    {
                        name: 'channel',
                        description: 'canal que será removido',
                        required: true,
                        type: ApplicationCommandOptionType.Channel,

                        channelTypes: [
                            ChannelType.GuildText
                        ]
                    }
                ]
            }
        ]
    },

    async messageRun(message, args, data) {
        const input = args[0].toLowerCase();
        const settings = data.settings;

        let response;

        if (input === 'status') {
            response = await getStatus(settings, message.guild);
        } else if (input === 'strikes') {
            const strikes = args[1];

            if (isNaN(strikes) || Number.parseInt(strikes) < 1) {
                return message.safeReply(
                    'os strikes precisam ser um número válido e maior que 0...'
                );
            }

            response = await setStrikes(settings, strikes);
        } else if (input === 'action') {
            const action = args[1].toUpperCase();

            if (!action || !["TIMEOUT", "KICK", "BAN"].includes(action))
                return message.safeReply(
                    'não é uma ação válida. a ação pode ser um `timeout`/`kick`/`ban`...'
                );

            response = await setAction(
                settings,
                message.guild,
                action
            );
        } else if (input === 'debug') {
            const status = args[1].toLowerCase();

            if (!['on', 'off'].includes(status))
                return message.safeReply('status inválido. o valor deve ser `on/off`...');
                
            response = await setDebug(
                settings,
                status
            );
        }

        // whitelist
        else if (input === 'whitelist') {
            response = getWhitelist(
                message.guild, settings
            );
        }
    }
}