// requires
require('dotenv').config();
require('module-alias/register');

// extenders de registro
require('@helpers/extenders/Message');
require('@helpers/extenders/Guild');
require('@helpers/extenders/GuildChannel');

const { checkForUpdates } = require('@helpers/BotUtils');
const { initializeMongoose } = require('@src/database/mongoose');
const { BotClient } = require('@src/structures');
const { validateConfiguration } = require('@helpers/Validator');

// validar configurações feitas no bot
validateConfiguration();

// inicializando o client
const client = new BotClient();

client.loadCommands('src/commands');
client.loadContexts('src/contexts');
client.loadEvents('src/events');

// encontrar rejeições de promessa não tratadas
process.on(
    'unhandledRejection', (err) => client.logger.error(
        `excessão não tratada...`, err
    )
);

(async () => {
    // checar por updates
    await checkForUpdates();

    // inicializar o dashboard
    if (client.config.DASHBOARD.enabled) {
        client.logger.log('executando dashboard...');

        try {
            const { launch } = require('@root/dashboard/app');

            // dashboard inicializando o banco de dados
            await launch(client);
        } catch (ex) {
            client.logger.error('ocorreu um erro ao tentar executar o dashboard...', ex);
        }
    } else {
        // inicializando o banco de dados
        await initializeMongoose();
    }

    // inicializa o client
    await client.login(
        process.env.BOT_TOKEN
    );
})();