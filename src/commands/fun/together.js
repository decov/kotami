// consts
const { ApplicationCommandOptionType } = require('discord.js');

const discordTogether = [
    'askaway',
    'awkword',
    'betrayal',
    'bobble',
    'checkers',
    'chess',
    'chessdev',
    'doodlecrew',
    'fishing',
    'land',
    'lettertile',
    'meme',
    'ocho',
    'poker',
    'puttparty',
    'puttpartyqa',
    'sketchheads',
    'sketchyartist',
    'spellcast',
    'wordsnack',
    'youtube',
    'youtubedev'
];

/**
 * @type {import('@structures/Command')}
 */
module.exports = {
    name: 'together',
    description: 'use para jogar e interagir com o discord together',
    category: 'FUN',
    botPermissions: [
        'EmbedLinks'
    ],
    
    command: {
        enabled: true,
        minArgsCount: 1,
        aliases: ['discordtogether'],
        usage: '<game>'
    },

    slashCommand: {
        enabled: true,

        options: [
            {
                name: 'type',
                description: 'tipo do game que você deseja do discord together',
                type: ApplicationCommandOptionType.String,
                required: true,
                choices: discordTogether.map((game) => ({
                    name: game,
                    value: game
                }))
            }
        ]
    },

    async messageRun(message, args) {
        const input = args[0];

        const response = await getTogetherInvite(message.member, input);

        await message.safeReply(response);
    },

    async interactionRun(interaction) {
        const choice = interaction.options.getString('type');

        const response = await getTogetherInvite(interaction.member, choice);

        await interaction.followUp(response);
    }
};

async function getTogetherInvite(member, choice) {
    choice = choice.toLowerCase();

    const vc = member.voice.channel?.id;

    if (!vc)
        return 'você precisa estar em um canal de voz para usar este comando...';

    if (!discordTogether.includes(choice)) {
        return `este jogo é inválido. jogos válidos: ${discordTogether.join(", ")}`;
    }

    const invite = await member.client.discordTogether.createTogetherCode(vc, choice);

    return `${invite.code}`;
}