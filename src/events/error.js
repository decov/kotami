/**
 * @param {import('@src/structures').BotClient} client
 * @param {Error} error
 */
module.exports = async (client, error) => {
    client.logger.error(`erro de client`, error);
};