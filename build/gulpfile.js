/*
 * gulpfile for project Frontend
 *
 * $ sudo npm install --global gulp
 * $ cd myProject/build/Gulp
 * $ npm install
 *
 * edit /node_modules/gulp-less/index.js:68 : replace 'done' with 'then'
 *
 * (c) Uwe Gerdes, entwicklung@uwegerdes.de
 */
'use strict';

var gulp = require('gulp'),
	gutil = require('gulp-util'),
	less = require('gulp-less'),
	autoprefixer = require('gulp-autoprefixer'),
	uglify = require('gulp-uglify'),
	notify = require('gulp-notify'),
	changed = require('gulp-changed'),
	lessChanged = require('gulp-less-changed'),
	shell = require('gulp-shell'),
	markdown = require('gulp-markdown'),
	insert = require('gulp-insert'),
	runSequence = require('run-sequence'),
	jshint = require('gulp-jshint'),
	path = require('path'),
	rename = require('rename');

/*
 * log only to console, not GUI
 */
var log = notify.withReporter(function (options, callback) {
	callback();
});

var gulpDir = __dirname;
var projectRoot = path.join(gulpDir, '..');
var srcDir = path.join(projectRoot, 'src');
var destDir = path.join(projectRoot, 'htdocs');

var watchFiles = {};

/*
 * less task watching all less files, only writing sources without **,
 * includes (path with **) filtered, change check by gulp-less-changed
 */
watchFiles.less = [
	path.join(srcDir, 'less', '**', '*.less'),
	path.join(srcDir, 'less', '*.less'),
	path.join(srcDir, 'less', 'login', 'login.less'),
	path.join(srcDir, 'less', 'login', 'bootstrap.less')
];
gulp.task('less', function () {
	var dest = function(filename) {
		var srcBase = path.join(srcDir, 'less');
		return path.join(path.dirname(filename).replace(srcBase, destDir), 'css');
	};
	var src = watchFiles.less.filter(function(el){return el.indexOf('/**/') == -1; });
	return gulp.src( src )
		.pipe(lessChanged({
			getOutputFileName: function(file) {
				return rename( file, { dirname: dest(file), extname: '.css' } );
			}
		}))
		.pipe(less())
		.on('error', log.onError({ message:  'Error: <%= error.message %>' , title: 'LESS Error'}))
		.pipe(autoprefixer('last 3 version', 'safari 5', 'ie 8', 'ie 9', 'ios 6', 'android 4'))
		.pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
		.pipe(gulp.dest(function(file) { return dest(file.path); }))
		.pipe(log({ message: 'written: <%= file.path %>', title: 'Gulp LESS' }))
		;
});

/*
 * markdown task to convert all .md files to .html in the same directory
 * don't watch subdirectories if node_modules or vendor are present
 */
watchFiles.markdown = [
	path.join(projectRoot, '*.md'),
	path.join(projectRoot, 'build', '*.md'),
	path.join(projectRoot, 'login', '*.md'),
	path.join(projectRoot, 'docker', '*.md')
];
gulp.task('markdown', function () {
	var htmlHeader = '<html><header></header><body>';
	var htmlFooter = '</body></html>';
	var dest = function(file) {
		return path.dirname(file.path);
	};
	return gulp.src(watchFiles.markdown)
		.pipe(changed(dest, {extension: '.html'}))
		.pipe(markdown())
		.on('error', log.onError({ message:  'Error: <%= error.message %>' , title: 'markdown Error'}))
		.pipe(insert.wrap(htmlHeader, htmlFooter))
		.pipe(gulp.dest(dest))
		.pipe(log({ message: 'written: <%= file.path %>', title: 'Gulp markdown' }))
		;
});

/*
 * graphviz image generation
 */
watchFiles.graphviz = [
	path.join(srcDir, 'Graphviz', '*.gv')
];
gulp.task('graphviz', function () {
	var dest = path.join(destDir, 'img', 'gv');
	var destFormat = 'png';
	return gulp.src(watchFiles.graphviz, {read: false})
		.pipe(changed(dest, {extension: '.' + destFormat}))
		.pipe(shell('dot -T' + destFormat + ' "<%= file.path %>" -o "<%= rename(file.path) %>"', {
			templateData: {
				rename: function (s) {
							return s.replace(/^.+\/([^\/]+)\.gv$/, dest + '/$1' + '.' + destFormat);
						}
			}
		}))
		.on('error', log.onError({ message:  'Error: <%= error.message %>' , title: 'Graphviz Error'}))
		.pipe(log({ message: 'processed: <%= file.path %>', title: 'Gulp graphviz' }))
		;
});

/*
 * lint javascript files
 */
watchFiles.lint = [
	path.join(gulpDir, 'gulpfile.js'),
	path.join(gulpDir, 'package.json')
];
gulp.task('lint', function(callback) {
	return gulp.src(watchFiles.lint)
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		;
});

/*
 * default: run all build tasks and watch
 */
gulp.task('default', function(callback) {
	runSequence('build',
		'watch',
		callback);
});

/*
 * run all build tasks
 */
gulp.task('build', function(callback) {
	runSequence('less',
		'markdown',
		'graphviz',
		'lint',
		callback);
});

/*
 * default watch task -
 */
gulp.task('watch', function() {
	Object.keys(watchFiles).forEach(function(task) {
		gulp.watch( watchFiles[ task ], [ task ] );
	});
});

