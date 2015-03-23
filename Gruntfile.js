/*global module:false*/


module.exports = function(grunt) {

	var jsFiles = [
		'src/js/DoctoRTCWeb.js',
		'src/js/Html.js',
		'src/js/NetworkTestWidget.js'
	];

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		meta: {
			banner: '(function(window) {\n\n',
			footer: '\n\n\nwindow.DoctoRTCWeb = DoctoRTCWeb;\n}(window));\n\n',

			getHtmlFor: function(element) {
				var fs = require('fs');
				var html = fs.readFileSync('src/html/min/' + element + '.html').toString();
				return JSON.stringify(html);
			}
		},

		concat: {
			js: {
				src: jsFiles,
				dest: 'web/js/<%= pkg.name %>.js',
				options: {
					banner: '<%= meta.banner %>',
					separator: '\n\n',
					footer: '<%= meta.footer %>',
					process: true
				},
				nonull: true
			}
		},

		jshint: {
			src: 'web/js/<%= pkg.name %>.js',
			options: {
				browser: true,
				curly: true,
				devel: true,  // Otherwise 'console.log' is considered an error.
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: false,
				noarg: true,
				sub: true,
				undef: true,
				unused: false,  // TODO: set to true
				boss: true,
				eqnull: true,
				onecase: true,
				supernew: true,
				globals: {
					jQuery: false,
					$: false,
					DoctoRTC: true
				}
			}
		},

		uglify: {
			js: {
				files: {
					'web/js/<%= pkg.name %>.js': ['web/js/<%= pkg.name %>.js']
				}
			},
			options: {
				//banner: ''
			}
		},

		htmlmin: {
			default: {
				files: function() {
					var glob = require('glob');
					var files = {};

					results = glob('*.html', {cwd: 'src/html', sync: true});
					for (var i = 0; i < results.length; i++) {
						files['src/html/min/' + results[i]] = 'src/html/' + results[i];
					}
					return files;
				}(),
				options: {
					removeComments: true,
					removeCommentsFromCDATA: true,
					removeCDATASectionsFromCDATA: true,
					collapseWhitespace: true
				}
			}
		},

		compass: {
			default: {
				options: {
					config: 'src/scss/compass_config.rb',
					environment: 'development',
					outputStyle: 'nested',
					noLineComments: false,
					quiet: false,
					trace: true,
					force: true
				}
			}
		},

		dataUri: {
			default: {
				src: ['web/css/<%= pkg.name %>.css'],
				dest: 'web/css/',
				options: {
					// Specified files are only encoding.
					target: ['src/images/*.*'],
					// Adjust relative path.
					fixDirLevel: true,
					// Image detecting base dir.
					baseDir: './'
				}
			}
		},

		cssmin: {
			default: {
				files: {
					'web/css/<%= pkg.name %>.css': ['web/css/<%= pkg.name %>.css']
				}
			}
		},

		watch: {
			html: {
				files: ['src/html/*.html'],
				tasks: ['html', 'js'],
				options: {
					nospawn: true
				}
			},
			css: {
				files: ['src/scss/*.scss'],
				//tasks: ['css', 'js'],
				tasks: ['css'],
				options: {
					nospawn: true
				}
			},
			js: {
				files: ['src/js/*.js'],
				tasks: ['js'],
				options: {
					nospawn: true
				}
			},
			images: {
				files: ['src/images/*.*'],
				//tasks: ['css', 'js'],
				tasks: ['css'],
				options: {
					nospawn: true
				}
			}
		}
	});


	// Load Grunt plugins.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-data-uri');


	// Taks for concatenating JS files into doctortcweb.js.
	grunt.registerTask('js', ['concat:js', 'jshint', 'uglify']);

	// Task for minifying HTML files.
	grunt.registerTask('html', ['htmlmin']);

	// Task for building CSS.
	grunt.registerTask('css', ['compass', 'dataUri', 'cssmin']);

	grunt.registerTask('web', ['html', 'css', 'js']);

	// Default task is an alias for 'devel'.
	grunt.registerTask('default', ['web']);

};
