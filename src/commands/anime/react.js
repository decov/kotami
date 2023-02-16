// consts
const { 
    EmbedBuilder,
    ApplicationCommandOptionType
} = require('discord.js');

const NekosLife = require('nekos.life');

const neko = new NekosLife();

const { getJson } = require('@helpers/HttpUtils');
const { EMBED_COLORS } = require('@root/config');

const choices = [
    'hug',
    'kiss',
    'cuddle',
    'feed',
    'pat',
    'poke',
    'slap',
    'smug',
    'tickle',
    'wink'
];

/**
 * @type {import('@structures/Command')}
 */
module.exports = {
    name: 'react',
    description: 'reações contendo ilustrações de anime',

    enabled: true,
    category: 'ANIME',
    cooldown: 1,

    command: {
        enabled: true,
        minArgsCount: 1,
        usage: '[reação]' // [reaction]
    },

    slashCommand: {
        enabled: true,
        
        options: [
            {
                name: 'categoria',
                description: 'escolha o tipo de reação',

                type: ApplicationCommandOptionType.String,

                required: true,

                choices: choices.map((ch) => ({
                    name: ch,
                    value: ch
                }))
            }
        ]
    },

    async messageRun(message, args) {
        const category = args[0].toLowerCase();

        if (!choices.includes(category)) {
            return message.safeReply(`escolha inválida: \`${category}\`...\nreações disponíveis: ${choices.join(", ")}`);
        }

        const embed = await genReaction(category, message.author);

        await message.safeReply({
            embeds: [embed]
        });
    },

    async interactionRun(interaction) {
        const choice = interaction.options.getString('categoria');
        const embed = await genReaction(choice, interaction.user);

        await interaction.followUp({
            embeds: [embed]
        });
    }
};

const genReaction = async (category, user) => {
    try {
        let imageUrl;

        // alguma api aleatória
        if (category === 'wink') {
            const response = await getJson('https://some-random-api.ml/animu/wink');

            if (!response.success)
                throw new Error('erro de api');

            imageUrl = response.data.link;
        }

        // api do neko
        else {
            imageUrl = (await neko[category]()).url;
        }

        return new EmbedBuilder()
            .setImage(imageUrl)
            .setColor('Random')

            .setFooter({
                text: `solicitado por ${user.tag}`
            });
    } catch (ex) {
        return new EmbedBuilder()
            .setColor(EMBED_COLORS.ERROR)
            .setDescription('falha ao capturar meme. tente novamente...')

            .setFooter({
                text: `solicitado por ${user.tag}`
            });
    }
};