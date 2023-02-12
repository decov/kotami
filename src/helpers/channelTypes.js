// consts
const { ChannelType } = require('discord.js');

/**
 * @param {number} type
 */
module.exports = (type) => {
    switch (type) {
        case ChannelType.GuildText:
            return "guild text";
        
        case ChannelType.GuildVoice:
            return "guild voice";

        case ChannelType.GuildCategory:
            return "guild category";

        case ChannelType.GuildAnnouncement:
            return "guild announcement";

        case ChannelType.AnnouncementThread:
            return "guild announcement thread";

        case ChannelType.PublicThread:
            return "guild public thread";

        case ChannelType.PrivateThread:
            return "guild private thread";

        case ChannelType.GuildStageVoice:
            return "guild stage voice";

        case ChannelType.GuildDirectory:
            return "guild directory";

        case ChannelType.GuildForum:
            return "guild forum";

        default:
            return "unknown";
    }
};