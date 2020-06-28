//
// default configuration for compare-layouts
//

// var slimerjs = 'slimerjs'; not supported anymore
var phantomjs = 'phantomjs';

module.exports = {
	destDir: 'default',
	whitelist: 'www.uwegerdes.de', // allow load from uri with this substring
	blacklist: '.js', // do not load - even if it comes from whitelist
	pages: {
		'index-phantomjs': {
			'url': 'http://dockerhost/',
			'selector': 'body',
			'engine': phantomjs,
			'cache': false
		},
		'index-phantomjs1': {
			'url': 'http://dockerhost/',
			'selector': 'body',
			'engine': phantomjs,
			'cache': false
		},
		'app-phantomjs': {
			'url': 'http://dockerhost/login/index.php',
			'selector': 'body',
			'engine': phantomjs,
			'cache': false
		},
		'app-phantomjs1': {
			'url': 'http://dockerhost/login/index.php',
			'selector': 'body',
			'engine': phantomjs,
			'cache': false
		}
	},
	compares: {
		'index-phantomjs-phantomjs1': {
			compare: ['tagName', 'type', 'textContent', 'name', 'value'],
			page1: 'index-phantomjs',
			page2: 'index-phantomjs1',
			showHTML: true
		},
		'app-phantomjs-phantomjs1': {
			compare: ['tagName', 'type', 'textContent', 'name', 'value'],
			page1: 'app-phantomjs',
			page2: 'app-phantomjs1',
			showHTML: true
		}
	}
};
