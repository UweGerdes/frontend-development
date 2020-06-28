/*
 * Laden von Styledaten von zwei HTML-Seiten vom Browser
 * und Vergleich von HTML-Styles für Regressions- und Back-to-Back-Tests
 *
 * node compare-layouts.js [configfile] [-v] [-r]
 *
 * configfile: config/name.js erwartet, Beispiele in ./config
 * -v: verbose
 * -r: force reload / ignore cache
 *
 * (c) Uwe Gerdes, entwicklung@uwegerdes.de
 */
'use strict';

var fs = require('fs'),
	exec = require('child_process').exec,
	obj2html = require('./bin/obj2html.js'),
	styleTree = require('./bin/style-tree.js');

var timeout = 50000;

var configFile = 'config/default.js',
	config = null;

if (process.argv[2]) {
	configFile = process.argv[2];
}
config = require('./' + configFile);

var reload = process.argv.indexOf('-r') > -1;
if (reload) {
	console.log('forced reload');
}

var verbose = process.argv.indexOf('-v') > -1;

var resultsDir = 'results';
var destDir = resultsDir + '/' + config.destDir;
var pages = config.pages;
var compares = config.compares;
var pagesLoaded = 0;

if (!fs.existsSync(resultsDir)) {
	fs.mkdirSync(resultsDir);
}
fs.stat(destDir, function(err, stats) {
	if (!stats) {
		fs.mkdir(destDir,
			function (err, data) {
				if (err) { throw err; }
				if (data) {console.log(data); }
				console.log('directory "' + destDir + '" created');
				load();
			}
		);
		console.log('creating directory "' + destDir + '"');
	} else {
		if (!stats.isDirectory()) {
			console.log(destDir + ' exists but is not a directory');
		} else {
			load();
			comparePages(); // cache-cache compare (for developement)
		}
	}
});

// the working directory has changed to data directory
function load() {
	Object.keys(pages).forEach(function(pageKey) {
		var page = pages[pageKey];
		var selectorList;
		if (page.selectorList) {
			selectorList = page.selectorList;
		} else {
			selectorList = page.selector.split(/,/);
		}
		if (reload || !page.cache || !isCached(destDir + '/' + pageKey, selectorList)) {
			loadPage(configFile, pageKey, page);
		} else {
			pagesLoaded++;
		}
	});
}

function loadPage(configFile, pageKey, page) {
	page.loaded = false;
	var args = ['./bin/load-page-styles.js',
		'--configFile="' + configFile + '"',
		'--pageKey="' + pageKey + '"'];
	var cmd = 'casperjs';
	if (page.engine) {
		args.unshift('--engine="' + page.engine + '"');
		if (page.engine == 'slimerjs') {
//			cmd = 'xvfb-run -a -e /home/node/app/tests/compare-layouts/casperjs.log casperjs';
			cmd = 'xvfb-run -a casperjs';
		}
	}
	console.log('starting: ' + cmd + ' ' + args.join(' '));
	var loader = exec(cmd + ' ' + args.join(' '), { timeout: timeout },
		function (error, stdout, stderr) {
			logExecResult('loaded page ' + page.url, error, "", stderr);
		}
	);
	loader.stdout.on('data', function(data) { if (verbose || data.indexOf('element not found') > -1) {console.log(pageKey + ': ' + data.trim());} });
	loader.stderr.on('data', function(data) { console.log(pageKey + ' stderr: ' + data.trim()); });
	loader.on('error', function(err) { console.log(pageKey + ' error: ' + err.trim()); });
	loader.on('close', function(code) {
		if (code > 0) {
			console.log('load ' + page.url + ' exit: ' + code);
		}
		page.loaded = true;
		pagesLoaded++;
		comparePages();
	});
}

