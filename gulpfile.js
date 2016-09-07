// gulpfile for project frontend-developement
//
// (c) Uwe Gerdes, entwicklung@uwegerdes.de

var gulp = require('gulp'),
	del = require('del'),
	exec = require('child_process').exec,
	runSequence = require('run-sequence'),
	path = require('path'),
	fs = require('fs'),
	rename = require('rename'),
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
var watchFiles = {};

/*
 * log only to console, not GUI
 */
var log = notify.withReporter(function (options, callback) {
	callback();
});

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
 * tests
 */
watchFiles['test-forms-default'] = [
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
	loader.stdout.on('data', function(data) { if(!data.match(/PASS/)) console.log(data.trim()); });
});


watchFiles['test-forms-login'] = [
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
	loader.stdout.on('data', function(data) { if(!data.match(/PASS/)) console.log(data.trim()); });
});

watchFiles.lint = [
	path.join(testDir, 'test-forms', 'config', '*.js'),
	path.join(testDir, 'test-forms', 'test-forms.js'),
	path.join(gulpDir, 'gulpfile.js'),
	path.join(gulpDir, 'package.json')
];
gulp.task('lint', function(callback) {
	return gulp.src(watchFiles.lint)
		.pipe(jshint())
		.pipe(jshint.reporter('default')
	);
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
	path.join(testDir, 'test-forms', 'test-forms.js')
];
gulp.task('tests', function(callback) {
	runSequence('clearTestLog',
		'test-forms-default',
		'test-forms-login',
		callback);
});

// watch task
gulp.task('watch', function() {
	Object.keys(watchFiles).forEach(function(task) {
		gulp.watch( watchFiles[ task ], [ task ] );
	});
});

// default task
gulp.task('default', ['watch']);

