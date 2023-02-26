// consts
const { 
    Client,
    Collection,
    GatewayIntentBits,
    Partials,
    WebhookClient,
    ApplicationCommandType
} = require('discord.js');

const path = require('path');
const { table } = require('table');
const { DiscordTogether } = require('discord-together');

const Logger = require('../helpers/Logger');
const CommandCategory = require('./CommandCategory');
const lavaclient = require('../handlers/lavaclient');
const giveawaysHandler = require('../handlers/giveaway');

const { recursiveReadDirSync } = require('../helpers/Utils');
const { validateCommand, validateContext } = require('../helpers/Validator');
const { schemas } = require('@src/database/mongoose');

module.exports = class BotClient extends Client {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildInvites,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildVoiceStates
            ],

            partials: [
                Partials.User,
                Partials.Message,
                Partials.Reaction
            ],

            allowedMentions: {
                repliedUser: false
            },

            restRequestTimeout: 20000
        });

        // await client.wait(1000) - esperar 1 segundo
        this.wait = require('util').promisify(setTimeout);

        // carregar o arquivo de configuração
        this.config = require('@root/config');

        /**
         * @type {import('@structures/Command')[]}
         */
        this.commands = []; // armazenar comando atual
        this.commandIndex = new Collection(); // armazenar pares alias e arrayIndex

        /**
         * @type {Collection<string, import('@structures/Command')>}
         */
        this.slashCommands = new Collection(); // armazenar comandos slash

        /**
         * @type {Collection<string, import('@structures/BaseContext')>}
         */
        this.contextMenus = new Collection(); // armazenar menus de contexto
        this.counterUpdateQueue = []; // armazenar ids de servidores que necessitam de atualização de contagem

        // inicializar webhook que manda detalhes de entrada/saída
        this.joinLeaveWebhook = process.env.JOIN_LEAVE_LOGS
            ? new WebhookClient({
                url: process.env.JOIN_LEAVE_LOGS
            })
            : undefined;

        // player de música
        if (this.config.MUSIC.ENABLED)
            this.musicManager = lavaclient(this);

        // giveaways
        if (this.config.GIVEAWAYS.ENABLED)
            this.giveawaysManager = giveawaysHandler(this);

        // logger
        this.logger = Logger;

        // banco de dados
        this.database = schemas;

        // discord together
        this.discordTogether = new DiscordTogether(this);
    }

    /**
     * carrega todos os eventos do diretório especificado
     * @param {string} directory
     */
    loadEvents(directory) {
        this.logger.log(`carregando eventos...`);

        let success = 0;
        let failed = 0;

        const clientEvents = [];

        recursiveReadDirSync(directory).forEach((filePath) => {
            const file = path.basename(filePath);

            try {
                const eventName = path.basename(file, '.js');
                const event = require(filePath);
        
                this.on(eventName, event.bind(null, this));

                clientEvents.push([file, '✓']);
        
                delete require.cache[require.resolve(filePath)];

                success += 1;
            } catch (ex) {
                failed += 1;

                this.logger.error(`loadEvent - ${file}`, ex);
            }
        });

        console.log(
            table(clientEvents, {
                header: {
                    alignment: 'center',
                    content: 'client de eventos'
                },

                singleLine: true,

                columns: [
                    {
                        width: 25
                    },
                    {
                        width: 5,
                        alignment: 'center'
                    }
                ]
            })
        );

        this.logger.log(
            `${success + failed} eventos carregados. sucesso (${success}) | erro (${failed})...`
        );
    }

    /**
     * encontrar o comando correspondente ao invoke
     * @param {string} invoke
     * @returns {import('@structures/Command')|undefined}
     */
    getCommand(invoke) {
        const index = this.commandIndex.get(invoke.toLowerCase());

        return
            index !== undefined
                ? this.commands[index]
                : undefined;
    }
}