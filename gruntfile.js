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
        tasks: ['sass','svgstore'],
        options: {
          livereload: true, // needed to run LiveReload
        }
      }
    },
    bower_concat: {
      all: {
        dest: 'dev/bower/js/bower.js',
        cssDest: 'dev/bower/css/dep.css',
        exclude: [
        ],
        dependencies: {
        },
        bowerOptions: {
          relative: false
        }
      }
    },
    uglify: {
      bower: {
        options: {
          mangle: true,
          compress: true
        },
        files: {
          'public/js/dep.js': 'dev/bower/js/bower.js'
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
  grunt.loadNpmTasks('grunt-svgstore');
  //grunt.registerTask('default', ['sass']);
//  grunt.registerTask('watcher', ['watch']);
  };
