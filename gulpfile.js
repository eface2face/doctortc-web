/**
 * Dependencies.
 */
var browserify = require('browserify'),
	vinyl_transform = require('vinyl-transform'),
	gulp = require('gulp'),
	brfs = require('gulp-brfs'),
	rename = require('gulp-rename'),
	jshint = require('gulp-jshint'),
	jscs = require('gulp-jscs'),
	stylish = require('gulp-jscs-stylish'),
	uglify = require('gulp-uglify'),
	filelog = require('gulp-filelog'),
	expect = require('gulp-expect-file'),
	compass = require('gulp-compass'),
	minifyCSS = require('gulp-minify-css'),

	pkg = require('./package.json'),

// gulp-expect-file options.
	expect_options = {
		silent: true,
		errorOnFailure: true,
		checkRealFile: true
	};


gulp.task('html:brfs', function () {
	var src = ['lib/html/input.js'];

	return gulp.src(src, { buffer: false })
		.pipe(filelog('html:brfs'))
		.pipe(expect(expect_options, src))
		.pipe(brfs())
		.pipe(rename('output.js'))
		.pipe(gulp.dest('lib/html/'));
});


gulp.task('css:compass', function () {
	var src = 'scss/*.scss';

	return gulp.src(src)
		.pipe(filelog('css:compass'))
		.pipe(compass({
			sass: 'scss',
			css: 'web/css'
		}));
});


gulp.task('css:uglify', function () {
	var src = 'web/css/' + pkg.name + '.css';

	return gulp.src(src)
		.pipe(filelog('css:uglify'))
		.pipe(minifyCSS())
		.pipe(gulp.dest('web/css/'));
});


gulp.task('js:lint', function () {
	var src = ['gulpfile.js', 'lib/**/*.js'];

	return gulp.src(src)
		.pipe(filelog('js:lint'))
		.pipe(expect(expect_options, src))
		.pipe(jshint('.jshintrc')) // enforce good practics
		.pipe(jscs('.jscsrc')) // enforce style guide
		.pipe(stylish.combineWithHintResults())
		.pipe(jshint.reporter('jshint-stylish', {verbose: true}))
		.pipe(jshint.reporter('fail'));
});


gulp.task('js:browserify', function () {
	var browserified = vinyl_transform(function (filename) {
		var b = browserify(filename, {
			standalone: pkg.name
		});

		return b.bundle();
	}),
		src = pkg.main;

	return gulp.src(src)
		.pipe(filelog('js:browserify'))
		.pipe(expect(expect_options, src))
		.pipe(browserified)
		.pipe(gulp.dest('web/js/'));
});


gulp.task('js:uglify', function () {
	var src = 'web/js/' + pkg.name + '.js';

	return gulp.src(src)
		.pipe(filelog('js:uglify'))
		.pipe(expect(expect_options, src))
		.pipe(uglify())
		.pipe(gulp.dest('web/js/'));
});


gulp.task('watch', function () {
	gulp.watch(['html/*.html'], 'html');
	gulp.watch(['scss/**/*.scss'], 'css');
	gulp.watch(['lib/**/*.js', 'etc/*.json'], 'js');
});


gulp.task('html', gulp.series('html:brfs'));
gulp.task('css', gulp.series('css:compass', 'css:uglify'));
gulp.task('js', gulp.series('js:lint', 'js:browserify', 'js:uglify'));

gulp.task('default', gulp.series('html', 'css', 'js'));
