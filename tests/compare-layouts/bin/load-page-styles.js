/*
 * Laden von Styledaten einer HTML-Seite vom Browser
 * für Vergleich von HTML-Styles für Regressions- und Back-to-Back-Tests
 *
 * casperjs load-page-styles.js --configFile="../config/default.js" --pageKey="google-form-phantomjs"
 *
 * additional argument to overwrite config settings:
 * --url=https://www.google.de --selector="form" --subdir=google-form --hover="#submit" --blacklist="adserv,doubleclick" --whitelist="trustedhostname.de"
 *
 * (c) Uwe Gerdes, entwicklung@uwegerdes.de
 */
'use strict';

/* globals document, XPathResult */

var casper = require('casper').create(),
	x = require('casper').selectXPath,
	fs = require('fs');

var config = null,
	pageKey = '',
	subdir = 'dockerhost',
	url = 'http://dockerhost/',
	domain = 'dockerhost',
	viewports = {
		'Tablet Portrait': { width:  768, height: 1024 }
	},
	hover = '',
	whitelist = '',
	blacklist = '',
	uname = '',
	pval = '',
	timeout = 20000,
	showExternalUrls = false;

var results = {};

// evaluating arguments
if (casper.cli.options.configFile && casper.cli.options.pageKey) {
	var configFile = fs.absolute(casper.cli.options.configFile);
	pageKey = casper.cli.options.pageKey;
	console.log("config file: " + configFile);
	try {
		config = require(configFile);
	}
	catch (err) {
		throw("FAIL: could not read file " + configFile);
	}
	subdir = 'results/' + config.destDir + '/' + pageKey;
	console.log('subdir: ' + subdir);
	if (config.pages[pageKey]) {
		var page = config.pages[pageKey];
		url = page.url;
		domain = url.replace(/^https?:\/\/([^\/]+).*/, '$1');
		var selectorList;
		if (page.selectorList) {
			selectorList = page.selectorList;
		} else {
			selectorList = page.selector.split(/,/);
		}
		if (page.hover) {
			hover = page.hover;
		}
		if (page.credentials && page.credentials.length == 2) {
			uname = page.credentials[0];
			pval = page.credentials[1];
		}
	} else {
		throw("FAIL: pageKey not found: " + pageKey);
	}
	if (config.widths && config.widths.length > 0) {
		widths = config.widths;
	}
	if (config.viewports) {
		viewports = config.viewports;
	}
	if (config.blacklist && config.blacklist.length > 0) {
		blacklist = config.blacklist;
	}
	if (config.whitelist && config.whitelist.length > 0) {
		whitelist = config.whitelist;
	}
} else {
	throw("FAIL: configFile and pageKey have to be provided");
}
casper.echo('loading: ' + url + ', selector: "' + selectorList.join(',') + (hover !== '' ? '", hover:"' + hover : '' ) + '", saving in "' + subdir + '"', 'INFO');
try {
	if (fs.stat(subdir) && !fs.stat(subdir).isDirectory()) {
		console.log('can\'t create ' + subdir);
	}
} catch(err) {
	fs.makeTree(subdir);
	console.log('created ' + subdir);
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
	if ( requestData.url.match(/https?:\/\//) && ( ! whitelistOk(requestData) || blacklistHit(requestData) ) ) {
		if (showExternalUrls) {
			casper.echo('skipped: ' + requestData.url, 'WARNING');
		}
		request.abort();
	} else {
		if (showExternalUrls) {
			casper.echo('loading: ' + requestData.url, 'INFO');
		}
	}
};

casper.options.timeout = timeout;
casper.options.onTimeout = function (timeout) {
	casper.echo('TIMEOUT ' + timeout + 'ms without answer from server', 'ERROR');
};
//casper.options.waitTimeout = timeout;
casper.options.onLoadError = function () {
	casper.echo('LOAD ERROR', 'ERROR');
};

function whitelistOk(requestData) {
	var result = false;
	if (requestData.url.indexOf(domain) > -1) {
		result = true;
	} else {
		whitelist.split(/,\s*/).forEach(function(whitedomain){
			if (requestData.url.indexOf(whitedomain) > -1) {
				result = true;
			}
		});
	}
	return result;
}

function blacklistHit(requestData) {
	var result = false;
	if (blacklist.length > 0) {
		blacklist.split(/,\s*/).forEach(function(blackdomain){
			if (requestData.url.indexOf(blackdomain) > -1) {
				result = true;
			}
		});
	}
	return result;
}

// evaluated in browser
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
				_childElementCount : 0,
				_childElementInfo : []
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
			_childElementCount : element.childElementCount,
			_childElementInfo : children
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
				_childElementCount : 0,
				_childElementInfo : []
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

casper.start();

if (uname.length > 0 && pval.length > 0) {
	casper.setHttpAuth(uname, pval);
}

selectorList.forEach(function(sel) {
	casper.thenOpen(url, function() {
		this.echo('searching for "' + sel + '"', 'INFO');
		casper.evaluate(_setTestClass);
	})
	.then(function() {
		if (hover !== '') {
			this.echo('hover to "' + hover + '"', 'INFO');
			casper.mouse.move(hover);
		}
	})
	.then(function() {
		results[sel] = this.evaluate(_getStyles, sel, hover); // evaluate in browser
	});
});
casper.then(function() {
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
			fs.write(subdir + '/' + name + '.html', html);
			casper.echo(subdir + '/' + name + '.html' + ' saved', 'INFO');
			fs.write(subdir + '/' + name + '.json', JSON.stringify(result, undefined, 4), 0);
			casper.echo(subdir + '/' + name + '.json' + ' saved', 'INFO');
			if (selector.indexOf('/') === 0) {
				casper.captureSelector(subdir + '/' + name + '.png', x(selector), { format: 'png' });
			} else {
				casper.captureSelector(subdir + '/' + name + '.png', selector, { format: 'png' });
			}
			casper.echo(subdir + '/' + name + '.png' + ' saved', 'INFO');
		} else {
			casper.echo('element not found: "' + selector + '"', 'ERROR');
		}
	});
	fs.write(subdir + '/page.html', casper.getHTML(), 0);
	casper.echo(subdir + '/page.html' + ' saved', 'INFO');
	casper.capture(subdir + '/page.png', undefined, { format: 'png' });
	casper.echo(subdir + '/page.png' + ' saved', 'INFO');
});
casper.run(function() {
	this.exit();
});

function safeFilename(name) {
	return name.replace(/[ .?#/:\(\)<>|\\]/g, "_").trim();
}
