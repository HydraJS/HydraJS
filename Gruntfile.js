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
      options: {
        variables: {
          version: pkg.version,
          description: pkg.description,
          repository_type: pkg.repository.type,
          repository_url: pkg.repository.url.replace('https', 'git'),
          repository_shorten: pkg.repository.url.replace('https://github.com/', '')
        }
      },
      base: {
        files: {
          '<%= compress.main.dest %>hydra.js': '<%= jshint.dist.src[0] %>'
        }
      },
      devel: {
        options: {
          file: '<%= compress.main.dest%><%= compress.main.src%>.gz'
        },
        files: {
          'bower.json': 'templates/bower.tpl',
          'component.json': 'templates/component.tpl',
          'README.md': 'templates/README.tpl'
        }
      }
    },
    compress: {
      main: {
        options: {
          mode: 'gzip'
        },
        expand: true,
        cwd: 'versions/',
        src: 'hydra.min.js',
        dest: 'versions/'
      }
    },
    karma: {
      unit: {
        configFile: 'config/karma.conf.js'
      }
    },
    uglify: {
      options: {
        sourceMappingURL: "hydra.min.map",
        sourceMap: '<%= compress.main.dest %><%= uglify.options.sourceMappingURL%>',
        banner: '/*! Hydra.js v<%= pkg.version %> | Date:<%= grunt.template.today("yyyy-mm-dd") %> |' +
          ' License: https://raw.github.com/tcorral/Hydra.js/master/LICENSE|' +
          ' (c) 2009, 2013\n' +
          '//@ sourceMappingURL=<%= uglify.options.sourceMappingURL%>\n' +
          '*/\n',
        preserveComments: "some",
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
        src: '<%= compress.main.dest %>hydra.js',
        dest: '<%= compress.main.dest %><%= compress.main.src %>'
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
  grunt.loadNpmTasks('grunt-release-steps');
  grunt.loadNpmTasks('grunt-compile-templates-hydra');

  // Default task(s).
  grunt.registerTask('test', ['jshint', 'karma']);
  grunt.registerTask('default', ['test', 'compile_templates_hydra:base', 'uglify', 'compress:main', 'compile_templates_hydra:devel' ]);
  grunt.registerTask('deploy', ['test', 'compile_templates_hydra:base', 'uglify', 'compress', 'release:bump:patch', 'compile_templates_hydra:devel', 'release:add:commit:push:tag:pushTags:npm']);

};