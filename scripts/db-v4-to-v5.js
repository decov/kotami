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

/**
 * migrar coleção de mod-logs da v4 para v5
 * @param {mongoose.Collection<mongoose.Document>[]} collection
 */
const migrateGuilds = async (collections) => {
    process.stdout.write('migrando coleção "guilds"...');

    try {
        const guildsC = collections.find((c) => c.collectionName === 'guilds');

        const toUpdate = await guildsC
            .find({
                $or: [
                    {
                        'data.owner': { 
                            $type: "object" 
                        }
                    },
                    {
                        "automod.strikes": 5 
                    },
                    {
                        "automod.action": "MUTE" 
                    },
                    {
                        "automod.anti_scam": { 
                            $exists: true 
                        } 
                    },
                    {
                        "max_warn.strikes": 5 
                    },
                    {
                        ranking: { 
                            $exists: true 
                        } 
                    }
                ]
            })
            .toArray();
    
        if (toUpdate.length > 0) {
            for (const doc of toUpdate) {
                if (typeof doc.data.owner === 'object')
                    doc.data.owner = doc.data.owner.id;

                if (typeof doc.automod === 'object') {
                    if (doc.automod.strikes === 5)
                        doc.automod.strikes = 10;

                    if (doc.automod.action === 'MUTE')
                        doc.automod.action = 'TIMEOUT';

                    doc.automod.anti_spam = doc.automod.anti_scam || false;
                }

                if (typeof doc.max_warn === 'object') {
                    if (doc.max_warn.action === 'MUTE')
                        doc.automod.action = 'TIMEOUT';

                    if (doc.max_warn.action === 'BAN')
                        doc.automod.action = 'KICK';
                }

                if (typeof doc.stats !== 'object')
                    doc.stats = {};

                if (doc.ranking?.enabled)
                    doc.stats.enabled = true;

                await guildsC.updateOne(
                    {
                        _id: doc._id 
                
                    },
                    { 
                        $set: doc 
                    }
                );
        
                process.stdout.clearLine();
                process.stdout.cursorTo(0);

                process.stdout.write(
                    `migrando coleção "guilds" collection | completo - ${Math.round(
                        (toUpdate.indexOf(doc) / toUpdate.length) * 100
                    )}%...`
                );
            }
    
            await guildsC.updateMany(
                {},
                {
                    $unset: {
                        'automod.anti_scam': '',
                        'automod.max_mentions': '',
                        'automod.max_role_mentions': '',

                        ranking: ''
                    }
                }
            );
    
            clearAndLog(`migrando coleção 'guilds' | atualizado: ${toUpdate.length}...`);
        } else {
            clearAndLog('migrando coleção "guilds" | sem atualizações necessárias...');
        }
    } catch (ex) {
        clearAndLog('migrando coleção "guilds" | ocorreu um erro...');

        console.log(ex);
    }
};

/**
 * migrar coleção mod-logs da v4 para a v5
 * @param {mongoose.Collection<mongoose.Document>[]} collection
 */
const migrateModLogs = async (collections) => {
    process.stdout.write('migrando coleção "mod-logs"...');

    try {
        const modLogs = collections.find((c) => c.collectionName === 'mod-logs');

        const stats = await modLogs.updateMany(
            {}, { 
                $unset: { 
                    expires: '' 
                } 
            }
        );

        await modLogs.updateMany(
            { 
                type: 'MUTE' 
            },
            { 
                $set: { 
                    type: 'TIMEOUT' 
                } 
            }
        );

        await modLogs.updateMany(
            { 
                type: 'UNMUTE' 
            }, 
            { 
                $set: { 
                    type: 'UNTIMEOUT' 
                } 
            }
        );

        console.log(`| ${stats.modifiedCount > 0 ? `atualizado: ${stats.modifiedCount}` : 'sem atualizações necessárias...'}`);
    } catch (ex) {
        clearAndLog('migrando coleção "mod-logs" | ocorreu um erro...');
        
        console.log(ex);
    }
};

/**
 * migrar coleção de translate-logs da v4 para a v5
 * @param {mongoose.Collection<mongoose.Document>[]} collections
 */
const migrateTranslateLogs = async (collections) => {
    process.stdout.write('migrando coleção "translate-logs"...');

    console.log('| sem atualizações necessárias...');
};