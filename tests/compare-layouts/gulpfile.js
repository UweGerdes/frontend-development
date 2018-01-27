/*
 * gulpfile for comparing html page elements
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

var autoprefixer = require('gulp-autoprefixer'),
	del = require('del'),
	exec = require('child_process').exec,
	fs = require('fs'),
	glob = require('glob'),
	gulp = require('gulp'),
	gutil = require('gulp-util'),
	jshint = require('gulp-jshint'),
	lessChanged = require('gulp-less-changed'),
	lesshint = require('gulp-lesshint'),
	less = require('gulp-less'),
	gulpLivereload = require('gulp-livereload'),
	notify = require('gulp-notify'),
	path = require('path'),
	postMortem = require('gulp-postmortem'),
	os = require('os'),
	rename = require('rename'),
	runSequence = require('run-sequence'),
	server = require('gulp-develop-server'),
	uglify = require('gulp-uglify')
	;

var testDir = __dirname;
var testLogfile = path.join(testDir, 'tests.log');
var testHtmlLogfile = path.join(testDir, 'tests.html');
var logMode = 0;
var txtLog = [];
var htmlLog = [];
var watchFilesFor = {};
var lifereloadPort = process.env.GULP_LIVERELOAD || 5081;
var exitCode = 0;

/*
 * log only to console, not GUI
 */
var log = notify.withReporter(function (options, callback) {
	callback();
});

/*
 * less files lint and style check
 */
watchFilesFor['compare-layouts-less-lint'] = [
	path.join(testDir, 'less', '**', '*.less')
];
gulp.task('compare-layouts-less-lint', function () {
	return gulp.src( watchFilesFor['compare-layouts-less-lint'] )
		.pipe(lesshint())  // enforce style guide
		.on('error', function (err) {})
		.pipe(lesshint.reporter())
		;
});

watchFilesFor['compare-layouts-less'] = [
	path.join(testDir, 'less', '**', '*.less'),
	path.join(testDir, 'less', 'app.less')
];
gulp.task('compare-layouts-less', function () {
	var dest = function(filename) {
		return path.join(path.dirname(path.dirname(filename)), 'css');
	};
	var src = watchFilesFor['compare-layouts-less'].filter(function(el){return el.indexOf('/**/') == -1; });
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
		.pipe(log({ message: 'written: <%= file.path %>', title: 'Gulp lessCompareLayouts' }))
		;
});

/*
 * lint javascript files
 */
watchFilesFor['compare-layouts-lint'] = [
	path.join(testDir, 'package.json'),
	path.join(testDir, '**', '*.js')
];
gulp.task('compare-layouts-lint', function(callback) {
	return gulp.src(watchFilesFor['compare-layouts-lint'])
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		;
});

/*
 * main task for comparing layouts
 */
watchFilesFor['compare-layouts-default'] = [
	path.join(testDir, 'config', 'default.js'),
	path.join(testDir, 'index.js'),
	path.join(testDir, 'bin', '*.js')
];
gulp.task('compare-layouts-default', function(callback) {
	del( [
			path.join(testDir, 'results', 'default', '*.png'),
			path.join(testDir, 'results', 'default', '*.json')
		], { force: true } );
	var loader = exec('node index.js config/default.js',
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

// start compare-layouts server
gulp.task('server-compare-layouts:start', function() {
	server.listen({
			path: path.join(testDir, 'server.js'),
			env: { LIVERELOAD_PORT: lifereloadPort, VERBOSE: false },
			cwd: testDir
		}
	);
});
gulp.task('server-compare-layouts:stop', function() {
    server.kill();
});
// restart server-compare-layouts if server.js changed
watchFilesFor['server-compare-layouts'] = [
	path.join(testDir, 'server.js')
];
gulp.task('server-compare-layouts', function() {
	server.changed(function(error) {
		if( error ) {
			console.log('compare-layouts server.js restart error: ' + JSON.stringify(error, null, 4));
		} else {
			console.log('compare-layouts server.js restarted');
		}
	});
});
/*
 * gulp postmortem task to stop server on termination of gulp
 */
gulp.task('server-compare-layouts-postMortem', function() {
	return gulp.src( watchFilesFor['server-compare-layouts'] )
		.pipe(postMortem({gulp: gulp, tasks: [ 'server-compare-layouts:stop' ]}))
		;
});

/*
 * run all build tasks
 */
gulp.task('build', function(callback) {
	runSequence('compare-layouts-less-lint',
		'compare-layouts-less',
		'compare-layouts-lint',
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
	gulpLivereload.listen( { port: lifereloadPort, delay: 2000 } );
	console.log('gulp livereload listening on http://' + ipv4adresses()[0] + ':' + lifereloadPort);
});

/*
 * init task: start server
 */
gulp.task('compare-layouts-init', function(callback) {
	runSequence('compare-layouts-less',
		'server-compare-layouts:start',
		'server-compare-layouts-postMortem',
		callback);
});

/*
 * default task: run all build tasks and watch
 */
gulp.task('default', function(callback) {
	runSequence('build',
		'server-compare-layouts:start',
		'watch',
		'server-compare-layouts-postMortem',
		callback);
});

process.on('exit', function () {
	process.exit(exitCode);
});

function ipv4adresses() {
	var addresses = [];
	var interfaces = os.networkInterfaces();
	for (var k in interfaces) {
		for (var k2 in interfaces[k]) {
			var address = interfaces[k][k2];
			if (address.family === 'IPv4' && !address.internal) {
				addresses.push(address.address);
			}
		}
	}
	return addresses;
}

module.exports = {
	gulp: gulp,
	watchFilesFor: watchFilesFor
};
