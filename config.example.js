module.exports = {
      version: '0.1.0'

    , database: {
        name: 'test',
        host: '127.0.0.1',
        port: 27017
    }

    /* Socket.io transports to use - comment for all excluding flashsocket */
    /* , transports: [] */

    /* Main application configuration - webclient */    
    , app: {
        twitter: "pinittome", 
        analytics: {
            google: 'UA-XXXX-XX' 
        },
        limits: {
            card: {
                wait: 0.5
            }
        }
        /* useOptimised: true */
    }

    /* Captcha to use on board create - default to 'captcha'
     *   valid values are:
     *     - none
     *     - captcha (doesn't require external connection)
     *     - recaptcha 
     */ 
    /* captcha : { 
     *     type: 'recaptcha',
     *     keys: {
     *         // only required for recaptcha
     *         public: '',
     *         private: '',
     *     }
     * }
};
