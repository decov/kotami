// consts
const { ApplicationCommandType } = require('discord.js');

const permissions = require('./permissions');
const config = require('@root/config');
const CommandCategory = require('@structures/CommandCategory');

const {
    log,
    warn,
    error
} = require('./Logger');

module.exports = class Validator {
    static validateConfiguration() {
        log('validando arquivo de configuração e variáveis de ambiente...');

        // token do bot
        if (!process.env.BOT_TOKEN) {
            error('env: o token do bot (BOT_TOKEN) está indefinido...');

            process.exit(1);
        }

        // validar configuração de banco de dados
        if (!process.env.MONGO_CONNECTION) {
            error('env: a conexão com o banco de dados (MONGO_CONNECTION) está indefinida...');

            process.exit(1);
        }

        // validar configuração de dashboard
        if (config.DASHBOARD.enabled) {
            if (!process.env.BOT_SECRET) {
                error('env: o bot secret (BOT_SECRET) está indefinido...');

                process.exit(1);
            }

            if (!process.env.SESSION_PASSWORD) {
                error('env: a senha de sessão (SESSION_PASSWORD) está indenifida...');

                process.exit(1);
            }

            if (!config.DASHBOARD.baseURL || !config.DASHBOARD.failureURL || !config.DASHBOARD.port) {
                error('config.js: os detalhes do dashboard (DASHBOARD) estão indefinidos...');

                process.exit(1);
            }
        }

        // tamanho de cache
        if (isNaN(config.CACHE_SIZE.GUILDS) || isNaN(config.CACHE_SIZE.USERS) || isNaN(config.CACHE_SIZE.MEMBERS)) {
            error('config.js: o tamanho da cache (CACHE_SIZE) precisa ser um inteiro positivo...');

            process.exit(1);
        }

        // música
        if (config.MUSIC.ENABLED) {
            if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
                warn('env: as variáveis SPOTIFY_CLIENT_ID ou SPOTIFY_CLIENT_SECRET estão ausentes. links para músicas do spotify não funcionarão...');
            }

            if (config.MUSIC.LAVALINK_NODES.length == 0) {
                warn('config.js: deve haver pelo menos um node para o lavalink...');
            }

            if (!['YT', 'YTM', 'SC'].includes(config.MUSIC.DEFAULT_SOURCE)) {
                warn('config.js: o valor da variável MUSIC.DEFAULT_SOURCE precisa ser YT, YTM ou SC...');
            }
        }

        // avisos
        if (config.OWNER_IDS.length === 0)
            warn('config.js: a área para id(s) de dono(s) do bot (OWNER_IDS) está vazia...');

        if (!config.SUPPORT_SERVER)
            warn('config.js: o servidor de suporte (SUPPORT_SERVER) não está definido...');

        if (!process.env.WEATHERSTACK_KEY)
            warn('env: a chave do weatherstack (WEATHERSTACK_KEY) está ausente. o comando de clima (weather) não funcionará...');

        if (!process.env.STRANGE_API_KEY)
            warn('env: a chave de strange api (STRANGE_API_KEY) está ausente. comandos de imagens não funcionarão...');
    }

    /**
     * @param {import('@structures/Command')} cmd
     */
    static validateCommand(cmd) {
        if (typeof cmd !== 'object') {
            throw new TypeError('os dados do comando precisam ser um objeto...');
        }

        if (typeof cmd.name !== 'string' || cmd.name !== cmd.name.toLowerCase()) {
            throw new Error('o nome do comando deve ser uma string minúscula...');
        }

        if (typeof cmd.description !== 'string') {
            throw new TypeError('a descrição do comando deve ser uma string...');
        }

        if (cmd.cooldown && typeof cmd.cooldown !== 'number') {
            throw new TypeError('o cooldown de comando deve ser um número...');
        }

        if (cmd.category) {
            if (!Object.prototype.hasOwnProperty.call(CommandCategory, cmd.category)) {
                throw new Error(`${cmd.category} não é uma categoria válida...`);
            }
        }

        if (cmd.userPermissions) {
            if (!Array.isArray(cmd.userPermissions)) {
                throw new TypeError('o comando userPermissions deve ser um array de strings da chave de permissão...');
            }

            for (const perm of cmd.userPermissions) {
                if (!permissions[perm]) throw new RangeError(`comando userPermission inválido: ${perm}...`);
            }
        }

        if (cmd.botPermissions) {
            if (!Array.isArray(cmd.botPermissions)) {
                throw new TypeError('o comando botPermissions deve ser um array de strings da chave de permissão...');
            }

            for (const perm of cmd.botPermissions) {
                if (!permissions[perm]) throw new RangeError(`comando botPermission inválido: ${perm}...`);
            }
        }

        if (cmd.validations) {
            if (!Array.isArray(cmd.validations)) {
                throw new TypeError('as validações de comando devem ser um array de objects de validação...');
            }

            for (const validation of cmd.validations) {
                if (typeof validation !== 'object') {
                    throw new TypeError('validação de comando deve ser um objeto...');
                }

                if (typeof validation.callback !== 'function') {
                    throw new TypeError('callback da validação de comando deve ser uma função...');
                }

                if (typeof validation.message !== 'string') {
                    throw new TypeError('mensagem da validação de comando deve ser uma string...');
                }
            }
        }

        // validar detalhes de comando
        if (cmd.command) {
            if (typeof cmd.command !== 'object') {
                throw new TypeError('command.command deve ser um objeto...');
            }

            if (Object.prototype.hasOwnProperty.call(cmd.command, 'enabled') && typeof cmd.command.enabled !== 'boolean') {
                throw new TypeError('command.command enabled deve ser um valor booleano...');
            }

            if (
                cmd.command.aliases && (!Array.isArray(cmd.command.aliases) || cmd.command.aliases.some((ali) => typeof ali !== 'string' || ali !== ali.toLowerCase()))
            ) {
                throw new TypeError('os aliases de command.command devem ser um array de strings minúsculas...');
            }

            if (cmd.command.usage && typeof cmd.command.usage !== 'string') {
                throw new TypeError('o uso de command.command deve ser uma string...');
            }

            if (cmd.command.minArgsCount && typeof cmd.command.minArgsCount !== 'number') {
                throw new TypeError('minArgsCount de command.command deve ser um número...');
            }

            if (cmd.command.subcommands && !Array.isArray(cmd.command.subcommands)) {
                throw new TypeError('os subcomandos de command.command devem ser um array...');
            }

            if (cmd.command.subcommands) {
                for (const sub of cmd.command.subcommands) {
                    if (typeof sub !== 'object') {
                        throw new TypeError('os subcomandos de command.command devem ser um array de objetos...');
                    }

                    if (typeof sub.trigger !== 'string') {
                        throw new TypeError('o aviso de subcomando de command.command deve ser uma string...');
                    }

                    if (typeof sub.description !== 'string') {
                        throw new TypeError('a descrição de subcomando de command.command deve ser uma string...');
                    }
                }
            }

            if (cmd.command.enabled && typeof cmd.messageRun !== 'function') {
                throw new TypeError('função messageRun está ausente...');
            }
        }

        // validar detalhes do comando de barra
        if (cmd.slashCommand) {
            if (typeof cmd.slashCommand !== 'object') {
                throw new TypeError('Command.slashCommand must be an object...');
            }

            if (
                Object.prototype.hasOwnProperty.call(cmd.slashCommand, 'enabled') && typeof cmd.slashCommand.enabled !== 'boolean'
            ) {
                throw new TypeError("Command.slashCommand enabled must be a boolean value...");
            }

            if (
                Object.prototype.hasOwnProperty.call(cmd.slashCommand, 'ephemeral') && typeof cmd.slashCommand.ephemeral !== 'boolean'
            ) {
                throw new TypeError("Command.slashCommand ephemeral must be a boolean value...");
            }

            if (cmd.slashCommand.options && !Array.isArray(cmd.slashCommand.options)) {
                throw new TypeError("Command.slashCommand options must be a array...");
            }

            if (cmd.slashCommand.enabled && typeof cmd.interactionRun !== "function") {
                throw new TypeError("Missing 'interactionRun' function...");
            }
        }
    }
}