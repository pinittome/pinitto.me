module.exports = function(grunt) {
  
    var version = require('./package.json').version
    
    var configuration = {
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            allFiles: [
                'Gruntfile.js',
                'src/**/*.js',
                'public/**/*.js',
                'tests/**/*.js',
                'index.js'
            ],
            options: {
                jshintrc: '.jshintrc',
            }
        },
        requirejs: {
            main: {
                options: {
                    baseUrl: './public/js',
                    name: 'main',
                    out: './public/main.' + version + '.js',
                    mainConfigFile: './public/js/main.js',
                    paths: {
                        'socket.io': 'empty:',
                        'requireLib': 'require'
                    },
                    include: [
                        'requireLib'
                    ]
                }
            },
            application: {
                options: {
                    baseUrl: './public/js',
                    name: 'app',
                    out: './public/app.' + version + '.js',
                    mainConfigFile: './public/js/app.js',
                    paths: {
                        'socket.io': 'empty:',
                        'requireLib': 'require'
                    },
                    include: [
                        'requireLib'
                    ]
                }
            },
            css: {
                options: {
                    cssIn: './public/style/main.css',
                    out: './public/app.' + version + '.css',
                    optimizeCss: 'standard'
                }
            }
        }
    }

    grunt.initConfig(configuration)

    // Load the plugins
    grunt.loadNpmTasks('grunt-contrib-jshint')
    grunt.loadNpmTasks('grunt-contrib-requirejs')
    grunt.loadNpmTasks('grunt-nsp-package')

    // Configure tasks
    grunt.registerTask('default', ['build'])
    grunt.registerTask('checkstyle', [ 'jshint' ])
    grunt.registerTask('test', ['build', 'validate-package'])
    grunt.registerTask('build', [ 'requirejs:main', 'requirejs:application', 'requirejs:css' ])
}
