// consts
const
    config = require('@root/config'),
    utils = require('./utils'),
    CheckAuth = require('./auth/CheckAuth');

module.exports.launch = async (client) => {
    /* inicializar aplicativo express */

    const
        express = require('express'),
        session = require('express-session'),
        MongoStore = require('connect-mongo'),
        path = require('path'),

        mongoose = require('@src/database/mongoose'),

        app = express();

    /* routers */
    const
        mainRouter = require('./routes/index'),
        discordAPIRouter = require('./routes/discord'),
        logoutRouter = require('./routes/logout'),
        guildManagerRouter = require('./routes/guild-manager');

    client.states = {};
    client.config = config;

    const db = await mongoose.initializeMongoose();

    /* configuração de aplicativo */
    app
        .use(express.json())
        .use(express.urlencoded({ extended: true }))
        .use(express.static(path.join(__dirname, '/public')))
        
        .engine('html', require('ejs').renderFile)

        .set('view engine', 'ejs')
        .set('views', path.join(__dirname, '/views'))
        .set('port', config.DASHBOARD.port)

        .use(
            session({
                secret: process.env.SESSION_PASSWORD,
                cookie: { maxAge: 336 * 60 * 60 * 1000 },
                name: 'djs_connection_cookie',
                resave: true,
                saveUninitialized: false,
                store: MongoStore.create({
                    client: db.getClient(),
                    dbName: db.name,
                    collectionName: "sessions",
                    stringify: false,
                    autoRemove: "interval",
                    autoRemoveInterval: 1
                })
            })
        )

        .use(async function (req, res, next) {
            req.user = req.session.user;
            req.client = client;

            if (req.user && req.url !== '/')
                req.userInfos = await utils.fetchUser(req.user, req.client);

            next();
        })

        .use('/api', discordAPIRouter)
        .use('/logout', logoutRouter)
        .use('/manage', guildManagerRouter)

        .use('/', mainRouter)

        .use(CheckAuth, function (req, res) {
            res.status(404).render('404', {
                user: req.userInfos,

                currentURL: `${req.protocol}://${req.get('host')}${req.originalUrl}`
            });
        })

        .use(CheckAuth, function (err, req, res) {
            console.error(err.stack);

            if (!req.user) return res.redirect("/");

            res.status(500).render('500', {
                user: req.userInfos,

                currentURL: `${req.protocol}://${req.get('host')}${req.originalUrl}`
            });
        });

    /* inicializar */
    app.listen(app.get('port'), () => {
        client.logger.success('dashboard está atendendo ao port ' + app.get('port'));
    });
};