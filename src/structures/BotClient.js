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