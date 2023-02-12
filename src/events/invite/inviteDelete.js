// consts
const { getInviteCache, cacheInvite } = require('@handlers/invite');

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Invite} invite
 */
module.exports = async (client, invite) => {
    const cachedInvites = getInviteCache(invite?.guild);

    // checar se o código de convite existe na cache
    if (cachedInvites && cachedInvites.get(invite.code)) {
        cachedInvites.get(invite.code).deletedTimestamp = Date.now();
    }
};