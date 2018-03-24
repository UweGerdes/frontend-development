// Testdata for sample tests
//
// (c) Uwe Gerdes, entwicklung@uwegerdes.de

var server = 'dockerhost';
var baseUrl = 'http://' + server + '/login';

module.exports = {
	name: 'default',
	dumpDir: './results/default/',
	viewportSize: { width: 600, height: 700 },
	testCases: [
		{
			name: 'LoginPage',
			uri: baseUrl + '/index.php',
			title1: 'Bitte anmelden',
			elements: {
				'//body[@class="loginBody"]': '',
				'//link[@rel="stylesheet"][@href="/login/css/login.css"]' : '',
				'//*[@id="headline"]': 'Anmelden',
				'//form[@name="login"]': '',
				'//input[@type="text"][@name="Username"][@value=""]': '',
				'//input[@type="password"][@name="Password"]': '',
				'//input[@type="checkbox"][@name="rememberMe"][@value="ja"]': '',
				'//*[@type="submit"][@name="submit"]': 'Anmelden',
				'//a[@href="/login/index.php?newAccount"]': 'Login beantragen',
				'//div[@id="pagecomplete"][contains(@class,"hidden")]': ''
			},
			elementsNotExist: [
				'//*[contains(@class,"has-error")]'
			]
		},
		{
			name: 'LoginFail',
			uri: baseUrl + '/index.php',
			title1: 'Bitte anmelden',
			input: [
				'form[name="login"]',
				{
					Username: 'usernamefailed',
					Password: 'passwordfailed'
				}
			],
			submit: '//*[@type="submit"]',
			alerts: [],
			waitForSelector: '//*[@id="loginError"]',
			title2: 'Bitte anmelden',
			elements: {
				'//*[@id="headline"]': 'Anmelden',
				'//*[@id="loginError"]': 'Anmeldung fehlgeschlagen!',
				'//*[contains(@class, "messages")]': 'Benutzername / Passwort nicht gültig',
				'//form[@name="login"]': '',
				'//div[contains(@class,"has-error")]/input[@type="text"][@name="Username"][@value="usernamefailed"]': '',
				'//div[contains(@class,"has-error")]/input[@type="password"][@name="Password"]': '',
				'//*[@type="submit"][@name="submit"]': 'Anmelden'
			}
		},
		{
			name: 'LoginFailPasswordShort',
			uri: baseUrl + '/index.php',
			title1: 'Bitte anmelden',
			input: [
				'form[name="login"]',
				{
					Username: 'failed',
					Password: 'fail'
				}
			],
			submit: '//*[@type="submit"]',
			alerts: [],
			waitForSelector: '//*[@id="loginError"]',
			title2: 'Bitte anmelden',
			elements: {
				'//*[@id="headline"]': 'Anmelden',
				'//*[@id="loginError"]': 'Anmeldung fehlgeschlagen!',
				'//*[contains(@class, "messages")]': 'Benutzername / Passwort nicht gültig',
				'//form[@name="login"]': '',
				'//div[contains(@class,"has-error")]/input[@type="text"][@name="Username"][@value="failed"]': '',
				'//div[contains(@class,"has-error")]/input[@type="password"][@name="Password"]': '',
				'//*[@type="submit"][@name="submit"]': 'Anmelden'
			}
		},
		{
			name: 'Error404ServerScriptUnknown',
			uri: baseUrl + '/unknown.php',
			title1: '404 Not Found',
			elements: {
				'//h1' : '404 Not Found'
			},
			elementsNotExist: [
				'//*[@id="headline"]',
				'//*[@id="loginError"]',
				'//*[contains(@class,"has-error")]',
				'//*[contains(@class,"loggedIn")]',
				'//form',
				'//input'
			]
		},
		{
			name: 'Error404LoginPageUnknown',
			uri: baseUrl + '/index.php?unkownPage',
			title1: '404 not found: unkownPage',
			elements: {
				'//h1' : 'Error 404: unkownPage',
				'//*[contains(@class,"notLoggedIn")]': ''
			},
			elementsNotExist: [
				'//*[@id="headline"]',
				'//*[@id="loginError"]',
				'//*[contains(@class,"has-error")]',
				'//*[contains(@class,"loggedIn")]',
				'//form',
				'//input'
			]
		}
	]
};
