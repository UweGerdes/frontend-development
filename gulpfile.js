// gulpfile for project frontend-developement
//
// (c) Uwe Gerdes, entwicklung@uwegerdes.de

var gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	del = require('del'),
	exec = require('child_process').exec,
	runSequence = require('run-sequence'),
	path = require('path'),
	fs = require('fs');

var gulpDir = __dirname;
var testDir = path.join(__dirname, 'tests');
var testLogfile = path.join(testDir, 'tests.log');
var testHtmlLogfile = path.join(testDir, 'tests.html');
var logMode = 0;
var txtLog = [];
var htmlLog = [];
var watchFiles = {};

// tests
watchFiles['test-forms-default'] = [
	path.join(testDir, 'tests-forms', 'config', 'default.js')
];
gulp.task('test-forms-default', function(callback) {
	del( [
			path.join(testDir, 'tests-forms', 'results', 'default', '*')
		], { force: true } );
	var loader = exec('casperjs test test-forms.js --cfg=config/default.js',
		{ cwd: path.join(testDir, 'tests-forms') },
		function (err, stdout, stderr) {
			logTxt (stdout.replace(/\u001b\[[^m]+m/g, '').match(/[^\n]*FAIL [^\n]+/g));
			logHtml(stdout.replace(/\u001b\[[^m]+m/g, '').match(/[^\n]*FAIL [^0-9][^\n]+/g));
			callback();
		}
	);
	loader.stdout.on('data', function(data) { if(!data.match(/PASS/)) console.log(data.trim()); });
});


watchFiles['test-login'] = [
	path.join(testDir, 'tests-forms', 'config', 'login.js')
];
gulp.task('test-login', function(callback) {
	del( [
			path.join(testDir, 'tests-forms', 'results', 'login', '*')
		], { force: true } );
	var loader = exec('casperjs test test-forms.js --cfg=config/login.js',
		{ cwd: path.join(testDir, 'tests-forms') },
		function (err, stdout, stderr) {
			logTxt (stdout.replace(/\u001b\[[^m]+m/g, '').match(/[^\n]*FAIL [^\n]+/g));
			logHtml(stdout.replace(/\u001b\[[^m]+m/g, '').match(/[^\n]*FAIL [^0-9][^\n]+/g));
			callback();
		}
	);
	loader.stdout.on('data', function(data) { if(!data.match(/PASS/)) console.log(data.trim()); });
});

watchFiles.lint = [
	path.join(testDir, 'tests-forms', 'config', '*.js'),
	path.join(testDir, 'tests-forms', 'test-forms.js'),
	path.join(gulpDir, 'gulpfile.js'),
	path.join(gulpDir, 'package.json')
];
gulp.task('lint', function(callback) {
	return gulp.src(watchFiles.lint)
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		;

});

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
	fs.appendFileSync(testLogfile, txtLog.join('\n') + '\n');
};

var writeHtmlLog = function () {
	var html = '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8" />\n' +
			'<title>Testergebnisse</title>\n' +
			'<link href="compare-layouts/css/index.css" rel="stylesheet" />\n' +
			'</head>\n<body><h1>Testergebnisse</h1>\n<ul>\n';
	html += htmlLog.join('\n');
	html += '</ul>\n</body>\n</html>';
	fs.appendFileSync(testHtmlLogfile, html);
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

// run all test tasks
watchFiles.tests = [
	path.join(testDir, 'tests-forms', 'test-forms.js')
];
gulp.task('tests', function(callback) {
	runSequence('clearTestLog',
		'test-default',
		'test-login',
		callback);
});

// watch task
gulp.task('watch', function() {
	Object.keys(watchFiles).forEach(function(task) {
		gulp.watch( watchFiles[ task ], {interval: 1000, mode: 'poll', alwaysStat: true, usePoll: true, usePolling: true}, [ task ] );
	});
});

// default task
gulp.task('default', ['watch']);

