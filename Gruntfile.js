module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    compass: {
      dev: {
        options: {
          cssDir: 'css',
          javascriptsDir: 'js',
          imagesDir: 'images',
          sassDir: 'src/sass',
          fontsDir: 'fonts',
          force: true,
          relativeAssets: true,
          outputStyle: 'expanded'
        }
      }
    },
    closureDepsWriter: {
      dev : {
        options:
          closureLibraryPath: ''
        }
      }
    },
    closureCompiler: {

    },
    watch: {
      files: ['src/**/*.scss'],
      tasks: ['compass']
    }
  });

  grunt.loadNpmTasks('grunt-closure-tools');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['compass', 'watch']);
};
