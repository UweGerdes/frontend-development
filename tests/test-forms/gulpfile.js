/*
 * gulpfile for test-forms
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

var del = require('del'),
	exec = require('child_process').exec,
	fs = require('fs'),
	glob = require('glob'),
	gulp = require('gulp'),
	gulpJshint = require('gulp-jshint'),
	path = require('path'),
	runSequence = require('run-sequence')
	;

var testDir = __dirname;
var testLogfile = path.join(testDir, 'tests.log');
var testHtmlLogfile = path.join(testDir, 'tests.html');
var logMode = 0;
var txtLog = [];
var htmlLog = [];
var watchFilesFor = {};
var exitCode = 0;

/*
 * lint javascript files
 */
watchFilesFor['test-forms-lint'] = [
	path.join(testDir, 'package.json'),
	path.join(testDir, '**', '*.js')
];
gulp.task('test-forms-lint', function(callback) {
	return gulp.src(watchFilesFor['test-forms-lint'])
		.pipe(gulpJshint())
		.pipe(gulpJshint.reporter('default'))
		;
});

/*
 * tests
 */
watchFilesFor['test-forms-default'] = [
	path.join(testDir, 'config', 'default.js')
];
gulp.task('test-forms-default', function(callback) {
	del( [
			path.join(testDir, 'results', 'default', '*')
		], { force: true } );
	var loader = exec('casperjs test index.js --cfg=config/default.js',
		{ cwd: testDir },
		function (err, stdout, stderr) {
			logExecResults(err, stdout, stderr);
			callback();
		}
	);
	loader.stdout.on('data', function(data) { if(!data.match(/PASS/)) { console.log(data.trim()); } });
});

gulp.task('test-forms-default-slimer', function(callback) {
	del( [
			path.join(testDir, 'results', 'default-slimerjs', '*')
		], { force: true } );
	var loader = exec('xvfb-run --error-file=/usr/src/app/tests/test-forms/err.log --auto-servernum --server-num=1 -a casperjs --engine=slimerjs --debug test index.js --cfg=config/default.js --dumpDir=./results/default-slimerjs/',
		{ cwd: testDir },
		function (err, stdout, stderr) {
			logExecResults(err, stdout, stderr);
			callback();
		}
	);
	loader.stdout.on('data', function(data) { if(!data.match(/PASS/)) { console.log(data.trim()); } });
});
//
watchFilesFor['test-forms-login'] = [
	path.join(testDir, 'config', 'login.js')
];
gulp.task('test-forms-login', function(callback) {
	del( [
			path.join(testDir, 'results', 'login', '*')
		], { force: true } );
	var loader = exec('casperjs test index.js --cfg=config/login.js',
		{ cwd: testDir },
		function (err, stdout, stderr) {
			logExecResults(err, stdout, stderr);
			callback();
		}
	);
	loader.stdout.on('data', function(data) { if(!data.match(/PASS/)) { console.log(data.trim()); } });
});

gulp.task('test-forms-login-slimer', function(callback) {
	del( [
			path.join(testDir, 'results', 'login-slimerjs', '*')
		], { force: true } );
	var loader = exec('xvfb-run -a casperjs --engine=slimerjs test index.js --cfg=config/login.js --dumpDir=./results/login-slimerjs/',
		{ cwd: testDir },
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
		console.log(err.toString());
		exitCode = 1;
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

/*
 * run all build tasks
 */
gulp.task('build', function(callback) {
	runSequence('test-forms-lint',
		callback);
});

/*
 * run all test tasks
 */
watchFilesFor['test-forms-tests'] = [
	path.join(testDir, 'index.js'),
	path.join(testDir, 'config', '*.js')
];
gulp.task('test-forms-tests', function(callback) {
	runSequence('clearTestLog',
		'test-forms-default',
//		'test-forms-login',
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
		'watch',
		callback);
});

process.on('exit', function () {
	process.exit(exitCode);
});

module.exports = {
	gulp: gulp,
	watchFilesFor: watchFilesFor
};
