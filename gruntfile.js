module.exports = function(grunt) {
  grunt.initConfig ({
    sass: {
      dist: {
        files: {
          'css/gallery.css' : 'dev/sass/gallery.scss',
          'css/ide.css' : 'dev/sass/ide.scss',
        }
      }
    },
    watch: {
      source: {
        files: ['dev/sass/**/*.scss'],
        tasks: ['sass'],
        options: {
          livereload: true, // needed to run LiveReload
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  //grunt.registerTask('default', ['sass']);
//  grunt.registerTask('watcher', ['watch']);
  };
