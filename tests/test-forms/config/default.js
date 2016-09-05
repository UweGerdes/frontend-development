// Testdata for sample tests
//
// (c) Uwe Gerdes, entwicklung@uwegerdes.de

var domain = 'http://frontend.local';
var baseDir = '/login/';
var baseUrl = domain + baseDir;

module.exports = {
	name: 'default',
	dumpDir: './results/default/',
	viewportSize: { width: 600, height: 700 },
	testCases: [
		{
			name: 'LoginPage',
			uri: baseUrl,
			title1: 'Bitte anmelden',
			elements: {
				'//body[@id="loginBody"]': '',
				'//link[@rel="stylesheet"][@href="/login/css/application.css"]' : '',
				'//*[@id="headline"]': 'Anmelden',
				'//form[@name="login"]': '',
				'//input[@type="text"][@name="Username"][@value=""]': '',
				'//input[@type="password"][@name="Password"]': '',
				'//input[@type="checkbox"][@name="rememberMe"][@value="ja"]': '',
				'//*[@type="submit"][@name="submit"]': 'Anmelden',
				'//a[@href="/login/index.php/newAccount"]': 'Login beantragen',
				'//div[@id="pagecomplete"][contains(@class,"hidden")]': ''
			},
			elementsNotExist: [
				'//*[contains(@class,"inputError")]'
			]
		},
		{
			name: 'LoginFail',
			uri: baseUrl,
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
			title2: 'Bitte anmelden',
			elements: {
				'//*[@id="headline"]': 'Anmelden',
				'//*[@id="loginError"]': 'Anmeldung fehlgeschlagen!',
				'//*[@class="messages"]': 'Benutzername / Passwort nicht gültig',
				'//form[@name="login"][contains(@class,"inputError")]': '',
				'//input[@type="text"][@name="Username"][@value="usernamefailed"]': '',
				'//input[@type="password"][@name="Password"]': '',
				'//*[@type="submit"][@name="submit"]': 'Anmelden'
			}
		},
		{
			name: 'LoginFailPasswordShort',
			uri: baseUrl,
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
			title2: 'Bitte anmelden',
			elements: {
				'//*[@id="headline"]': 'Anmelden',
				'//*[@id="loginError"]': 'Anmeldung fehlgeschlagen!',
				'//*[@class="messages"]': 'Benutzername / Passwort nicht gültig',
				'//form[@name="login"][contains(@class,"inputError")]': '',
				'//input[@type="text"][@name="Username"][@value="failed"]': '',
				'//input[@type="password"][@name="Password"]': '',
				'//*[@type="submit"][@name="submit"]': 'Anmelden'
			}
		},
		{
			name: 'Error404Page',
			uri: baseUrl + 'index.php/unkownPage',
			title1: '404 not found: /unkownPage',
			elements: {
				'//h1' : 'Error 404: /unkownPage',
				'//*[contains(@class,"notLoggedIn")]': ''
			},
			elementsNotExist: [
				'//*[@id="headline"]',
				'//*[@id="loginError"]',
				'//*[contains(@class,"inputError")]',
				'//*[contains(@class,"loggedIn")]',
				'//form',
				'//input'
			]
		}
	]
};
