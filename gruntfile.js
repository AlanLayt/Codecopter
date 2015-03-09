module.exports = function(grunt) {
  grunt.initConfig ({
    sass: {
      dist: {
        files: {
          'public/css/gallery.css' : 'dev/sass/gallery.scss',
          'public/css/ide.css' : 'dev/sass/ide.scss',
          'public/css/display.css' : 'dev/sass/display.scss',
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
  });

  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-svgstore');
  //grunt.registerTask('default', ['sass']);
//  grunt.registerTask('watcher', ['watch']);
  };
