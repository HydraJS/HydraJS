module.exports = function (grunt) {

  var readOptionalJSON = function (filepath) {
      var data = {};
      try {
        data = grunt.file.readJSON(filepath);
      } catch (e) {
      }
      return data;
    },
    srcHintOptions = readOptionalJSON('src/.jshintrc'),
    fs = require('fs'),
    swig = require('swig');

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      dist: {
        src: [ "src/Hydra.js" ],
        options: srcHintOptions
      }
    },
    karma: {
      unit: {
        configFile: 'config/karma.conf.js'
      }
    },
    compress: {
      main: {
        options: {
          mode: 'gzip'
        },
        expand: true,
        cwd: 'versions/',
        src: ['hydra.min.js'],
        dest: 'versions/'
      }
    },
    copy: {
      main: {
        files: [
          {expand: true, cwd: 'src/', src: ['hydra.js'], dest: 'versions/'}
        ]
      }
    },
    uglify: {
      options: {
        banner: '/*! Hydra.js v<%= pkg.version %> | Date:<%= grunt.template.today("yyyy-mm-dd") %> |' +
          ' License: https://raw.github.com/tcorral/Hydra.js/master/LICENSE|' +
          ' (c) 2009, 2013\n' +
          '//@ sourceMappingURL=hydra.min.map\n' +
          '*/\n',
        preserveComments: "some",
        sourceMap: 'versions/hydra.min.map',
        sourceMappingURL: "hydra.min.map",
        report: "min",
        beautify: {
          ascii_only: true
        },
        compress: {
          hoist_funs: false,
          join_vars: false,
          loops: false,
          unused: false
        },
        mangle: {
          // saves some bytes when gzipped
          except: [ "undefined" ]
        }
      },
      build: {
        src: 'src/Hydra.js',
        dest: 'versions/hydra.min.js'
      }
    },
    release: {
      options: {
        commitMessage: 'Update version <%= version %>',
        tagMessage: '<%= version %>',
        github: {
          repo: 'tcorral/Hydra.js',
          usernameVar: process.env.GITHUB_USERNAME,
          passwordVar: process.env.GITHUB_PASSWORD
        }
      }
    }
  });

  // Load the plugins
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-karma");
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-release-steps');

  grunt.registerTask('readme', 'Creates a README.md from template', function () {
    var done = this.async(),
      oREADMETemplate = swig.compileFile('templates/README.tpl');
    fs.stat('versions/hydra.min.js.gz', function (err, stats) {
      fs.writeFile('README.md', oREADMETemplate({
        version: grunt.file.readJSON('package.json').version,
        size: (stats.size / 1024).toFixed(2),
        description: grunt.file.readJSON('package.json').description,
        repository_type: grunt.file.readJSON('package.json').repository.type,
        repository_url: grunt.file.readJSON('package.json').repository.url.replace('https', 'git'),
        repository_shorten: grunt.file.readJSON('package.json').repository.url.replace('https://github.com/', '')
      }), function (err) {
        if (err) {
          throw err;
        }
        done();
      });
    });
  });
  grunt.registerTask('bower', 'Creates a bower.json from template', function () {
    var done = this.async(),
      oBowerTemplate = swig.compileFile('templates/bower.tpl');
    fs.stat('versions/hydra.min.js.gz', function (err, stats) {
      fs.writeFile('bower.json', oBowerTemplate({
        version: grunt.file.readJSON('package.json').version,
        size: (stats.size / 1024).toFixed(2),
        description: grunt.file.readJSON('package.json').description,
        repository_type: grunt.file.readJSON('package.json').repository.type,
        repository_url: grunt.file.readJSON('package.json').repository.url.replace('https', 'git'),
        repository_shorten: grunt.file.readJSON('package.json').repository.url.replace('https://github.com/', '')
      }), function (err) {
        if (err) {
          throw err;
        }
        done();
      });
    });
  });
  grunt.registerTask('component', 'Creates a component.json from template', function () {
    var done = this.async(),
      oComponentTemplate = swig.compileFile('templates/component.tpl');
    fs.stat('versions/hydra.min.js.gz', function (err, stats) {
      fs.writeFile('component.json', oComponentTemplate({
        version: grunt.file.readJSON('package.json').version,
        size: (stats.size / 1024).toFixed(2),
        description: grunt.file.readJSON('package.json').description,
        repository_type: grunt.file.readJSON('package.json').repository.type,
        repository_url: grunt.file.readJSON('package.json').repository.url.replace('https', 'git'),
        repository_shorten: grunt.file.readJSON('package.json').repository.url.replace('https://github.com/', '')
      }), function (err) {
        if (err) {
          throw err;
        }
        done();
      });
    });
  });
  // Default task(s).
  grunt.registerTask('test', ['jshint', 'karma']);
  grunt.registerTask('default', ['jshint', 'karma', 'uglify', 'compress', 'copy', 'readme', 'bower', 'component']);
  grunt.registerTask('deploy', ['jshint', 'karma', 'uglify', 'compress', 'copy', 'release:bump:patch', 'readme', 'release:add:commit:push:tag:pushTags:npm']);

};