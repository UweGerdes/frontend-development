/*
 * default configuration for responsive-check
 */

var slimerjs = 'slimerjs';
var phantomjs = 'phantomjs';

var server = 'dockerhost';
var baseUrl = 'http://' + server + '/login/index.php?logout=true';
var selector = 'form';
var destDir = 'default';
var engines = [ phantomjs, slimerjs ];
var viewports = [
	{
		'name': 'smartphone-portrait',
		'viewport': {width: 320, height: 480}
	},
	{
		'name': 'desktop-standard',
		'viewport': {width: 1280, height: 1024}
	}
];
/*
 * TODO:
var resultStyles = 'body{background-color:#666666}';
var hover = "#submit";
var whitelist = 'www.uwegerdes.de'; // allow load from uri with this substring
var blacklist = '.js'; // do not load - even if it comes from whitelist
var credentials = [ 'username', 'pass' + 'word' ];
 */

module.exports = {
	destDir: destDir,
	url: baseUrl,
	selector: selector,
	viewports: viewports,
	engines: engines
};
