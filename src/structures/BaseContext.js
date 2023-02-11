/**
 * @typedef {Object} ContextData
 * @property {string} name
 * @property {string} description
 * @property {import('discord.js').ApplicationCommandType} type
 * @property {boolean} [enabled]
 * @property {boolean} [ephemeral]
 * @property {boolean} [defaultPermission]
 * @property {import('discord.js').PermissionResolvable[]} [userPermissions]
 * @property {number} [cooldown]
 * @property {function(import('discord.js').ContextMenuCommandInteraction)} run
 */

/**
 * @type {ContextData} data
 */
module.exports = {
    name: "",
    description: "",
    type: "",

    enabled: false,
    ephemeral: false,
    options: true,

    userPermissions: [],
    
    cooldown: 0
};