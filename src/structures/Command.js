/**
 * @typedef {Object} Validation
 * @property {function} callback
 * @property {string} message
 */

/**
 * @typedef {Object} SubCommand
 * @property {string} trigger
 * @property {string} description
 */

/**
 * @typedef {"ADMIN"|"ANIME"|"AUTOMOD"|"ECONOMY"|"FUN"|"IMAGE"|"INFORMATION"|"INVITE"|"MODERATION"|"ERELA_JS"|"NONE"|"OWNER"|"SOCIAL"|"SUGGESTION"|"TICKET"|"UTILITY"} CommandCategory
 */

/**
 * @typedef {Object} InteractionInfo
 * @property {boolean} enabled
 * @property {boolean} ephemeral
 * @property {import('discord.js').ApplicationCommandOptionData[]} options
 */

/**
 * @typedef {Object} CommandInfo
 * @property {boolean} enabled
 * @property {string[]} [aliases]
 * @property {string} [usage=""]
 * @property {number} [minArgsCount=0]
 * @property {SubCommand[]} [subcommands=[]]
 */

/**
 * @typedef {Object} CommandData
 * @property {string} name
 * @property {string} description
 * @property {number} cooldown
 * @property {CommandCategory} category
 * @property {import('discord.js').PermissionResolvable[]} [botPermissions]
 * @property {import('discord.js').PermissionResolvable[]} [userPermissions]
 * @property {Validation[]} [validations]
 * @property {CommandInfo} command
 * @property {InteractionInfo} slashCommand
 * @property {function(import('discord.js').Message, string[], object)} messageRun
 * @property {function(import('discord.js').ChatInputCommandInteraction, object)} interactionRun
 */

/**
 * espaço reservado para dados de comando
 * @type {CommandData}
 */
module.exports = {
    name: "",
    description: "",

    cooldown: 0,
    
    isPremium: false,

    category: "NONE",

    botPermissions: [],
    userPermissions: [],
    validations: [],

    command: {
        enabled: true,
        aliases: [],
        usage: "",
        minArgsCount: 0,
        subcommands: []
    },

    slashCommand: {
        enabled: true,
        ephemeral: false,
        options: []
    },

    messageRun: (message, args, data) => {},
    interactionRun: (interaction, data) => {}
};