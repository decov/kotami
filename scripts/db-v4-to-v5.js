// consts
require('dotenv').config();

const mongoose = require('mongoose');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const warningMsg = `---------------
!!! aviso !!!
---------------
esse script vai migrar a versão do seu banco de dados da v4 para a v5. esse script ainda assim é um trabalho em progresso e é irreversível.
por favor, certifique-se de que você tenha um backup do seu banco de dados antes de proceder.
você deseja continuar? (y/n): `;

rl.question(warningMsg, async function (name) {
    try {
        if (name.toLowerCase() === 'y') {
            console.log('inicializando migração (v4 para v5)...');

            await migration();

            console.log('migração completa...');

            process.exit(0);
        } else {
            console.log('migração cancelada...');

            process.exit(0);
        }
    } catch (ex) {
        console.log(ex);

        process.exit(1);
    }
});

async function migration() {
    // conectar ao banco de dados
    await mongoose.connect(process.env.MONGO_CONNECTION, { keepAlive: true });

    console.log('conexão com o banco de dados estabelecida...');

    // obter todas as collections
    const collections = await mongoose.connection.db.collections();

    console.log(`${collections.length} collections encontradas...`);

    await migrateGuilds(collections);
    await migrateModLogs(collections);
    await migrateTranslateLogs(collections);
    await migrateSuggestions(collections);
    await migrateMemberStats(collections);
    await migrateMembers(collections);
    await migrateUsers(collections);
    await migrateMessages(collections);
}

const clearAndLog = (message) => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);

    console.log(message);
};