/*
 * Load page and take screenshot of element, save the html code and styles
 * add additional information like "hasHorizontalScrollbar"
 *
 * casperjs load-page.js --url="http://frontend.local/login/" --selector="form" --dest=./results/testcase --width=720'];
 *
 * additional argument to overwrite config settings:
 * --hover="#submit" --blacklist="adserv,doubleclick" --whitelist="trustedhostname.de"
 *
 * (c) Uwe Gerdes, entwicklung@uwegerdes.de
 */
'use strict';

/* globals phantom */

var casper = require('casper').create(),
	x = require('casper').selectXPath,
	fs = require('fs');

if (!phantom) {
    console.error('CasperJS needs to be executed in a PhantomJS environment http://phantomjs.org/');
    phantom.exit(1);
}

var url = casper.cli.options.url || 'http://frontend.local/',
	selector = casper.cli.options.selector || 'form',
	dest = casper.cli.options.dest || './results/default/phantomjs_720',
	width = parseInt(casper.cli.options.width) || 720,
	hover = '';

var verbose = false;
var saveStyleTree = false;
var selectorFound = false;

var result = [];
var hasScrollbar;

if (verbose) {
	casper.echo('loading: ' + url + ', selector: "' + selector + '", saving "' + dest + '.*"', 'INFO');
}
try {
	var destDir = dest.replace(/(.+)\/.+/, '$1');
	if (!fs.isDirectory(destDir)) {
		fs.makeTree(destDir);
		console.log('created ' + destDir);
	}
} catch(err) {
	console.log('can\'t create ' + destDir + '\n' + err);
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
casper.on('page.error', function(msg, trace) {
	this.echo('page.error: ' + msg + '\n' + trace2string(trace), 'WARNING');
});
casper.on('remote.alert', function (message) {
	this.echo("// alert: " + message, 'WARNING');
});

// block external resources
casper.options.onResourceRequested = function(C, requestData, request) {
	if ( requestData.url.match(/https?:\/\//) ) {
		if (verbose) { casper.echo('loading: ' + requestData.url, 'INFO'); }
//		request.abort();
	} else {
		casper.echo('loading: ' + requestData.url, 'INFO');
	}
};

// evaluated in browser, keep jshint quiet
/* globals document, XPathResult */

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
		children = document.evaluate(selector, document, null, XPathResult.ALL, null).singleNodeValue;
	} else {
		children = document.querySelectorAll(selector);
	}
	for (var i=0; i<children.length; i++) {
		var elementInfo = getElementInfo(children[i]);
		elements.push(elementInfo);
	}
	return elements;
}

// check for horizontal scroll bar
function _checkHorizontalScrollbar(selector) {
	return document.body.scrollWidth > document.body.offsetWidth;
}

// set test class for element
function _setTestClass(selector) {
	document.querySelector(selector || 'body').classList.add('test');
}

casper.start();

casper.viewport(width, 700);

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
	if (saveStyleTree) {
		result = this.evaluate(_getStyles, selector, hover); // evaluate in browser
	}
})
.then(function() {
	hasScrollbar = this.evaluate(_checkHorizontalScrollbar, selector); // evaluate in browser
})
.then(function() {
	if (selector.indexOf('/') === 0) {
		selectorFound = this.exists(x(selector));
	} else {
		selectorFound = this.exists(selector);
	}
	if (selectorFound) {
		var html;
		if (selector.indexOf('/') === 0) {
			html = casper.getHTML(x(selector), true);
		} else {
			html = casper.getHTML(selector, true);
		}
		//fs.write(dest + '.html', html);
		//casper.echo(dest + '.html' + ' saved', 'INFO');
		if (saveStyleTree) {
			fs.write(dest + '.css.json', JSON.stringify(result, undefined, 4), 0);
		}
		if (verbose) {
			casper.echo(dest + '.css.json' + ' saved', 'INFO');
		}
		if (selector.indexOf('/') === 0) {
			casper.captureSelector(dest + '.png', x(selector), { format: 'png' });
		} else {
			casper.captureSelector(dest + '.png', selector, { format: 'png' });
		}
		if (verbose) {
			casper.echo(dest + '.png' + ' saved', 'INFO');
		}
	} else {
		casper.echo('element not found: "' + selector + '"', 'ERROR');
		fs.write(dest + '_page.html', casper.getHTML(), 0);
		casper.echo(dest + '_page.html' + ' saved', 'INFO');
	}
	if (hasScrollbar === true) {
		this.echo('page has horizontal scrollbar', 'WARNING');
		fs.write(destDir + '/result.log', url + ' ' + selector + ' page has horizontal scrollbar\n', 'a');
	} else {
		this.echo('page loaded ok', 'INFO');
		fs.write(destDir + '/result.log', url + ' ' + selector + ' page loaded ok\n', 'a');
	}
});

casper.run(function() {
	this.exit();
});

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
