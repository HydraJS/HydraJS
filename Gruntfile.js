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
    pkg = grunt.file.readJSON('package.json');

  // Project configuration.
  grunt.initConfig({
    pkg: pkg,
    jshint: {
      dist: {
        src: [ "src/Hydra.js" ],
        options: srcHintOptions
      }
    },
    compile_templates_hydra: {
      devel: {
        base: __dirname,
        templates: {
          folder: 'templates',
          files: [
            {
              src: 'bower.tpl',
              dest: 'bower.json'
            },
            {
              src: 'component.tpl',
              dest: 'component.json'
            },
            {
              src: 'README.tpl',
              dest: 'README.md'
            }
          ]
        },
        file: 'versions/hydra.min.js.gz',
        variables: {
          version: pkg.version,
          description: pkg.description,
          repository_type: pkg.repository.type,
          repository_url: pkg.repository.url.replace('https', 'git'),
          repository_shorten: pkg.repository.url.replace('https://github.com/', '')
        }
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
      },
      doc_zip: {
        options: {
          mode: 'zip',
          archive: '../HydraJS_Web/downloads/apis/Hydra.js_API_v' + pkg.version + '.zip'
        },
        expand: true,
        cwd: '../HydraJS_Web/',
        src: ['apis/Hydra.js_API_v' + pkg.version + '/**']
      },
      doc_tar: {
        options: {
          mode: 'tar',
          archive: '../HydraJS_Web/downloads/apis/Hydra.js_API_v' + pkg.version + '.tar.gz'
        },
        expand: true,
        cwd: '../HydraJS_Web/',
        src: ['apis/Hydra.js_API_v' + pkg.version + '/**']
      }
    },
    copy: {
      main: {
        files: [
          {expand: true, cwd: 'src/', src: ['hydra.js'], dest: 'versions/'}
        ]
      }
    },
    jsdoc : {
      dist : {
        src: ['src/Hydra.js', 'README.md'],
        options: {
          destination: '../HydraJS_Web/apis/Hydra.js_API_v' + pkg.version,
          template: "./node_modules/grunt-jsdoc/node_modules/ink-docstrap/template",
          configure: "./node_modules/grunt-jsdoc/node_modules/ink-docstrap/template/jsdoc.conf.json"
        }
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
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-compile-templates-hydra');

  // Default task(s).
  grunt.registerTask('test', ['jshint', 'karma']);
  grunt.registerTask('document', ['jsdoc', 'compress:doc_zip', 'compress:doc_tar', 'compile_templates_hydra']);
  grunt.registerTask('default', ['test', 'uglify', 'copy', 'compress:main', 'document']);
  grunt.registerTask('deploy', ['test', 'uglify', 'copy', 'jsdoc', 'compress', 'release:bump:patch', 'compile_templates_hydra', 'release:add:commit:push:tag:pushTags:npm']);

};