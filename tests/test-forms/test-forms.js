/*
 * Testing http server pages
 *
 * execute: casperjs [--engine=slimerjs] test test-forms.js --cfg=config/my_test.js
 *
 * (c) Uwe Gerdes, entwicklung@uwegerdes.de
 *
 * The config file contains test cases and exports a test suite stucture.
 *
 * testCases is an Array of tests, add them like this to the config file:

var testCases = [];
testCases.push(
	{
		name: 'first test',
		uri: 'http://somedomain.net/path/to/page.html',
		title1: 'expected title of page',
		input: [
			'form[name="formname"]', // css selector
			{
				field1: 'value 1', // form field name and value
				field2: 'another value',
				checkbox1: 'checkboxvalue',
				checkbox2: true
			}
		],
		submit: '//*[@type="submit"]', // XPath to submit button - optional, defaults to '//*[@type="submit"]'
		alerts: [ 'An error occured' ], // list of all expected alerts, optional
		title2: 'expected title of page after submit',
		elements: {
			'//h1': 'My awesome headline', // XPath to element content check, plain text
			'//*[@id="someElement"]': '' // only check existence, no content check
		},
		elementsNotExist: [
			'//form[@name="formname"]',
			'//input[@type="text"][@name="field1"]'
		]
	}
);

 * To check elements before submit add a test case without input
 *
 * The config file is required to export the following structure:

module.exports = {
	name: 'test suite name',
	dumpDir: './results/<testsuite>/',
	viewportSize: { width: 1100, height: 700 }, // optional
	testCases: testCases
};

 */
'use strict';

/* globals casper, phantom */

var colorizer = require('colorizer').create('Colorizer'),
	fs = require('fs'),
	x = require('casper').selectXPath;

if (!phantom) {
    console.error('CasperJS needs to be executed in a PhantomJS environment http://phantomjs.org/');
    phantom.exit(1);
}

var testData = null;
if (casper.cli.options.cfg) {
	var path = casper.cli.options.cfg;
	if (fs.exists(fs.absolute(fs.workingDirectory + '/' + path))) {
		casper.echo('Executing: "' + fs.absolute(fs.workingDirectory + '/' + path) + '"', 'INFO');
		testData = require(fs.absolute(fs.workingDirectory + '/' + path));
	} else {
		casper.echo('ERROR: file not found: "' + fs.absolute(fs.workingDirectory + '/' + path) + '"');
	}
} else {
	casper.echo('Executing default: "' + fs.absolute(fs.workingDirectory + '/config/my_test.js') + '"', 'INFO');
	testData = require(fs.absolute(fs.workingDirectory + '/config/my_test.js'));
}
if (typeof(casper.cli.options.dumpDir) !== 'undefined') {
	testData.dumpDir = casper.cli.options.dumpDir;
}
if (testData) {
	fs.makeTree(testData.dumpDir);
	if (testData.viewportSize) {
		casper.options.viewportSize = testData.viewportSize;
	} else {
		casper.options.viewportSize = { width: 1024, height: 768 };
	}

	casper.on('http.status.404', function(resource) {
		this.echo('Error 404: ' + resource.url, 'WARNING');
	});
	casper.on('error', function(msg, trace) {
		this.echo('error: ' + msg, 'ERROR');
	});
	casper.on('remote.message', function(msg) {
		this.echo('remote.message: ' + msg, 'INFO');
	});
	casper.on('page.error', function(msg, trace) {
		this.echo('page.error: ' + msg + '\n' + trace2string(trace), 'WARNING');
	});

	var browserAlerts = [];
	casper.on('remote.alert', function (message) {
		browserAlerts.push(message);
		console.log("// alert: " + colorizer.format(message, { bg: 'yellow', fg: 'black', bold: true } ));
	});

	casper.test.begin('Test: ' + testData.name, function suite(test) {
		var testsSuccessful = 0;
		var testsExecuted = 0;
		casper.start();

		testData.testCases.forEach(function(testCase) {
			var logLabel = testData.name + ' ' + testCase.name + ': ';

			casper.thenOpen(testCase.uri, function() {
				browserAlerts = [];
				this.echo('Test: ' + testData.name + ', Testcase: ' + testCase.name + ': ' + testCase.uri, 'INFO');
				fs.write(testData.dumpDir + testCase.name + '1.html', casper.getHTML(), 0);
				if (testCase.input) {
					test.assertExists(testCase.input[0], logLabel + testCase.input[0] + ' element found');
					this.fill(testCase.input[0], testCase.input[1], false);
					casper.capture(testData.dumpDir + testCase.name + '1.png', undefined, { format: 'png' });
				}
				if (testCase.title1) {
					test.assertEquals(this.getTitle(), testCase.title1, logLabel + 'page title before submit');
				}
			});

			if (testCase.submit) {
				casper.then(function() {
					casper.click(x(testCase.submit));
				});
			}

			casper.then(function() {
				fs.write(testData.dumpDir + testCase.name + '2.html', casper.getHTML(), 0);
				casper.capture(testData.dumpDir + testCase.name + '2.png', undefined, { format: 'png' });
				if (testCase.title2) {
					test.assertEquals(this.getTitle(), testCase.title2, logLabel + 'page title after submit');
				}
				if (testCase.hasOwnProperty("alerts")) {
					test.assertEquals(browserAlerts, testCase.alerts, logLabel + 'alerts');
				}
				Object.keys(testCase.elements).forEach(function(selector) {
					test.assertExists(x(selector), logLabel + selector + ' element found');
					if (testCase.elements[selector]) {
						test.assertEquals(casper.fetchText(x(selector)).trim(), testCase.elements[selector], logLabel + selector + ' content');
					}
				});
				if (testCase.elementsNotExist) {
					testCase.elementsNotExist.forEach(function(selector) {
						test.assertNotExists(x(selector), logLabel + selector + ' element not there');
					});
				}
				testsSuccessful++;
			});
			testsExecuted++;
		});

		casper.run(function() {
			if (testsSuccessful == testsExecuted) {
				this.echo('SUCCESSFUL: ' + testsSuccessful + ' testcases', 'INFO').exit(0);
			} else {
				this.echo('FAIL ' + testsSuccessful + ' successful and ' + (testsExecuted - testsSuccessful) + ' failed testcases.', 'ERROR').exit(1);
			}
			test.done();
		});
	});
} else {
	casper.test.done();
}

function trace2string(trace) {
	var result = [];
	Object.keys(trace).forEach(function (entry) {
		var lines = [];
		Object.keys(trace[entry]).forEach(function (key) {
			lines.push(trace[entry][key]);
		});
		result.push(lines.join(' '));
	});
	return result.join('\n');
}
