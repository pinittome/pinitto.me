var version = require('./package.json').version

module.exports = {
    version: version,

    database: {
        name: process.env.MONGO_NAME,
        host: process.env.MONGO_HOST || '127.0.0.1',
        port: process.env.MONGO_PORT || 27017
    },
    app: {
        analytics: {
            google: process.env.GOOGLE_ANALYTICS
        },
        limits: {
            card: {
                wait: process.env.CARD_CREATE_WAIT || 0.5
            }
        }
        useOptimised: true
    },
    captcha : { 
        type: process.env.CAPTCHA_TYPE || 'none',
        keys: {
            public: process.env.CAPTCHA_PUBLIC,
            private: process.env.CAPTCHA_PRIVATE,
        }
     }
}
