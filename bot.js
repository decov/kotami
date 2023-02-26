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