// consts
const { getJson } = require('@helpers/HttpUtils');
const { success, warn, error } = require('@helpers/Logger');

module.exports = class BotUtils {
    // checar se o bot está atualizado
    static async checkForUpdates() {
        const response = await getJson('https://api.github.com/repos/saiteja-madha/discord-js-bot/releases/latest');

        if (!response.success)
            return error('check de versão: falha ao checar por atualizações do bot...');

        if (response.data) {
            if (
                require('@root/package.json').version.replace(/[^0-9]/g, "") >= response.data.tag_name.replace(/[^0-9]/g, "")
            ) {
                success('check de versão: seu bot do discord está atualizado...');
            } else {
                warn(`check de versão: ${response.data.tag_name} atualização disponível...`);

                warn('download: https://github.com/saiteja-madha/discord-js-bot/releases/latest');
            }
        }
    }

    /**
     * obter o url da imagem da mensagem
     * @param {import('discord.js').Message} message
     * @param {string[]} args
     */
    static async getImageFromMessage(message, args) {
        let url;

        // checar por anexo
        if (message.attachments.size > 0) {
            const attachment = message.attachments.first();
            const attachUrl = attachment.url;

            const attachIsImage = attachUrl.endsWith('.png') || attachUrl.endsWith('.jpg') || attachUrl.endsWith('.jpeg');

            if (attachIsImage)
                url = attachUrl;
        }

        if(!url && args.length === 0)
            url = message.author.displayAvatarURL({
                size: 256,
                extension: 'png'
            });

        if (!url && args.length !== 0) {
            try {
                url = new URL(args[0]).href;
            } catch (ex) {
                // ignorar
            }
        }

        if (!url && message.mentions.users.size > 0) {
            url = message.mentions.users.first().displayAvatarURL({
                size: 256,
                extension: 'png'
            });
        }

        if (!url) {
            const member = await message.guild.resolveMember(args[0]);

            if (member)
                url = member.user.displayAvatarURL({
                    size: 256,
                    extension: 'png'
                });
        }

        if (!url)
            url = message.author.displayAvatarURL({
                size: 256,
                extension: 'png'
            });
        
        return url;
    }

    static get musicValidations() {
        return [
            {
                callback: ({
                    client,
                    guildId
                }) => client.musicManager.getPlayer(guildId),

                message: 'nenhuma música está sendo tocada...'
            },
            {
                callback: ({
                    member
                }) => member.voice?.channelId,

                message: 'você precisa estar em um canal de voz...'
            },
            {
                callback: ({
                    member,
                    client,
                    guildId
                }) => member.voice?.channelId === client.musicManager.getPlayer(guildId)?.channelId,

                message: 'você não está no mesmo canal de voz...'
            }
        ];
    }
};