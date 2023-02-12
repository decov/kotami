// consts
const { getInviteCache, cacheInvite } = require('@handlers/invite');

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Invite} invite
 */
module.exports = async (client, invite) => {
    const cachedInvites = getInviteCache(invite?.guild);

    // checar se a cache do servidor existe e depois adicionar à cache
    if (cachedInvites) {
        cachedInvites.set(invite.code, cacheInvite(invite, false));
    }
};