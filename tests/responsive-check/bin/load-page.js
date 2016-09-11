/*
 * Load page and take screenshot of element, save the html code and styles
 * add additional information like "hasHorizontalScrollbar"
 *
 * casperjs load-page.js --url="http://frontend.local/login/" --selector="form" --dest=../results/testcase --width=720'];
 *
 * additional argument to overwrite config settings:
 * --hover="#submit" --blacklist="adserv,doubleclick" --whitelist="trustedhostname.de"
 *
 * (c) Uwe Gerdes, entwicklung@uwegerdes.de
 */
'use strict';

var casper = require('casper').create(),
	x = require('casper').selectXPath,
	fs = require('fs');

var url = casper.cli.options.url || 'http://frontend.local/',
	selector = casper.cli.options.selector || 'form',
	dest = casper.cli.options.dest || '../results/testcase/phantomjs_720',
	width = parseInt(casper.cli.options.width) || 720,
	hover = '';

var verbose = true;

var results = {};

casper.echo('loading: ' + url + ', selector: "' + selector + '", saving "' + dest + '.*"', 'INFO');
try {
	var destDir = dest.replace(/(.+)\/.+/, '$1');
	console.log('destDir: ' + destDir);
	if (fs.stat(destDir) && !fs.stat(destDir).isDirectory()) {
		console.log('can\'t create ' + destDir);
	}
} catch(err) {
	fs.makeTree(destDir);
	console.log('created ' + destDir);
}

// event handling
casper.on('remote.message', function(msg) {
	this.echo('BROWSER: ' + msg.trim(), 'INFO');
});
casper.on('error', function(msg, backtrace) {
	this.echo('ERROR: ' + msg, 'WARNING');
	this.echo(JSON.stringify(backtrace, null, 4));
});
casper.on('http.status.404', function(resource) {
	this.echo('ERROR 404: ' + resource.url, 'ERROR');
});

// block external resources
casper.options.onResourceRequested = function(C, requestData, request) {
	if ( requestData.url.match(/https?:\/\//) ) {
//		casper.echo('skipped: ' + requestData.url, 'WARNING');
		request.abort();
	} else {
		if (verbose) { casper.echo('loading: ' + requestData.url, 'INFO'); }
	}
};

// evaluated in browser
// local declaration to keep jshint quiet
var document, XPathResult;
function _getStyles(selector, hover) {
	var getStyles = function(element, pseudo) {
		var styles = {};
		var y = document.defaultView.getComputedStyle(element, pseudo);
		for (var i=0; i < y.length; i++) {
			styles[y[i]] = y.getPropertyValue(y[i]);
		}
		return styles;
	};
	var getElementInfo = function(element) {
		var children = [];
		if (document.defaultView.getComputedStyle(element,':before').getPropertyValue('content')) {
			children.push({
				tagName: element.tagName.toLowerCase() + ':before',
				textContent: document.defaultView.getComputedStyle(element,':before').getPropertyValue('content'),
				elementId: '',
				cssclass: '',
				type: '',
				name: '',
				value: '',
				style: getStyles(element, ':before'),
				childElementCount : 0,
				childElementInfo : []
			});
		}
		for (var j=0; j<element.childElementCount; j++) {
			children.push(getElementInfo(element.children[j]));
		}
		var elementInfo = {
			tagName: element.tagName.toLowerCase(),
			elementId: element.getAttribute('id') || '',
			cssclass: element.getAttribute('class') || '',
			type: element.getAttribute('type') || '',
			name: element.getAttribute('name') || '',
			value: element.getAttribute('value') || '',
			textContent: element.textContent.trim().replace(/[ \n\t]+/g, " "),
			style: getStyles(element, null),
			childElementCount : element.childElementCount,
			childElementInfo : children
		};
		if (document.defaultView.getComputedStyle(element,':after').getPropertyValue('content')) {
			children.push({
				tagName: element.tagName.toLowerCase() + ':after',
				textContent: document.defaultView.getComputedStyle(element,':after').getPropertyValue('content'),
				elementId: '',
				cssclass: '',
				type: '',
				name: '',
				value: '',
				style: getStyles(element, ':after'),
				childElementCount : 0,
				childElementInfo : []
			});
		}
		return elementInfo;
	};
	var elements = [];
	var children = [];
	if (selector.indexOf('/') === 0) {
		children = document.evaluate(selector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	} else {
		children = document.querySelectorAll(selector);
	}
	for (var i=0; i<children.length; i++) {
		var elementInfo = getElementInfo(children[i]);
		elements.push(elementInfo);
	}
	return elements;
}

// set test class for element
function _setTestClass(selector) {
	document.querySelector(selector || 'body').classList.add('test');
}

casper.viewport(width, 700);

casper.start();

	casper.open(url, function() {
		this.echo('searching for "' + selector + '"', 'INFO');
		casper.evaluate(_setTestClass);
	})
	.then(function() {
		if (hover !== '') {
			this.echo('hover to "' + hover + '"', 'INFO');
			casper.mouse.move(hover);
		}
	})
	.then(function() {
		results[selector] = this.evaluate(_getStyles, selector, hover); // evaluate in browser
	})
	.then(function() {
	Object.keys(results).forEach(function(selector) {
		var result = results[selector];
		var name = safeFilename(selector);
		if (result && result.length > 0) {
			var html;
			if (selector.indexOf('/') === 0) {
				html = casper.getHTML(x(selector), true);
			} else {
				html = casper.getHTML(selector, true);
			}
			fs.write(destDir + '/' + name + '.html', html);
			casper.echo(destDir + '/' + name + '.html' + ' saved', 'INFO');
			fs.write(destDir + '/' + name + '.json', JSON.stringify(result, undefined, 4), 0);
			casper.echo(destDir + '/' + name + '.json' + ' saved', 'INFO');
			if (selector.indexOf('/') === 0) {
				casper.captureSelector(destDir + '/' + name + '.png', x(selector), { format: 'png' });
			} else {
				casper.captureSelector(destDir + '/' + name + '.png', selector, { format: 'png' });
			}
			casper.echo(destDir + '/' + name + '.png' + ' saved', 'INFO');
		} else {
			casper.echo('element not found: "' + selector + '"', 'ERROR');
		}
	});
	fs.write(destDir + '/page.html', casper.getHTML(), 0);
	casper.echo(destDir + '/page.html' + ' saved', 'INFO');
	casper.capture(destDir + '/page.png', undefined, { format: 'png' });
	casper.echo(destDir + '/page.png' + ' saved', 'INFO');
});
casper.run(function() {
	this.exit();
});

function safeFilename(name) {
	return name.replace(/[ ?#/:\(\)<>|\\]/g, "_").trim();
}
