/*
 * gulpfile for responsive-check
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
	changed = require('gulp-changed'),
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
	os = require('os'),
	rename = require('rename'),
	runSequence = require('run-sequence'),
	server = require('gulp-develop-server'),
	uglify = require('gulp-uglify')
	;

var testDir = __dirname;
var bowerDir = path.join(__dirname, '..', '..', 'bower_components');
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
watchFilesFor['responsive-check-less-lint'] = [
	path.join(testDir, 'less', '**', '*.less')
];
gulp.task('responsive-check-less-lint', function () {
	return gulp.src( watchFilesFor['responsive-check-less-lint'] )
		.pipe(lesshint())  // enforce style guide
		.on('error', function (err) {})
		.pipe(lesshint.reporter())
		;
});

watchFilesFor['responsive-check-less'] = [
	path.join(testDir, 'less', '**', '*.less'),
	path.join(testDir, 'less', 'app.less')
];
gulp.task('responsive-check-less', function () {
	var dest = function(filename) {
		return path.join(path.dirname(path.dirname(filename)), 'css');
	};
	var src = watchFilesFor['responsive-check-less'].filter(function(el){return el.indexOf('/**/') == -1; });
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
		.pipe(log({ message: 'written: <%= file.path %>', title: 'Gulp responsive-check-less' }))
		;
});

watchFilesFor['responsive-check-less-bootstrap'] = [
	path.join(bowerDir, 'bootstrap', 'less', '**', '*.less')
];
gulp.task('responsive-check-less-bootstrap', function () {
	return gulp.src( [ path.join(bowerDir, 'bootstrap', 'less', 'bootstrap.less') ] )
		.pipe(changed(path.join(testDir, 'css'), {extension: '.css'}))
		.pipe(less())
		.on('error', log.onError({ message:  'Error: <%= error.message %>' , title: 'LESS Error'}))
		.pipe(autoprefixer('last 3 version', 'safari 5', 'ie 8', 'ie 9', 'ios 6', 'android 4'))
		.pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
		.pipe(gulp.dest(path.join(testDir, 'css')))
		.pipe(log({ message: 'written: <%= file.path %>', title: 'Gulp responsive-check-less-bootstrap' }))
		;
});

/*
 * lint javascript files
 */
watchFilesFor['responsive-check-lint'] = [
	path.join(testDir, 'package.json'),
	path.join(testDir, '**', '*.js')
];
gulp.task('responsive-check-lint', function(callback) {
	return gulp.src(watchFilesFor['responsive-check-lint'])
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		;
});

watchFilesFor['responsive-check-default'] = [
	path.join(testDir, 'config', 'default.js'),
	path.join(testDir, 'index.js'),
	path.join(testDir, 'bin', 'load-page.js')
];
gulp.task('responsive-check-default', function(callback) {
	del( [
			path.join(testDir, 'results', 'default', '*.png'),
			path.join(testDir, 'results', 'default', '*.css.json')
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

// start responsive-check server
gulp.task('server-responsive-check:start', function() {
	server.listen({
			path: path.join(testDir, 'server.js'),
			env: { LIVERELOAD_PORT: lifereloadPort, VERBOSE: false },
			cwd: testDir
		}
	);
});
gulp.task('server-responsive-check:stop', function() {
    server.kill();
});
// restart server-responsive-check if server.js changed
watchFilesFor['server-responsive-check'] = [
	path.join(testDir, 'server.js')
];
gulp.task('server-responsive-check', function() {
	server.changed(function(error) {
		if( error ) {
			console.log('responsive-check server.js restart error: ' + JSON.stringify(error, null, 4));
		} else {
			console.log('responsive-check server.js restarted');
		}
	});
});

/*
 * livereload server and task
 */
watchFilesFor.livereload = [
	path.join(testDir, 'views', '*.ejs'),
	path.join(testDir, 'css', '*.css'),
	path.join(testDir, 'results', '**', '*.log')
];
gulp.task('livereload', function() {
	gulp.src(watchFilesFor.livereload)
		.pipe(changed(path.dirname('<%= file.path %>')))
//		.pipe(log({ message: 'livereload: <%= file.path %>', title: 'Gulp livereload' }))
		.pipe(gulpLivereload( { quiet: true } ));
});

/*
 * run all build tasks
 */
gulp.task('build', function(callback) {
	runSequence('responsive-check-less-lint',
		'responsive-check-less',
		'responsive-check-less-bootstrap',
		'responsive-check-lint',
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
gulp.task('responsive-check-init', function(callback) {
	runSequence('responsive-check-less',
		'server-responsive-check:start',
		callback);
});

/*
 * default task: run all build tasks and watch
 */
gulp.task('default', function(callback) {
	runSequence('build',
		'server-responsive-check:start',
		'watch',
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
