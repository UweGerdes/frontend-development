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
	gulpPhplint = require('gulp-phplint'),
	path = require('path'),
	postMortem = require('gulp-postmortem'),
	os = require('os'),
	rename = require('rename'),
	runSequence = require('run-sequence'),
	server = require('gulp-develop-server'),
	shell = require('gulp-shell'),
	uglify = require('gulp-uglify')
	;

var gulpDir = __dirname;
var srcDir = path.join(__dirname, 'src');
var bowerDir = path.join(__dirname, 'bower_components');
var destDir = path.join(__dirname, 'htdocs');
var testDir = path.join(__dirname, 'tests');
var testLogfile = path.join(testDir, 'tests.log');
var testHtmlLogfile = path.join(testDir, 'tests.html');
var logMode = 0;
var txtLog = [];
var htmlLog = [];
var watchFilesFor = {};
var lifereloadPort = process.env.GULP_LIVERELOAD || 5081;

/*
 * include test-forms gulpfile.js
 */
var gulpTestForms = require('./tests/test-forms/gulpfile.js');
gulp.tasks = gulpTestForms.gulp.tasks;
watchFilesFor = gulpTestForms.watchFilesFor;

/*
 * include compare-layouts gulpfile.js
 */
var gulpCompareLayouts = require('./tests/compare-layouts/gulpfile.js');
Object.keys(gulpCompareLayouts.gulp.tasks).forEach(function(key) {
	gulp.tasks[key] = gulpCompareLayouts.gulp.tasks[key];
});
Object.keys(gulpCompareLayouts.watchFilesFor).forEach(function(key) {
	watchFilesFor[key] = gulpCompareLayouts.watchFilesFor[key];
});
// init server

/*
 * log only to console, not GUI
 */
var log = notify.withReporter(function (options, callback) {
	callback();
});

/*
 * php files lint
 */
watchFilesFor.phpLint = [
	path.join(destDir, '**', '*.php')
];
gulp.task('phpLint', function () {
	var opts = { skipPassedFiles: true };
	return gulp.src( watchFilesFor.phpLint )
		.pipe(gulpPhplint('', opts))
		.pipe(gulpPhplint.reporter('fail'))
		;
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
//		.pipe(gulpif(options.env === 'production', uglify()))
		.pipe(gulp.dest(function(file) { return dest(file.path); }))
		.pipe(log({ message: 'written: <%= file.path %>', title: 'Gulp less' }))
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
		.pipe(log({ message: 'written: <%= file.path %>', title: 'Gulp lessResponsiveCheck' }))
		;
});

watchFilesFor.lessBootstrap = [
	path.join(bowerDir, 'bootstrap', 'less', '**', '*.less')
];
gulp.task('lessBootstrap', function () {
	return gulp.src( [ path.join(bowerDir, 'bootstrap', 'less', 'bootstrap.less') ] )
		.pipe(changed(path.join(destDir, 'css'), {extension: '.css'}))
		.pipe(less())
		.on('error', log.onError({ message:  'Error: <%= error.message %>' , title: 'LESS Error'}))
		.pipe(autoprefixer('last 3 version', 'safari 5', 'ie 8', 'ie 9', 'ios 6', 'android 4'))
		.pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
		.pipe(gulp.dest(path.join(destDir, 'css')))
		.pipe(log({ message: 'written: <%= file.path %>', title: 'Gulp lessBootstrap' }))
		.pipe(gulp.dest(path.join(testDir, 'responsive-check', 'css')))
		.pipe(log({ message: 'written: <%= file.path %>', title: 'Gulp lessBootstrap' }))
		;
});

/**
 * Copy the basic js files to js/vendor
 */
watchFilesFor.jsBootstrap = [
	path.join(bowerDir, 'jquery', 'dist', 'jquery.min.js'),
	path.join(bowerDir, 'bootstrap', 'dist', 'js', 'bootstrap.min.js')
];
gulp.task('jsBootstrap', function () {
	return gulp.src( watchFilesFor.jsBootstrap )
		.pipe(changed(path.join(destDir, 'js', 'vendor')))
		.pipe(gulp.dest(path.join(destDir, 'js', 'vendor')))
		.pipe(log({ message: 'written: <%= file.path %>', title: 'Gulp jsBootstrap' }))
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
	if (!fs.existsSync(path.join(destDir, 'img'))) {
		fs.mkdirSync(path.join(destDir, 'img'));
	}
	if (!fs.existsSync(path.join(destDir, 'img', 'gv'))) {
		fs.mkdirSync(path.join(destDir, 'img', 'gv'));
	}
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
	path.join(gulpDir, '**', 'package.json'),
	path.join(gulpDir, 'tests', '**', '*.js')
];
gulp.task('lint', function(callback) {
	return gulp.src(watchFilesFor.lint)
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		;
});

watchFilesFor['responsive-check-default'] = [
	path.join(testDir, 'responsive-check', 'config', 'default.js'),
	path.join(testDir, 'responsive-check', 'index.js'),
	path.join(testDir, 'responsive-check', 'bin', 'load-page.js')
];
gulp.task('responsive-check-default', function(callback) {
	del( [
			path.join(testDir, 'responsive-check', 'results', 'default', '*.png'),
			path.join(testDir, 'responsive-check', 'results', 'default', '*.css.json')
		], { force: true } );
	var loader = exec('node index.js config/default.js',
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
gulp.task('server-responsive-check:start', function() {
	server.listen({
			path: path.join(testDir, 'responsive-check', 'server.js'),
			env: { LIVERELOAD_PORT: lifereloadPort, VERBOSE: false },
			cwd: path.join(testDir, 'responsive-check')
		}
	);
});
gulp.task('server-responsive-check:stop', function() {
    server.kill();
});
// restart server-responsive-check if server.js changed
watchFilesFor['server-responsive-check'] = [
	path.join(testDir, 'responsive-check', 'server.js')
];
gulp.task('server-responsive-check', function() {
	server.changed(function(error) {
		if( error ) {
			console.log('tests/responsive-check/server.js restart error: ' + JSON.stringify(error, null, 4));
		} else {
			console.log('tests/responsive-check/server.js restarted');
		}
	});
});
/*
 * gulp postmortem task to stop server on termination of gulp
 */
gulp.task('postMortem', function() {
	return gulp.src( watchFilesFor['server-responsive-check'] )
		.pipe(postMortem({gulp: gulp, tasks: [ 'server-responsive-check:stop' ]}))
		;
});

/*
 * livereload server and task
 */
watchFilesFor.livereload = [
	path.join(testDir, 'responsive-check', 'views', '*.ejs'),
	path.join(testDir, 'responsive-check', 'css', '*.css'),
	path.join(testDir, 'responsive-check', 'results', '**', '*.log')
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
	runSequence('phpLint',
		'lessLintStylish',
		'less',
		'lessResponsiveCheck',
		'lessBootstrap',
		'jsBootstrap',
		'graphviz',
		'lint',
		callback);
});

/*
 * watch task
 */
gulp.task('watch', function() {
console.log('watchFilesFor: ' + Object.keys(watchFilesFor).join(', '));
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
 * default task: run all build tasks and watch
 */
gulp.task('default', function(callback) {
	runSequence('build',
		'server-responsive-check:start',
		'compare-layout-init',
		'watch',
		'postMortem',
		callback);
});

console.log('tasks: ' + Object.keys(gulp.tasks).join(', '));

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
