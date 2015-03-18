/*global module:false*/

/*
 * Usage:
 *
 * `grunt`: alias for `grunt devel`.
 *
 * `grunt devel`: Generate HTML minified files, compile CSS, concat and lint
 *                for doctortcweb-devel.js.
 *
 * `grunt watch`: Watch changes in src/html/ files (but not for *.min.html)
 *                and generat HTML minified files.
 *                Watch changes in src/scss/ files and compile and minify
 *                them into src/css/doctortcweb.min.css.
 *                Watch changes in src/images/*.* and convert images into dataURI.
 *                Watch changes in src/js/ files and run `grunt js` to
 *                generate dist/doctortcweb-devel.js.
 *                It's 100% useful to let this task running while in
 *                development status.
 *
 * `grunt dist`: Generate HTML minified files, compile CSS, concat and lint
 *               for final doctortcweb-X.Y.Z.js and doctortcweb-X.Y.Z.min.js.
 */


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
			devel: {
				src: jsFiles,
				dest: 'dist/<%= pkg.name %>-devel.js',
				options: {
					banner: '<%= meta.banner %>',
					separator: '\n\n',
					footer: '<%= meta.footer %>',
					process: true
				},
				nonull: true
			},
			post_devel: {
				src: [
					'dist/<%= pkg.name %>-devel.js'
					// TODO: add jquery.js?
				],
				dest: 'dist/<%= pkg.name %>-devel.js',
				nonull: true
			},
			dist: {
				src: jsFiles,
				dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js',
				options: {
					banner: '<%= meta.banner %>',
					separator: '\n\n',
					footer: '<%= meta.footer %>',
					process: true
				},
				nonull: true
			},
			post_dist: {
				src: [
					'dist/<%= pkg.name %>-<%= pkg.version %>.js'
					// TODO: add jquery.js?
				],
				dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js',
				nonull: true
			}
		},

		jshint: {
			dist: 'dist/<%= pkg.name %>-<%= pkg.version %>.js',
			devel: 'dist/<%= pkg.name %>-devel.js',
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
					jQuery: true,
					$: true,
					DoctoRTC: true
				}
			}
		},

		uglify: {
			dist: {
				files: {
					'dist/<%= pkg.name %>-<%= pkg.version %>.min.js': ['dist/<%= pkg.name %>-<%= pkg.version %>.js']
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
				src: ['src/css/<%= pkg.name %>.css'],
				dest: 'src/css/',
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
					'src/css/<%= pkg.name %>.min.css': ['src/css/<%= pkg.name %>.css']
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


	// Taks for concatenating JS files into doctortcweb-devel.js (uncompressed).
	grunt.registerTask('js', ['concat:devel', 'jshint:devel', 'concat:post_devel']);

	// Task for minifying HTML files.
	grunt.registerTask('html', ['htmlmin']);

	// Task for building CSS.
	grunt.registerTask('css', ['compass', 'dataUri', 'cssmin']);

	// Task for building everything and generate doctortcweb-devel.js (uncompressed).
	grunt.registerTask('devel', ['html', 'css', 'js']);

	// Task for building doctortcweb-X.Y.Z.js (uncompressed) and doctortcweb-X.Y.Z.min.js (minified).
	grunt.registerTask('dist', ['html', 'css', 'concat:dist', 'jshint:dist', 'uglify:dist', 'concat:post_dist']);

	// Default task is an alias for 'devel'.
	grunt.registerTask('default', ['devel']);

};
