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
	del = require('del'),
	exec = require('child_process').exec,
	runSequence = require('run-sequence'),
	path = require('path'),
	fs = require('fs'),
	glob = require('glob'),
	rename = require('rename'),
	gutil = require('gulp-util'),
//	gulpif = require('gulp-if'),
	less = require('gulp-less'),
	lesshint = require('gulp-lesshint'),
	autoprefixer = require('gulp-autoprefixer'),
	uglify = require('gulp-uglify'),
	notify = require('gulp-notify'),
	changed = require('gulp-changed'),
	lessChanged = require('gulp-less-changed'),
	postMortem = require('gulp-postmortem'),
	server = require('gulp-develop-server'),
	shell = require('gulp-shell'),
//	spawn = require('child_process').spawn,
	jshint = require('gulp-jshint');

var gulpDir = __dirname;
var srcDir = path.join(__dirname, 'src');
var destDir = path.join(__dirname, 'htdocs');
var testDir = path.join(__dirname, 'tests');
var testLogfile = path.join(testDir, 'tests.log');
var testHtmlLogfile = path.join(testDir, 'tests.html');
var logMode = 0;
var txtLog = [];
var htmlLog = [];
var watchFilesFor = {};

/*
 * log only to console, not GUI
 */
var log = notify.withReporter(function (options, callback) {
	callback();
});

/*
 * less files lint and style check
 */
watchFilesFor.lessLintStylish = [
	path.join(srcDir, 'less', '*.less'),
	path.join(srcDir, 'less', 'login', '*.less'),
	path.join(testDir, 'responsive-check', 'less', '**', '*.less')
];
gulp.task('lessLintStylish', function () {
	return gulp.src( watchFilesFor.lessLintStylish )
		.pipe(lesshint())  // enforce style guide
		.on('error', function (err) {})
		.pipe(lesshint.reporter())
		;
});

/*
 * less task watching all less files, only writing sources without **,
 * includes (path with **) filtered, change check by gulp-less-changed
 */
watchFilesFor.less = [
	path.join(srcDir, 'less', '**', '*.less'),
	path.join(srcDir, 'less', '*.less'),
	path.join(srcDir, 'less', 'login', '*.less')
];
gulp.task('less', function () {
	var dest = function(filename) {
		var srcBase = path.join(srcDir, 'less');
		return path.join(path.dirname(filename).replace(srcBase, destDir), 'css');
	};
	var src = watchFilesFor.less.filter(function(el){return el.indexOf('/**/') == -1; });
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
//		.pipe(gulpif(options.env === 'production', uglify()))
		.pipe(log({ message: 'written: <%= file.path %>', title: 'Gulp LESS' }))
		;
});

watchFilesFor.lessResponsiveCheck = [
	path.join(testDir, 'responsive-check', 'less', '**', '*.less'),
	path.join(testDir, 'responsive-check', 'less', 'app.less')
];
gulp.task('lessResponsiveCheck', function () {
	var dest = function(filename) {
		return path.join(path.dirname(path.dirname(filename)), 'css');
	};
	var src = watchFilesFor.lessResponsiveCheck.filter(function(el){return el.indexOf('/**/') == -1; });
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
//		.pipe(gulpif(options.env === 'production', uglify()))
		.pipe(log({ message: 'written: <%= file.path %>', title: 'Gulp LESS' }))
		;
});

/*
 * graphviz image generation
 */
