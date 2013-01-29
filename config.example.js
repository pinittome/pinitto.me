module.exports = {
    version: '0.1.0',

    database: {
        name: 'test',
        host: '127.0.0.1',
        port: 27017
    },
    /* Socket.io transports to use - comment for all excluding flashsocket */
    transports: [],
    
    app: {
        twitter: "pinittome", 
        analytics: {
            google: 'UA-XXXX-XX' 
        },
            limits: {
                card: {
                    wait: 0.5
                }
            }
    }
};
