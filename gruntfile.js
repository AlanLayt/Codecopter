module.exports = function(grunt) {
  grunt.initConfig ({
    sass: {
      dist: {
        files: {
          'public/css/gallery.css' : 'dev/sass/gallery.scss',
          'public/css/ide.css' : 'dev/sass/ide.scss',
          'public/css/display.css' : 'dev/sass/display.scss',
          'public/css/search.css' : 'dev/sass/search.scss',
          'public/css/style.css' : 'dev/sass/style.scss',
        }
      }
    },
    svgstore: {
      options: {
        prefix : 'shape-', // This will prefix each <g> ID
      },
      default : {
          files: {
            'public/img/svg-defs.svg': ['dev/svgs/*.svg'],
          }
      }
    },
    watch: {
      source: {
        files: ['dev/sass/**/*.scss','dev/**','views/*'],
        tasks: ['sass','svgstore','concat'],
        options: {
          livereload: true, // needed to run LiveReload
        }
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['dev/js/core.js', 'dev/js/*.js'],
        // the location of the resulting JS file
        dest: 'public/js/core.js'
      }
    },
    uglify: {
      options: {
        mangle: false,
        compress: false,
        beautify: true
      },
      build : {
        files: {
          'public/js/core.js': ['dev/core.js','dev/js/*.js'],
        }
      }
    },
    nodemon: {
      dev: {
        script: './src/app.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-bower-concat');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-svgstore');
  //grunt.registerTask('default', ['sass']);
//  grunt.registerTask('watcher', ['watch']);
  };