watchFilesFor.graphviz = [
	path.join(srcDir, 'Graphviz', '*.gv')
];
gulp.task('graphviz', function () {
	var dest = path.join(destDir, 'img', 'gv');
	var destFormat = 'png';
	return gulp.src(watchFilesFor.graphviz, {read: false})
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
watchFilesFor.lint = [
	path.join(gulpDir, 'gulpfile.js'),
	path.join(gulpDir, 'package.json'),
	path.join(gulpDir, 'tests/**/*.js')
];
gulp.task('lint', function(callback) {
	return gulp.src(watchFilesFor.lint)
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		;
});

/*
 * tests
 */
watchFilesFor['test-forms-default'] = [
	path.join(testDir, 'test-forms', 'config', 'default.js')
];
gulp.task('test-forms-default', function(callback) {
	del( [
			path.join(testDir, 'test-forms', 'results', 'default', '*')
		], { force: true } );
	var loader = exec('casperjs test test-forms.js --cfg=config/default.js',
		{ cwd: path.join(testDir, 'test-forms') },
		function (err, stdout, stderr) {
			logExecResults(err, stdout, stderr);
			callback();
		}
	);
	loader.stdout.on('data', function(data) { if(!data.match(/PASS/)) { console.log(data.trim()); } });
});

gulp.task('test-forms-default-slimer', function(callback) {
	del( [
			path.join(testDir, 'test-forms', 'results', 'default', '*')
		], { force: true } );
	var loader = exec('xvfb-run -a casperjs --engine=slimerjs test test-forms.js --cfg=config/default.js --dumpDir=./results/default-slimerjs/',
		{ cwd: path.join(testDir, 'test-forms') },
		function (err, stdout, stderr) {
			logExecResults(err, stdout, stderr);
			callback();
		}
	);
	loader.stdout.on('data', function(data) { if(!data.match(/PASS/)) { console.log(data.trim()); } });
});

watchFilesFor['test-forms-login'] = [
	path.join(testDir, 'test-forms', 'config', 'login.js')
];
gulp.task('test-forms-login', function(callback) {
	del( [
			path.join(testDir, 'test-forms', 'results', 'login', '*')
		], { force: true } );
	var loader = exec('casperjs test test-forms.js --cfg=config/login.js',
		{ cwd: path.join(testDir, 'test-forms') },
		function (err, stdout, stderr) {
			logExecResults(err, stdout, stderr);
			callback();
		}
	);
	loader.stdout.on('data', function(data) { if(!data.match(/PASS/)) { console.log(data.trim()); } });
});

watchFilesFor.responsiveCheckDefault = [
	path.join(testDir, 'responsive-check', 'config', 'default.js'),
	path.join(testDir, 'responsive-check', 'responsive-check.js'),
	path.join(testDir, 'responsive-check', 'bin', 'load-page.js')
];
gulp.task('responsiveCheckDefault', function(callback) {
	del( [
			path.join(testDir, 'responsive-check', 'results', 'default', '*')
		], { force: true } );
	var loader = exec('node responsive-check.js',
		{ cwd: path.join(testDir, 'responsive-check') },
		function (err, stdout, stderr) {
			logExecResults(err, stdout, stderr);
			callback();
		}
	);
	loader.stdout.on('data', function(data) { if(!data.match(/PASS/)) { console.log(data.trim()); } });
});

// helper functions
var logExecResults = function (err, stdout, stderr) {
	logTxt (stdout.replace(/\u001b\[[^m]+m/g, '').match(/[^\n]*FAIL [^\n]+/g));
	logHtml(stdout.replace(/\u001b\[[^m]+m/g, '').match(/[^\n]*FAIL [^0-9][^\n]+/g));
	if (err) {
		console.log('error: ' + err.toString());
	}
};

var logTxt = function (msg) {
	if (logMode === 1 && msg){
		var txtMsg = msg.join('\n');
		txtLog.push(txtMsg);
	}
};

var logHtml = function (msg) {
	if (logMode === 1 && msg){
		var htmlMsg = msg.join('<br />')
						.replace(/FAIL ([^ ]+) ([^ :]+)/, 'FAIL ./results/$1/$22.png')
						.replace(/([^ ]+\/[^ ]+\.png)/g, '<a href="$1">$1</a>');
		var errorClass = htmlMsg.indexOf('FAIL') > -1 ? ' class="fail"' : ' class="success"';
		htmlLog.push('\t<li' + errorClass + '>' + htmlMsg + '</li>');
	}
};

var writeTxtLog = function () {
	if (txtLog.length > 0) {
		fs.writeFileSync(testLogfile, txtLog.join('\n') + '\n');
	}
};

var writeHtmlLog = function () {
	if (htmlLog.length > 0) {
		var html = '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8" />\n' +
				'<title>Testergebnisse</title>\n' +
				'<link href="compare-layouts/css/index.css" rel="stylesheet" />\n' +
				'</head>\n<body><h1>Testergebnisse</h1>\n<ul>\n';
		html += htmlLog.join('\n');
		html += '</ul>\n</body>\n</html>';
		fs.writeFileSync(testHtmlLogfile, html);
	}
};

gulp.task('clearTestLog', function() {
	del([ testLogfile, testHtmlLogfile ], { force: true });
	logMode = 1;
});

gulp.task('logTestResults', function(callback) {
	if (txtLog.length > 0) {
		console.log('######################## TEST RESULTS ########################');
		console.log(txtLog.join('\n'));
	} else {
		console.log('######################## TEST SUCCESS ########################');
		logTxt (['SUCCESS gulp tests']);
	}
	writeTxtLog();
	writeHtmlLog();
	logMode = 0;
	callback();
});

// start responsive-check server
gulp.task('server:start', function() {
//	var lifereloadPort = 35731;
    server.listen({
			path: path.join(testDir, 'responsive-check', 'server.js'),
			cwd: path.join(testDir, 'responsive-check')
		}
//		, livereload.listen({ port: lifereloadPort })
	);
//	console.log('responsive-check livereload listening on ' + lifereloadPort);
});
gulp.task('server:stop', function() {
    server.kill();
});
// restart server if server.js changed
watchFilesFor.server = [
	path.join(testDir, 'responsive-check', 'server.js')
];
gulp.task('server', function() {
	server.changed(function(error) {
		if( error ) {
			console.log('tests/responsive-check/server.js restart error: ' + JSON.stringify(error, null, 4));
		} else {
			console.log('tests/responsive-check/server.js restarted');
//			livereload.changed(file.path);
		}
	});
});

/*
 * restart gulp if gulpfile.js changed
 *
 * not working after restart
 * all tasks are run by default task but neither server starts up nor do watches trigger.
 * Even the new processes remain orphan when gulp is stopped with CTRL-C
 *
watchFilesFor.gulpfile = [
	path.join(gulpDir, 'gulpfile.js')
];
gulp.task('gulpfile', function(callback) {
	runSequence(
		'lint',
		'gulp:restart',
		callback);
});
gulp.task('gulp:restart', ['server:stop'], function() {
	spawn('gulp', ['default'], {stdio: 'inherit'});
	process.exit();
});
gulp.task('gulp:stop', function() {
//	process.exit();
	process.kill(process.pid, 'SIGINT');
});
*/

/*
 * run all build tasks
 */
gulp.task('build', function(callback) {
	runSequence('lessLintStylish',
		'less',
		'lessResponsiveCheck',
		'graphviz',
		'lint',
		callback);
});

/*
 * run all test tasks
 */
watchFilesFor.tests = [
	path.join(testDir, 'test-forms', 'test-forms.js')
];
gulp.task('tests', function(callback) {
	runSequence('clearTestLog',
		'test-forms-default',
		'test-forms-login',
		callback);
});

/*
 * watch task
 */
gulp.task('watch', function() {
	Object.keys(watchFilesFor).forEach(function(task) {
		watchFilesFor[task].forEach(function(filename) {
			glob(filename, function(err, files) {
				if (err) {
					console.log(filename + ' error: ' + JSON.stringify(err, null, 4));
				}
				if (files.length === 0) {
					console.log(filename + ' not found');
				}
			});
		});
		gulp.watch( watchFilesFor[task], [ task ] );
	});
});

/*
 * default task: run all build tasks and watch
 */
gulp.task('default', function(callback) {
	runSequence('build',
		'server:start',
		'watch',
		'postMortem',
		callback);
});

/*
 * gulp postmortem task
 */
gulp.task('postMortem', function() {
	return gulp.src( watchFilesFor.server )
		.pipe(postMortem({gulp: gulp, tasks: [ 'server:stop' ]}))
		;
});
