module.exports = (grunt) ->
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-watch'

  grunt.initConfig
    coffee:
      game:
        expand: true
        cwd: 'src/'
        src: ['**/*.coffee']
        dest: 'js/'
        ext: '.js'
        options:
          join: false
          sourceMap: true

    copy:
      game:
        expand: true
        src: ['src/**']
        dest: 'js/'

    watch:
      coffee:
        files: [
          'src/*.coffee'
        ]
        tasks: ['coffee', 'copy:game']

  grunt.registerTask 'default', ['coffee']