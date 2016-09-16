/*
 * load html pages in different screen widths
 *
 * node responsive-check.js --cfg=config/<configname>.js
 *
 * (c) Uwe Gerdes, entwicklung@uwegerdes.de
 */
'use strict';

var fs = require('fs'),
	path = require('path'),
	exec = require('child_process').exec;

var configFile = 'config/default.js';

if (process.argv[2]) {
	configFile = process.argv[2];
}
var config = require('./' + configFile);

var verbose = process.argv.indexOf('-v') > -1;

var resultsDir = './results';
var destDir = path.join(resultsDir, config.destDir);
var pagesExpected = [];
var pagesLoaded = {};

if (!fs.existsSync(resultsDir)) {
	fs.mkdirSync(resultsDir);
}
fs.stat(destDir, function(err, stats) {
	if (!stats) {
		fs.mkdir(destDir,
			function (err, data) {
				if (err)  { throw err; }
				if (data) { console.log(data); }
				console.log('directory "' + destDir + '" created');
				load();
			}
		);
		console.log('creating directory "' + destDir + '"');
	} else {
		if (!stats.isDirectory()) {
			console.log(destDir + ' exists but is not a directory - exiting');
		} else {
			load();
		}
	}
});

function load() {
	config.engines.forEach(function(engine) {
		config.widths.forEach(function(width) {
			pagesExpected.push(pageKey(engine, width));
			loadPage(config, engine, width, addResult);
		});
	});
}

function loadPage(config, engine, width, callback) {
	var dest = path.join(destDir, pageKey(engine, width));
	var page = {
		'loaded': false
	};
	var args = ['./bin/load-page.js',
		'--url="' + config.url + '"',
		'--selector="' + config.selector + '"',
		'--dest="' + dest + '"',
		'--engine="' + engine + '"',
		'--width="' + width + '"'];
	var cmd = 'casperjs';
	if (engine == 'slimerjs') {
//			cmd = 'xvfb-run -a -e ./xvfb-run.stdout casperjs';
		cmd = 'xvfb-run -a casperjs';
//			cmd = 'casperjs';
	}
	if (verbose) {
		console.log('starting: ' + cmd + ' ' + args.join(' '));
	} else {
		console.log('starting: ' + page.selector + ' ' + pageKey(engine, width));
	}
	var loader = exec(cmd + ' ' + args.join(' '),
		function (error, stdout, stderr) {
			logExecResult('loaded page ' + page.url, error, "", stderr);
		}
	);
	loader.stdout.on('data', function(data) { console.log(pageKey(engine, width) + ': ' + data.trim()); });
	loader.stderr.on('data', function(data) { console.log(pageKey(engine, width) + ' stderr: ' + data.trim()); });
	loader.on('error', function(err) { console.log(pageKey(engine, width) + ' error: ' + err.trim()); });
	loader.on('close', function(code) {
		if (code > 0) {
			console.log('load ' + page.url + ' exit: ' + code);
		}
		page.loaded = true;
		callback(page);
	});
}

var addResult = function(page) {
	pagesLoaded[pageKey(page.engine, page.width)] = { page };
	console.log('finished: ' + page.selector + ' ' + pageKey(page.engine, page.width));
	if (pagesExpected.length == Object.keys(pagesLoaded).length) {
		console.log('finished all');
		// TODO create result page and trigger livereload
		//createHtmlPage(config, pagesLoaded);
	}
};

function logExecResult(msgStart, error, stdout, stderr) {
	if (stdout.length > 0) { console.log(msgStart + ' stdout: ' + stdout.trim()); }
	if (stderr.length > 0) { console.log(msgStart + ' stderr: ' + stderr.trim()); }
	if (error !== null)	   { console.log(msgStart + ' error:\n' + JSON.stringify(error, undefined, 4)); }
}

function pageKey(engine, width) {
	return engine + '_' + width;
}