var success = true;
var pagesLoading = [];
function comparePages() {
	if (pagesLoaded < Object.keys(pages).length) {
		return;
	}
	var results = {};
	Object.keys(compares).forEach(function(key) {
		var compare = compares[key];
		var page1 = pages[compare.page1];
		var page2 = pages[compare.page2];
		compare.selector1 = compare.selector1 ? compare.selector1 : page1.selector;
		compare.selector2 = compare.selector2 ? compare.selector2 : page2.selector;
		compare.baseFilename1 = destDir + '/' + compare.page1 + '/' + safeFilename(compare.selector1);
		compare.baseFilename2 = destDir + '/' + compare.page2 + '/' + safeFilename(compare.selector2);
		compare.exists1 = chkCacheFile(compare.baseFilename1 + '.json');
		compare.exists2 = chkCacheFile(compare.baseFilename2 + '.json');
		compare.success = false;
		if ((page1.cache || page1.loaded) && compare.exists1 &&
			(page2.cache || page2.loaded) && compare.exists2) {
			pagesLoading.push(key);
			compare.success = true;
			compare.compareFilename = destDir + '/' + safeFilename(key) + '_compare.png';
			compare.compositeFilename = destDir + '/' + safeFilename(key) + '_composite.png';
			compare.compositeMonochromeFilename = destDir + '/' + safeFilename(key) + '_composite_monochrome.png';
			compare.jsonFilename = destDir + '/' + safeFilename(key) + '.json';
			compare.htmlFilename = destDir + '/' + safeFilename(key) + '.html';
			exec('compare -metric AE ' + compare.baseFilename1 + '.png ' + compare.baseFilename2 + '.png ' + compare.compareFilename,
				function (error, stdout, stderr) {
					if (verbose) { logExecResult('compare', null, stdout, stderr.replace(/ @.+/, '').replace(/^0$/, '')); }
					if (stderr == '0') {
						if (verbose) { console.log(compare.compareFilename + ' saved'); }
					} else {
						compare.success = false;
						success = false;
					}
					compare.imageStderr = stderr;
					exec('composite -compose difference ' + compare.baseFilename1 + '.png ' + compare.baseFilename2 + '.png ' + compare.compositeFilename,
						function (error, stdout, stderr) {
							logExecResult('composite', null, stdout, stderr.replace(/ @.+/, ''));
							if (stderr.length === 0) {
								if (verbose) { console.log(compare.compositeFilename + ' saved'); }
							} else {
								compare.compositeFilename = '';
								compare.success = false;
								success = false;
							}
							exec('composite -compose difference -monochrome ' + compare.baseFilename2 + '.png ' + compare.baseFilename2 + '.png ' + compare.compositeMonochromeFilename,
								function (error, stdout, stderr) {
									logExecResult('composite -monochrome', null, stdout, stderr.replace(/ @.+/, ''));
									if (stderr.length === 0) {
										if (verbose) { console.log(compare.compositeMonochromeFilename + ' saved'); }
									} else {
										compare.compositeMonochromeFilename = '';
										compare.success = false;
										success = false;
									}
									compareResults(compare);
									pagesLoading.splice(pagesLoading.indexOf(key), 1);
									if (pagesLoading.length === 0) {
										fs.writeFile(destDir + '/' + 'index.json', JSON.stringify(results, null, 4), (err) => {
											if (err) {
												console.log('ERROR: ' + err);
											} else {
												console.log((success ? "SUCCESS" : "FAIL") + ' compare-layouts/' + destDir + '/index.json');
											}
										});
									}
								}
							);
						}
					);
				}
			);
		}
		results[key] = compare;
	});
}

function compareResults(compare) {
	var page1 = pages[compare.page1];
	var selector1 = compare.selector1 ? compare.selector1 : page1.selector;
	var page2 = pages[compare.page2];
	var selector2 = compare.selector2 ? compare.selector2 : page2.selector;
	if (chkCacheFile(destDir + '/' + compare.page1 + '/' + safeFilename(selector1) + '.json') &&
		chkCacheFile(destDir + '/' + compare.page2 + '/' + safeFilename(selector2) + '.json')) {
		var styleTree1 = styleTree(JSON.parse(fs.readFileSync(destDir + '/' + compare.page1 + '/' + safeFilename(selector1) + '.json')));
		var styleTree2 = styleTree(JSON.parse(fs.readFileSync(destDir + '/' + compare.page2 + '/' + safeFilename(selector2) + '.json')));
		var compareResult = styleTree1.compareTo(styleTree2, compare.compare);
		compare.resultHtml = obj2html.toHtml(compareResult);
		fs.writeFile(compare.jsonFilename, JSON.stringify(compareResult, undefined, 4), (err) => {
			if (err) {
				console.log('ERROR: ' + err);
			} else {
				console.log(compare.jsonFilename + ' saved');
			}
		});
		return true;
	} else {
		return false;
	}
}

function logExecResult(msgStart, error, stdout, stderr) {
	if (stdout.length > 0) { console.log(msgStart + ' stdout: ' + stdout.trim()); }
	if (stderr.length > 0) { console.log(msgStart + ' stderr: ' + stderr.trim()); }
	if (error !== null)	{ console.log(msgStart + ' error:\n' + JSON.stringify(error, undefined, 4)); }
}

function isCached(subdir, selectorList) {
	var result = true;
	selectorList.forEach(function(selector) {
		if (chkCacheFile(subdir + '/' + safeFilename(selector) + '.json') === false ||
			chkCacheFile(subdir + '/' + safeFilename(selector) + '.png') === false ||
			chkCacheFile(subdir + '/' + safeFilename(selector) + '.html') === false) {
			result = false;
		}
	});
	return result;
}

function chkCacheFile(filename) {
	try {
		return fs.lstatSync(filename).isFile();
	} catch(err) {
		// console.log('chk ' + filename + ' not found');
	}
	return false;
}

function safeFilename(name) {
	return name.replace(/[ ?#/:\(\)<>|\\]/g, "_").trim();
}
