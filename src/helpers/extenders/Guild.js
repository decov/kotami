// consts
const { Guild, ChannelType } = require('discord.js');

const ROLE_MENTION = /<?@?&?(\d{17,20})>?/;
const CHANNEL_MENTION = /<?#?(\d{17,20})>?/;
const MEMBER_MENTION = /<?@?!?(\d{17,20})>?/;

/**
 * obter todos os canias que correspondem à query
 * @param {string} query
 * @param {import('discord.js').GuildChannelTypes[]} type
 */
Guild.prototype.findMatchingChannels = function (query, type = [ChannelType.GuildText, ChannelType.GuildNews]) {
    if (!this || !query || typeof query !== 'string')
        return [];

    const channelManager = this.channels.cache.filter((ch) => type.includes(ch.type));

    const patternMatch = query.match(CHANNEL_MENTION);

    if (patternMatch) {
        const id = patternMatch[1];
        const channel = channelManager.find((r) => r.id === id);

        if (channel)
            return [channel];
    }

    const exact = [];
    const startsWith = [];
    const includes = [];

    channelManager.forEach((ch) => {
        const lowerName = ch.name.toLowerCase();

        if (ch.name === query)
            exact.push(ch);

        if (lowerName.startsWith(query.toLowerCase()))
            startsWith.push(ch);

        if (lowerName.includes(query.toLowerCase()))
            includes.push(ch);
    });

    if (exact.length > 0)
        return exact;

    if (startsWith.length > 0)
        return startsWith;

    if (includes.length > 0)
        return includes;

    return [];
};

/**
 * encontrar todos os cargos que correspondem à query
 * @param {string} query
 */
Guild.prototype.findMatchingRoles = function (query) {
    if (!this || !query || typeof query !== 'string')
        return [];

    const patternMatch = query.match(ROLE_MENTION);

    if (patternMatch) {
        const id = patternMatch[1];
        const role = this.roles.cache.find((r) => r.id === id);

        if (role)
            return [role];
    }

    const exact = [];
    const startsWith = [];
    const includes = [];

    this.roles.cache.forEach((role) => {
        const lowerName = role.name.toLowerCase();

        if (role.name === query)
            exact.push(role);

        if (lowerName.startsWith(query.toLowerCase()))
            startsWith.push(role);

        if (lowerName.includes(query.toLowerCase()))
            includes.push(role);
    });

    if (exact.length > 0)
        return exact;
    
    if (startsWith.length > 0)
        return startsWith;

    if (includes.length > 0)
        return includes;

    return [];
};

/**
 * resolve um membro do servidor pela pesquisa à query
 * @param {string} query
 * @param {boolean} exact
 */
Guild.prototype.resolveMember = async function (query, exact = false) {
    if (!query || typeof query !== 'string')
        return;

    // checar se o mencionado ou se o id é passado
    const patternMatch = query.match(MEMBER_MENTION);

    if (patternMatch) {
        const id = patternMatch[1];
        const fetched = await this.members.fetch({ user: id }).catch(() => {});

        if (fetched)
            return fetched;
    }

    // capturar e armazenar os membros da api
    await this.members.fetch({ query }).catch(() => {});

    // checar se a tag exata é correspondida
    const matchingTags = this.members.cache.filter((mem) => mem.user.tag === query);

    if (matchingTags.size === 1)
        return matchingTags.first();

    // checar por usernames correspondidos
    if (!exact) {
        return this.members.cache.find(
            (x) =>
                x.user.username === query ||
                x.user.username.toLowerCase().includes(query.toLowerCase()) ||
                x.displayName.toLowerCase().includes(query.toLowerCase())
        );
    }
};

/**
 * capturar estatísticas de membros
 */
Guild.prototype.fetchMemberStats = async function () {
    const all = await this.members.fetch({
        force: false,
        cache: false
    });

    const total = all.size;
    const bots = all.filter((mem) => mem.user.id).size;
    const members = total - bots;

    return [total, bots, members];
};