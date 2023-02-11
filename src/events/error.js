/**
 * @param {import('@src/structures').BotClient} client
 * @param {Error} error
 */
module.exports = async (client, error) => {
    client.logger.error(`client error`, error);
};