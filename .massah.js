module.exports = function(yargs) {
    
    yargs.string('browserstack-user')
    yargs.string('browserstack-key')
    yargs.string('runner')
    yargs.string('browser')
    yargs.string('os')
    yargs.string('os-version')
    yargs.string('browser-version')
    yargs.string('resolution')

    return {
        runner: yargs.argv.runner || process.env.MASSAH_RUNNER || 'vanilla',
        headless: false,
        match: {
            grep: yargs.argv['grep'] || process.env.GREP || null,
            invert: yargs.argv['invert'] || process.env.GREP_INVERT || null
        },
        bail: yargs.argv['bail'] || process.env.BAIL || false,
        browserstack: { 
            user: yargs.argv['browserstack-user'] || process.env.BROWSERSTACK_USER,
            key: yargs.argv['browserstack-key'] || process.env.BROWSERSTACK_KEY,
            'local-wait': yargs.argv['browserstack-local-wait'] || process.env.BROWSERSTACK_LOCAL_WAIT
        },
        applicationPort: yargs.argv['bummer-port'] || process.env.BUMMER_PORT || 3001,
        capabilities: {
            browser: yargs.argv.browser || process.env.MASSAH_BROWSER || 'firefox',
            os: yargs.argv.os || process.env.MASSAH_OS,
            os_version: yargs.argv['os-version'] || process.env.MASSAH_OS_VERSION,
            browser_version : yargs.argv['browser-version'] || process.env.MASSAH_BROWSER_VERSION,
            resolution: yargs.argv.resolution || process.env.BROWSERSTACK_RESOLUTION || '1280x1024',
            project: yargs.argv['project'] || process.env.MASSAH_PROJECT,
            build: yargs.argv['build'] || process.env.MASSAH_BUILD
        },
        files: {
            image: yargs.argv['image-filepath'] || process.env.IMAGE_FILEPATH || __dirname+'/test/data/png_file.png',
            text: yargs.argv['text-filepath'] || process.env.TEXT_FILEPATH || __dirname+'/test/data/text_file.txt'
        }   
    }

}