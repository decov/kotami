// consts
const {
    EmbedBuilder,
    ApplicationCommandOptionType,
    escapeInlineCode
} = require('discord.js');

const { EMBED_COLORS } = require('@root/config');
const { getInvitesLb } = require('@schemas/Member');
const { getXpLb } = require('@schemas/MemberStats');
const { getReputationLb } = require('@schemas/User');

/**
 * @type {import('@structures/Command')}
 */
module.exports = {
    name: 'leaderboard',
    description: 'mostra o ranking de leaderboard de xp',

    category: 'INFORMATION',

    botPermissions: ['EmbedLinks'],
    
    command: {
        enabled: true,
        aliases: ['lb'],
        minArgsCount: 1,
        usage: '<xp|invite|rep>'
    },

    slashCommand: {
        enabled: true,

        options: [
            {
                name: 'tipo',
                description: 'tipo de leaderboard que será mostrado',

                required: true,

                type: ApplicationCommandOptionType.String,

                choices: [
                    {
                        name: 'xp',
                        value: 'xp'
                    },
                    {
                        name: 'invite',
                        value: 'invite'
                    },
                    {
                        name: 'rep',
                        value: 'rep'
                    }
                ]
            }
        ]
    },

    async messageRun(message, args, data) {
        const type = args[0].toLowerCase();

        let response;

        if (type === 'xp')
            response = await getXpLeaderboard(message, message.author, data.settings);

        else if (type === 'invite')
            response = await getInviteLeaderboard(message, message.author, data.settings);

        else if (type === 'rep')
            response = await getRepLeaderboard(message.author);

        else response = 'tipo de leaderboard inválido. por favor, escolha `xp` ou `invite`...';

        await message.safeReply(response);
    },

    async interactionRun(interaction, data) {
        const type = interaction.options.getString('tipo');

        let response;

        if (type === 'xp')
            response = await getXpLeaderboard(interaction, interaction.user, data.settings);

        else if (type === 'invite')
            response = await getInviteLeaderboard(interaction, interaction.user, data.settings);

        else if (type === 'rep')
            response = await getRepLeaderboard(interaction.user);

        else response = 'tipo de leaderboard inválido. por favor, escolha `xp` ou `invite`...';

        await interaction.followUp(response);
    }
};

// leaderboard de xp
async function getXpLeaderboard({ guild }, author, settings) {
    if (!settings.stats.enabled)
        return 'ranking está desativado neste servidor...';

    const lb = await getXpLb(guild.id, 10);

    if (lb.length === 0)
        return 'o leaderboard não possui usuários...';

    let collector = '';

    for (let i = 0; i < lb.length; i++) {
        try {
            const user = await author.client.users.fetch(lb[i].member_id);

            collector += `**#${(i + 1).toString()}** - ${escapeInlineCode(user.tag)}\n`;
        } catch (ex) {
            // ignorar
        }
    }

    const embed = new EmbedBuilder()
        .setAuthor({
            name: 'leaderboard de xp'
        })

        .setColor(EMBED_COLORS.BOT_EMBED)
        .setDescription(collector)

        .setFooter({
            text: `solicitado por ${author.tag}`
        });

    return {
        embeds: [embed]
    };
}

// leaderboard de invites
async function getInviteLeaderboard({ guild }, author, settings) {
    if (!settings.invite.tracking)
        return 'o rastreamento de convites está desativado neste servidor...';
  
    const lb = await getInvitesLb(guild.id, 10);

    if (lb.length === 0)
        return 'o leaderboard não possui usuários...';
  
    let collector = '';

    for (let i = 0; i < lb.length; i++) {
        try {
            const memberId = lb[i].member_id;

            if (memberId === 'VANITY')
                collector += `**#${(i + 1).toString()}** - vanity url [${lb[i].invites}]\n`;
            else {
                const user = await author.client.users.fetch(lb[i].member_id);

                collector += `**#${(i + 1).toString()}** - ${escapeInlineCode(user.tag)} [${lb[i].invites}]\n`;
            }
        } catch (ex) {
            collector += `**#${(i + 1).toString()}** - DeletedUser#0000 [${lb[i].invites}]\n`;
        }
    }
  
    const embed = new EmbedBuilder()
        .setAuthor({
            name: 'leaderboard de convite'
        })

        .setColor(EMBED_COLORS.BOT_EMBED)
        .setDescription(collector)
        
        .setFooter({
            text: `solicitado por ${author.tag}`
        });
  
    return {
        embeds: [embed]
    };
}

// leaderboard de reputação
async function getRepLeaderboard(author) {
    const lb = await getReputationLb(10);

    if (lb.length === 0)
        return 'o leaderboard não possui usuários...';
  
    const collector = lb
        .map((user, i) => `**#${(i + 1).toString()}** - ${escapeInlineCode(user.username)} (${user.reputation?.received})`)
        .join("\n");
  
    const embed = new EmbedBuilder()
        .setAuthor({
            name: 'leaderboard de reputação'
        })

        .setColor(EMBED_COLORS.BOT_EMBED)
        .setDescription(collector)
        
        .setFooter({
            text: `solicitado por ${author.tag}`
        });
  
    return {
        embeds: [embed]
    };
}