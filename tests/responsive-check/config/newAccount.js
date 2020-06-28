/*
 * default configuration for responsive-check
 */

// var slimerjs = 'slimerjs'; not supported anymore
var phantomjs = 'phantomjs';

var server = 'dockerhost';
var baseUrl = 'http://' + server + '/login/index.php?newAccount';
var selector = 'form[name="newAccount"]';
var destDir = 'newAccount';
var engines = [ phantomjs ];
var viewports = [
	{
		'name': 'smartphone-portrait',
		'viewport': {width: 320, height: 480}
	},
	{
		'name': 'smartphone-landscape',
		'viewport': {width: 480, height: 320}
	},
	{
		'name': 'tablet-portrait',
		'viewport': {width: 768, height: 1024}
	},
	{
		'name': 'tablet-landscape',
		'viewport': {width: 1024, height: 768}
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
