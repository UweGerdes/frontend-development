/*
 * Start eines HTTP-Servers für responsive-check
 *
 * node server.js
 *
 * config-Dateien in ./config
 * Ergebnis-Dateien in ./results
 *
 * (c) Uwe Gerdes, entwicklung@uwegerdes.de
 */
'use strict';

var bodyParser = require('body-parser'),
	_eval = require('eval'),
	exec = require('child_process').exec,
	express = require('express'),
	fs = require('fs'),
	fsTools = require('fs-tools'),
	logger = require('morgan'),
	os = require('os'),
	path = require('path'),
	interfaces = os.networkInterfaces(),
	app = express();

var httpPort = process.env.HTTP_PORT;

var configDir = path.join('./', 'config'),
	resultsDir = path.join('./', 'results');

if (!fs.existsSync(resultsDir)) {
	fs.mkdirSync(resultsDir);
}

var running = [],
	configs = getConfigs();

// Log the requests
app.use(logger('dev'));

// work on post requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Serve static files
app.use(express.static(__dirname));

// Handle form post requests for result view
app.post('/result/:config', function(req, res){
	var config = {};
	console.log('post: ' + req.params.config + ' ' + req.params.action);
	if (req.params.config) {
		var configFilename = path.join(configDir, req.params.config + '.js');
		if(fs.existsSync()) {
			config = require(configFilename);
			res.render('resultView.ejs', {
				config: config,
				httpPort: httpPort
			});
		} else {
			config.error = 'config file not found: ' + configFilename;
			res.status(404)
				.send('config file not found: ' + configFilename);
		}

	}
});

// Handle AJAX requests for run configs
app.get('/start/:config/:verbose?', function(req, res){
	if (req.params.config == 'all') {
		configs.forEach(function(config) {
			runConfigAsync(config, req.params.verbose, res);
		});
	} else {
		runConfigAsync(getConfig(req.params.config), req.params.verbose, res);
	}
});

// Handle AJAX requests for clear results
app.get('/clear/:config', function(req, res){
	if (req.params.config == 'all') {
		configs.forEach(function(config) {
			clearResult(config, res);
		});
	} else {
		clearResult(getConfig(req.params.config), res);
	}
});

// Route for root dir
app.get('/', function(req, res){
	res.sendFile(path.join(__dirname, 'index.html'));
});

// Route for everything else.
app.get('*', function(req, res){
	res.status(404).send('Sorry cant find that: ' + req.url);
});

// Fire it up!
app.listen(httpPort);
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}
// console.log("IP address of container  :  " + addresses);
console.log('compare-layouts server listening on http://' + addresses[0] + ':' + httpPort);

// Model //
// get configurations
function getConfigs() {
	configs = [];
	fs.readdirSync(configDir).forEach(function(fileName) {
		var configName = fileName.replace(/\.js/, '');
		configs[configName] = getConfig(configName);
	});
	return configs;
}

// get data from config file
function getConfig(configName) {
	var configData = '';
	var configFilename = path.join(configDir, configName + '.js');
	try {
		configData = _eval( fs.readFileSync( configFilename ).toString() );
	} catch (err) {
		console.log('config file error: ' + configFilename);
	}
	return configData;
}

// start compare-layouts with config file
function runConfigAsync(config, verbose, res) {
	var destDir = path.join(__dirname, 'results', config.data.destDir);
	var logfilePath = path.join(destDir, 'console.log');
	var log = function (msg) {
		console.log(msg);
		fs.appendFileSync(logfilePath, msg + '\n');
		res.write(replaceAnsiColors(msg) + '\n');
	};
	if (!fs.existsSync(destDir)) {
		fs.mkdirSync(destDir);
	}
	log('server started ' + config.name);
	running.push(config.name);
	if (fs.existsSync(logfilePath)) {
		fs.unlinkSync(logfilePath);
	}
	var configFilename = 'config/' + config.name + '.js';
	var loader = exec('node compare-layouts.js ' + configFilename + (verbose ? ' -v' : ''));
	loader.stdout.on('data', function(data) { log(data.toString().trim()); });
	loader.stderr.on('data', function(data) { log(data.toString().trim()); });
	loader.on('error', function(err) { log(' error: ' + err.toString().trim()); });
	loader.on('close', function(code) {
		if (code > 0) {
			log('load ' + config.name + ' error, exit-code: ' + code);
		}
		log('server finished ' + config.name);
		running.splice(running.indexOf(config.name), 1);
		if (running.length === 0) {
			res.end();
		}
	});
}

// delete results directory
function clearResult(config, res) {
	var destDir = path.join(__dirname, 'results', config.data.destDir);
	var log = function (msg) {
		console.log(msg);
		res.write(replaceAnsiColors(msg) + '\n');
	};
	if (fs.existsSync(destDir)) {
		fsTools.removeSync(destDir);
	}
	log('Ergebnisse gelöscht für ' + config.name);
	res.end();
}

function replaceAnsiColors(string) {
	var result = '';
	var replaceTable = {
		 '0': 'none',
		 '1': 'font-weight: bold',
		 '4': 'text-decoration: underscore',
		 '5': 'text-decoration: blink',
		 '7': 'text-decoration: reverse',
		 '8': 'text-decoration: concealed',
		'30': 'color: black',
		'31': 'color: red',
		'32': 'color: green',
		'33': 'color: yellow',
		'34': 'color: blue',
		'35': 'color: magenta',
		'36': 'color: cyan',
		'37': 'color: white',
		'40': 'background-color: black',
		'41': 'background-color: red',
		'42': 'background-color: green',
		'43': 'background-color: yellow',
		'44': 'background-color: blue',
		'45': 'background-color: magenta',
		'46': 'background-color: cyan',
		'47': 'background-color: white'
	};
	string.toString().split(/(\x1B\[[0-9;]+m)/).forEach(function(part) {
		if (part.match(/(\x1B\[[0-9;]+m)/)) {
			part = part.replace(/\x1B\[([0-9;]+)m/, '$1');
			if (part == '0') {
				result += '</span>';
			} else {
				result += '<span style="';
				part.split(/(;)/).forEach(function(x) {
					if (replaceTable[x]) {
						result += replaceTable[x];
					} else {
						result += x;
					}
				});
				result += '">';
			}
		} else {
			result += part;
		}
	});
	return result;
}
