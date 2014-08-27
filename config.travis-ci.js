module.exports = {
      version: '0.1.0'

    , database: {
        name: 'test',
        host: '127.0.0.1',
        port: 27017
    }   
    , app: {
        twitter: "pinittome", 
        limits: {
            card: {
                wait: 0.5
            }
        },
        useOptimised: true
    }
    , captcha : { 
         type: 'none'
     }
}
