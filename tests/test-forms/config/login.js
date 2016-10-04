// Testdata for login tests
//
// (c) Uwe Gerdes, entwicklung@uwegerdes.de

/* globals casper */

var server = casper.cli.options.WEBSERVER || 'dockerhost';
var domain = 'http://' + server + '/';
var baseDir = 'login/';
var scriptName = 'index.php';
var baseUrl = domain + baseDir;

var testCases = [];

testCases.push(
	{
		name: 'ResetTestUser',
		uri: baseUrl + scriptName +'?deleteAccount&username=testuser',
		title1: 'Login Zugang gelöscht',
		elements: {
			'//body[@class="deleteAccountBodyOk"]': '',
			'//*[@id="headline"]': 'Daten gelöscht.',
			'//a[@href="/login/index.php"]': 'zurück zur Anmeldeseite'
		},
		elementsNotExist: [
			'//*[contains(@class,"inputError")]'
		]
	}
);

testCases.push(
	{
		name: 'LoginPage',
		uri: baseUrl + scriptName,
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
			'//*[contains(@class,"inputError")]'
		]
	}
);

testCases.push(
	{
		name: 'LoginFail',
		uri: baseUrl + scriptName,
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
			'//*[contains(@class, "messages")]': 'Benutzername / Passwort nicht gültig',
			'//form[@name="login"][contains(@class,"inputError")]': '',
			'//input[@type="text"][@name="Username"][@value="usernamefailed"]': '',
			'//input[@type="password"][@name="Password"]': '',
			'//*[@type="submit"][@name="submit"]': 'Anmelden'
		}
	}
);

testCases.push(
	{
		name: 'LoginFailPasswordShort',
		uri: baseUrl + scriptName,
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
			'//*[contains(@class, "messages")]': 'Benutzername / Passwort nicht gültig',
			'//form[@name="login"][contains(@class,"inputError")]': '',
			'//input[@type="text"][@name="Username"][@value="failed"]': '',
			'//input[@type="password"][@name="Password"]': '',
			'//*[@type="submit"][@name="submit"]': 'Anmelden'
		}
	}
);

testCases.push(
	{
		name: 'SignUpPage',
		uri: baseUrl + scriptName +'?newAccount',
		title1: 'Login Zugang beantragen',
		elements: {
			'//body[@class="newAccountBody"]': '',
			'//*[@id="headline"]': 'Zugang beantragen',
			'//form[@name="newAccount"]': '',
			'//input[@type="text"][@name="Name"][@value=""]': '',
			'//input[@type="text"][@name="eMail"][@value=""]': '',
			'//input[@type="text"][@name="Username"][@value=""]': '',
			'//input[@type="password"][@name="Password"]': '',
			'//input[@type="password"][@name="Password2"]': '',
			'//*[@type="submit"][@name="submit"]': 'Anmelden'
		},
		elementsNotExist: [
			'//*[contains(@class,"inputError")]'
		]
	}
);

testCases.push(
	{
		name: 'SignUpFailAllEmpty',
		uri: baseUrl + scriptName +'?newAccount',
		title1: 'Login Zugang beantragen',
		input: [
			'form[name="newAccount"]',
			{
			}
		],
		submit: '//*[@type="submit"]',
		alerts: [],
		title2: 'Login Zugang beantragen',
		elements: {
			'//body[@class="newAccountBody"]': '',
			'//*[@id="headline"]': 'Zugang beantragen',
			'//form[@name="newAccount"][contains(@class,"inputError")]': '',
			'//*[@id="newAccountError"]': 'Anwendername fehlt.Mail-Adresse fehlt.Anmeldename fehlt.Passwort fehlt oder die Passworte stimmen nicht überein.',
			'//div[contains(@class,"inputError")]//input[@type="text"][@name="Name"][@value=""]': '',
			'//div[contains(@class,"inputError")]//input[@type="text"][@name="eMail"][@value=""]': '',
			'//div[contains(@class,"inputError")]//input[@type="text"][@name="Username"][@value=""]': '',
			'//div[contains(@class,"inputError")]//input[@type="password"][@name="Password"]': '',
			'//div[contains(@class,"inputError")]//input[@type="password"][@name="Password2"]': '',
			'//*[@type="submit"][@name="submit"]': 'Anmelden'
		}
	}
);

testCases.push(
	{
		name: 'SignUpFailMailError',
		uri: baseUrl + scriptName +'?newAccount',
		title1: 'Login Zugang beantragen',
		input: [
			'form[name="newAccount"]',
			{
				Name: 'Testuser 1',
				eMail: 'failed_uwegerdes.de',
				Username: 'testuser1',
				Password: 'testpassword1',
				Password2: 'testpassword1'
			}
		],
		submit: '//*[@type="submit"]',
		alerts: [],
		title2: 'Login Zugang beantragen',
		elements: {
			'//body[@class="newAccountBody"]': '',
			'//*[@id="headline"]': 'Zugang beantragen',
			'//form[@name="newAccount"][contains(@class,"inputError")]': '',
			'//*[@id="newAccountError"]': 'Mail-Adresse falsch.',
			'//input[@type="text"][@name="Name"][@value="Testuser 1"]': '',
			'//div[contains(@class,"inputError")]//input[@type="text"][@name="eMail"][@value="failed_uwegerdes.de"]': '',
			'//input[@type="text"][@name="Username"][@value="testuser1"]': '',
			'//input[@type="password"][@name="Password"]': '',
			'//input[@type="password"][@name="Password2"]': '',
			'//*[@type="submit"][@name="submit"]': 'Anmelden'
		}
	}
);

testCases.push(
	{
		name: 'SignUpFailUsernameExists',
		uri: baseUrl + scriptName +'?newAccount',
		title1: 'Login Zugang beantragen',
		input: [
			'form[name="newAccount"]',
			{
				Name: 'Uwe',
				eMail: 'testbox@frontend.local',
				Username: 'uwe',
				Password: 'testpassword',
				Password2: 'testpassword'
			}
		],
		submit: '//*[@type="submit"]',
		alerts: [],
		title2: 'Login Zugang beantragen',
		elements: {
			'//body[@class="newAccountBody"]': '',
			'//*[@id="headline"]': 'Zugang beantragen',
			'//form[@name="newAccount"][contains(@class,"inputError")]': '',
			'//*[@id="newAccountError"]': 'Anwendername \'uwe\' bereits vorhanden.',
			'//input[@type="text"][@name="Name"][@value="Uwe"]': '',
			'//input[@type="text"][@name="eMail"][@value="testbox@frontend.local"]': '',
			'//div[contains(@class,"inputError")]//input[@type="text"][@name="Username"][@value="uwe"]': '',
			'//input[@type="password"][@name="Password"]': '',
			'//input[@type="password"][@name="Password2"]': '',
			'//*[@type="submit"][@name="submit"]': 'Anmelden'
		},
		elementsNotExist: [
			'//div[contains(@class,"inputError")]//input[@type="text"][@name="Name"][@value="Uwe"]'
		]
	}
);

testCases.push(
	{
		name: 'SignUpFailPassMismatch',
		uri: baseUrl + scriptName +'?newAccount',
		title1: 'Login Zugang beantragen',
		input: [
			'form[name="newAccount"]',
			{
				Name: 'Testuser 1',
				eMail: 'testbox@frontend.local',
				Username: 'testuser1',
				Password: 'testpassword1',
				Password2: 'testpasswordFail'
			}
		],
		submit: '//*[@type="submit"]',
		alerts: [],
		title2: 'Login Zugang beantragen',
		elements: {
			'//body[@class="newAccountBody"]': '',
			'//*[@id="headline"]': 'Zugang beantragen',
			'//form[@name="newAccount"][contains(@class,"inputError")]': '',
			'//*[@id="newAccountError"]': 'Passwort fehlt oder die Passworte stimmen nicht überein.',
			'//input[@type="text"][@name="Name"][@value="Testuser 1"]': '',
			'//input[@type="text"][@name="eMail"][@value="testbox@frontend.local"]': '',
			'//input[@type="text"][@name="Username"][@value="testuser1"]': '',
			'//div[contains(@class,"inputError")]//input[@type="password"][@name="Password"]': '',
			'//div[contains(@class,"inputError")]//input[@type="password"][@name="Password2"]': '',
			'//*[@type="submit"][@name="submit"]': 'Anmelden'
		}
	}
);

testCases.push(
	{
		name: 'SignUp',
		uri: baseUrl + scriptName +'?newAccount',
		title1: 'Login Zugang beantragen',
		input: [
			'form[name="newAccount"]',
			{
				Name: 'Testuser 1',
				eMail: 'testbox@frontend.local',
				Username: 'testuser',
				Password: 'testpassword',
				Password2: 'testpassword'
			}
		],
		submit: '//*[@type="submit"]',
		alerts: [],
		title2: 'Login Zugang beantragt',
		elements: {
			'//body[@class="newAccountBodyOk"]': '',
			'//*[@id="headline"]': 'Vielen Dank für die Anmeldung',
			'//*[@id="NameContainer"]//*[@class="form-control-static"]': 'Testuser 1',
			'//*[@id="eMailContainer"]//*[@class="form-control-static"]': 'testbox@frontend.local',
			'//*[@id="UsernameContainer"]//*[@class="form-control-static"]': 'testuser',
			'//*[@id="PasswordContainer"]//*[@class="form-control-static"]': '*****'
		},
		elementsNotExist: [
			'//*[contains(@class,"inputError")]'
		]
	}
);

testCases.push(
	{
		name: 'LoginNotActivated',
		uri: baseUrl + scriptName,
		title1: 'Bitte anmelden',
		input: [
			'form[name="login"]',
			{
				Username: 'testuser',
				Password: 'testpassword'
			}
		],
		submit: '//*[@type="submit"]',
		alerts: [],
		title2: 'Bitte anmelden',
		elements: {
			'//body[@class="loginBody"]': '',
			'//*[@id="headline"]': 'Anmelden',
			'//*[@id="notConfirmedError"]': 'Zugang noch nicht aktiviert, bitte E-Mail-Eingang prüfen.',
			'//input[@type="text"][@name="Username"][@value="testuser"]': '',
			'//input[@type="password"][@name="Password"]': '',
			'//input[@type="checkbox"][@name="rememberMe"][@value="ja"]': '',
			'//*[@type="submit"][@name="submit"]': 'Anmelden',
			'//a[@href="/login/index.php?newAccount"]': 'Login beantragen'
		},
		elementsNotExist: [
			'//*[contains(@class,"inputError")]'
		]
	}
);

testCases.push(
	{
		name: 'ConfirmFail',
		uri: baseUrl + scriptName +'?newAccountConfirm&confirm=1234567890123456789012345678901',
		title1: 'Login Zugang nicht bestätigt',
		elements: {
			'//body[@class="newAccountConfirmBody"]': '',
			'//*[@id="headline"]': 'Keine gültige Bestätigung',
			'//*[@id="newAccountFail"]': '',
			'//*[@id="newAccountConfirmError"]': 'Freischaltung nicht möglich!',
			'//a[@href="/login/index.php"]': 'zur Anmeldeseite'
		}
	}
);

testCases.push(
	{
		name: 'Confirm',
		uri: baseUrl + scriptName +'?newAccountConfirm&confirm=e3c5ebf6b5f2c5f0e476e21499d10465',
		title1: 'Login Zugang bestätigt',
		elements: {
			'//body[@class="newAccountConfirmBody"]': '',
			'//*[@id="headline"]': 'Bestätigung der Freischaltung',
			'//*[@id="newAccountConfirm"]': '',
			'//*[@id="NameContainer"]//*[@class="form-control-static"]': 'Testuser 1',
			'//*[@id="eMailContainer"]//*[@class="form-control-static"]': 'testbox@frontend.local',
			'//*[@id="UsernameContainer"]//*[@class="form-control-static"]': 'testuser',
			'//*[@id="PasswordContainer"]//*[@class="form-control-static"]': '*****',
			'//a[@href="/login/index.php"]': 'zur Anmeldeseite'
		},
		elementsNotExist: [
			'//*[contains(@class,"inputError")]'
		]
	}
);

testCases.push(
	{
		name: 'Login',
		uri: baseUrl + scriptName,
		title1: 'Bitte anmelden',
		input: [
			'form[name="login"]',
			{
				Username: 'testuser',
				Password: 'testpassword'
			}
		],
		submit: '//*[@type="submit"]',
		alerts: [],
		title2: 'Startseite',
		elements: {
			'//body[@class="indexBody"]': '',
			'//*[@id="headline"]': 'Vielen Dank für die Anmeldung!',
			'//*[@id="editAccountLink"][@href="/login/index.php?editAccount"]': 'Daten bearbeiten',
			'//*[@id="deleteAccountLink"][@href="/login/index.php?deleteAccount"]': 'Meine Zugangsdaten löschen',
			'//*[@id="lastLogin"]': '',
			'//*[@id="logoutLink"][@href="/login/index.php?logout=true"]': 'abmelden'
		},
		elementsNotExist: [
			'//*[contains(@class,"inputError")]'
		]
	}
);

testCases.push(
	{
		name: 'EditUserPage',
		uri: baseUrl + scriptName +'?editAccount',
		title1: 'Login Zugangsdaten bearbeiten',
		submit: '//*[@type="submit"]',
		alerts: [],
		title2: 'Login Zugangsdaten bearbeiten',
		elements: {
			'//body[@class="editAccountBody"]': '',
			'//*[@id="headline"]': 'Benutzerdaten bearbeiten',
			'//form[@name="editAccount"]': '',
			'//input[@type="text"][@name="Name"][@value="Testuser 1"]': '',
			'//input[@type="text"][@name="eMail"][@value="testbox@frontend.local"]': '',
			'//input[@type="text"][@name="Username"][@value="testuser"]': '',
			'//input[@type="password"][@name="Password"]': '',
			'//input[@type="password"][@name="Password2"]': '',
			'//*[@type="submit"][@name="submit"]': 'Speichern',
			'//a[@href="/login/index.php"]': 'zurück zum Start'
		},
		elementsNotExist: [
			'//*[contains(@class,"inputError")]'
		]
	}
);

testCases.push(
	{
		name: 'EditUserFailInputEmpty',
		uri: baseUrl + scriptName +'?editAccount',
		title1: 'Login Zugangsdaten bearbeiten',
		input: [
			'form[name="editAccount"]',
			{
				Name: '',
				eMail: '',
				Username: '',
				Password: '',
				Password2: ''
			}
		],
		submit: '//*[@type="submit"]',
		alerts: [],
		title2: 'Login Zugangsdaten bearbeiten',
		elements: {
			'//body[@class="editAccountBody"]': '',
			'//*[@id="headline"]': 'Benutzerdaten bearbeiten',
			'//form[@name="editAccount"][contains(@class,"inputError")]': '',
			'//*[@id="editAccountError"]': 'Anwendername fehlt.Mail-Adresse fehlt.Anmeldename fehlt.',
			'//div[contains(@class,"inputError")]//input[@type="text"][@name="Name"][@value="Testuser 1"]': '',
			'//div[contains(@class,"inputError")]//input[@type="text"][@name="eMail"][@value="testbox@frontend.local"]': '',
			'//div[contains(@class,"inputError")]//input[@type="text"][@name="Username"][@value="testuser"]': '',
			'//input[@type="password"][@name="Password"]': '',
			'//input[@type="password"][@name="Password2"]': '',
			'//*[@type="submit"][@name="submit"]': 'Speichern',
			'//a[@href="/login/index.php"]': 'zurück zum Start'
		}
	}
);

testCases.push(
	{
		name: 'EditUserFailMailError',
		uri: baseUrl + scriptName +'?editAccount',
		title1: 'Login Zugangsdaten bearbeiten',
		input: [
			'form[name="editAccount"]',
			{
				eMail: 'testbox_frontend.local'
			}
		],
		submit: '//*[@type="submit"]',
		alerts: [],
		title2: 'Login Zugangsdaten bearbeiten',
		elements: {
			'//body[@class="editAccountBody"]': '',
			'//*[@id="headline"]': 'Benutzerdaten bearbeiten',
			'//form[@name="editAccount"][contains(@class,"inputError")]': '',
			'//*[@id="editAccountError"]': 'Mail-Adresse falsch.',
			'//input[@type="text"][@name="Name"][@value="Testuser 1"]': '',
			'//div[contains(@class,"inputError")]//input[@type="text"][@name="eMail"][@value="testbox@frontend.local"]': '',
			'//input[@type="text"][@name="Username"][@value="testuser"]': '',
			'//input[@type="password"][@name="Password"]': '',
			'//input[@type="password"][@name="Password2"]': '',
			'//*[@type="submit"][@name="submit"]': 'Speichern',
			'//a[@href="/login/index.php"]': 'zurück zum Start'
		}
	}
);

testCases.push(
	{
		name: 'EditUserFailUsernameExists',
		uri: baseUrl + scriptName +'?editAccount',
		title1: 'Login Zugangsdaten bearbeiten',
		input: [
			'form[name="editAccount"]',
			{
				Username: 'uwe'
			}
		],
		submit: '//*[@type="submit"]',
		alerts: [],
		title2: 'Login Zugangsdaten bearbeiten',
		elements: {
			'//body[@class="editAccountBody"]': '',
			'//*[@id="headline"]': 'Benutzerdaten bearbeiten',
			'//form[@name="editAccount"][contains(@class,"inputError")]': '',
			'//*[@id="editAccountError"]': 'Anwendername \'uwe\' bereits vorhanden.',
			'//input[@type="text"][@name="Name"][@value="Testuser 1"]': '',
			'//input[@type="text"][@name="eMail"][@value="testbox@frontend.local"]': '',
			'//div[contains(@class,"inputError")]//input[@type="text"][@name="Username"][@value="testuser"]': '',
			'//input[@type="password"][@name="Password"]': '',
			'//input[@type="password"][@name="Password2"]': '',
			'//*[@type="submit"][@name="submit"]': 'Speichern',
			'//a[@href="/login/index.php"]': 'zurück zum Start'
		}
	}
);

testCases.push(
	{
		name: 'EditUserFailPasswordMismatch',
		uri: baseUrl + scriptName +'?editAccount',
		title1: 'Login Zugangsdaten bearbeiten',
		input: [
			'form[name="editAccount"]',
			{
				Password: 'testpassword',
				Password2: 'testpassword2'
			}
		],
		submit: '//*[@type="submit"]',
		alerts: [],
		title2: 'Login Zugangsdaten bearbeiten',
		elements: {
			'//body[@class="editAccountBody"]': '',
			'//*[@id="headline"]': 'Benutzerdaten bearbeiten',
			'//form[@name="editAccount"][contains(@class,"inputError")]': '',
			'//*[@id="editAccountError"]': 'Passworte stimmen nicht überein.',
			'//input[@type="text"][@name="Name"][@value="Testuser 1"]': '',
			'//input[@type="text"][@name="eMail"][@value="testbox@frontend.local"]': '',
			'//input[@type="text"][@name="Username"][@value="testuser"]': '',
			'//div[contains(@class,"inputError")]//input[@type="password"][@name="Password"]': '',
			'//div[contains(@class,"inputError")]//input[@type="password"][@name="Password2"]': '',
			'//*[@type="submit"][@name="submit"]': 'Speichern',
			'//a[@href="/login/index.php"]': 'zurück zum Start'
		}
	}
);

testCases.push(
	{
		name: 'EditUserFailPasswordShort',
		uri: baseUrl + scriptName +'?editAccount',
		title1: 'Login Zugangsdaten bearbeiten',
		input: [
			'form[name="editAccount"]',
			{
				Password: 'test',
				Password2: 'test'
			}
		],
		submit: '//*[@type="submit"]',
		alerts: [],
		title2: 'Login Zugangsdaten bearbeiten',
		elements: {
			'//body[@class="editAccountBody"]': '',
			'//*[@id="headline"]': 'Benutzerdaten bearbeiten',
			'//form[@name="editAccount"][contains(@class,"inputError")]': '',
			'//*[@id="editAccountError"]': 'Passwort zu kurz.',
			'//input[@type="text"][@name="Name"][@value="Testuser 1"]': '',
			'//input[@type="text"][@name="eMail"][@value="testbox@frontend.local"]': '',
			'//input[@type="text"][@name="Username"][@value="testuser"]': '',
			'//div[contains(@class,"inputError")]//input[@type="password"][@name="Password"]': '',
			'//div[contains(@class,"inputError")]//input[@type="password"][@name="Password2"]': '',
			'//*[@type="submit"][@name="submit"]': 'Speichern',
			'//a[@href="/login/index.php"]': 'zurück zum Start'
		}
	}
);

testCases.push(
	{
		name: 'EditUserName',
		uri: baseUrl + scriptName +'?editAccount',
		title1: 'Login Zugangsdaten bearbeiten',
		input: [
			'form[name="editAccount"]',
			{
				Name: 'Testuser 2'
			}
		],
		submit: '//*[@type="submit"]',
		alerts: [],
		title2: 'Login Zugangsdaten gespeichert',
		elements: {
			'//body[@class="editAccountBodyOk"]': '',
			'//*[@id="headline"]': 'Daten gespeichert:',
			'//*[@id="NameContainer"]//*[contains(@class,"form-control-static")]': 'Testuser 2',
			'//*[@id="eMailContainer"]//*[contains(@class,"form-control-static")]': 'testbox@frontend.local',
			'//*[@id="UsernameContainer"]//*[contains(@class,"form-control-static")]': 'testuser',
			'//*[@id="PasswordContainer"]//*[contains(@class,"form-control-static")]': 'nicht geändert',
			'//a[@href="/login/index.php"]': 'zurück zum Start'
		},
		elementsNotExist: [
			'//*[contains(@class,"inputError")]'
		]
	}
);

testCases.push(
	{
		name: 'EditUserMail',
		uri: baseUrl + scriptName +'?editAccount',
		title1: 'Login Zugangsdaten bearbeiten',
		input: [
			'form[name="editAccount"]',
			{
				eMail: 'testbox@uwegerdes.de'
			}
		],
		submit: '//*[@type="submit"]',
		alerts: [],
		title2: 'Login Zugangsdaten gespeichert',
		elements: {
			'//body[@class="editAccountBodyOk"]': '',
			'//*[@id="headline"]': 'Daten gespeichert:',
			'//*[@id="NameContainer"]//*[contains(@class,"form-control-static")]': 'Testuser 2',
			'//*[@id="eMailContainer"]//*[contains(@class,"form-control-static")]': 'testbox@uwegerdes.de',
			'//*[@id="UsernameContainer"]//*[contains(@class,"form-control-static")]': 'testuser',
			'//*[@id="PasswordContainer"]//*[contains(@class,"form-control-static")]': 'nicht geändert',
			'//a[@href="/login/index.php"]': 'zurück zum Start'
		},
		elementsNotExist: [
			'//*[contains(@class,"inputError")]'
		]
	},
	// TODO: new feature: eMail changed confirmation
	{
		name: 'EditUserUsername',
		uri: baseUrl + scriptName +'?editAccount',
		title1: 'Login Zugangsdaten bearbeiten',
		input: [
			'form[name="editAccount"]',
			{
				Username: 'testuser2'
			}
		],
		submit: '//*[@type="submit"]',
		alerts: [],
		title2: 'Login Zugangsdaten gespeichert',
		elements: {
			'//body[@class="editAccountBodyOk"]': '',
			'//*[@id="headline"]': 'Daten gespeichert:',
			'//*[@id="NameContainer"]//*[contains(@class,"form-control-static")]': 'Testuser 2',
			'//*[@id="eMailContainer"]//*[contains(@class,"form-control-static")]': 'testbox@uwegerdes.de',
			'//*[@id="UsernameContainer"]//*[contains(@class,"form-control-static")]': 'testuser2',
			'//*[@id="PasswordContainer"]//*[contains(@class,"form-control-static")]': 'nicht geändert',
			'//a[@href="/login/index.php"]': 'zurück zum Start'
		},
		elementsNotExist: [
			'//*[contains(@class,"inputError")]'
		]
	}
);

testCases.push(
	{
		name: 'LoginNewUsername',
		uri: baseUrl + scriptName,
		title1: 'Bitte anmelden',
		input: [
			'form[name="login"]',
			{
				Username: 'testuser2',
				Password: 'testpassword'
			}
		],
		submit: '//*[@type="submit"]',
		alerts: [],
		title2: 'Startseite',
		elements: {
			'//body[@class="indexBody"]': '',
			'//*[@id="headline"]': 'Vielen Dank für die Anmeldung!',
			'//*[@id="editAccountLink"][@href="/login/index.php?editAccount"]': 'Daten bearbeiten',
			'//*[@id="deleteAccountLink"][@href="/login/index.php?deleteAccount"]': 'Meine Zugangsdaten löschen',
			'//*[@id="lastLogin"]': '',
			'//*[@id="logoutLink"][@href="/login/index.php?logout=true"]': 'abmelden'
		},
		elementsNotExist: [
			'//*[contains(@class,"inputError")]'
		]
	}
);

testCases.push(
	{
		name: 'EditUserUsername2',
		uri: baseUrl + scriptName +'?editAccount',
		title1: 'Login Zugangsdaten bearbeiten',
		input: [
			'form[name="editAccount"]',
			{
				Username: 'testuser'
			}
		],
		submit: '//*[@type="submit"]',
		alerts: [],
		title2: 'Login Zugangsdaten gespeichert',
		elements: {
			'//body[@class="editAccountBodyOk"]': '',
			'//*[@id="headline"]': 'Daten gespeichert:',
			'//*[@id="NameContainer"]//*[contains(@class,"form-control-static")]': 'Testuser 2',
			'//*[@id="eMailContainer"]//*[contains(@class,"form-control-static")]': 'testbox@uwegerdes.de',
			'//*[@id="UsernameContainer"]//*[contains(@class,"form-control-static")]': 'testuser',
			'//*[@id="PasswordContainer"]//*[contains(@class,"form-control-static")]': 'nicht geändert',
			'//a[@href="/login/index.php"]': 'zurück zum Start'
		},
		elementsNotExist: [
			'//*[contains(@class,"inputError")]'
		]
	}
);

testCases.push(
	{
		name: 'LoginOldUsername',
		uri: baseUrl + scriptName,
		title1: 'Bitte anmelden',
		input: [
			'form[name="login"]',
			{
				Username: 'testuser',
				Password: 'testpassword'
			}
		],
		submit: '//*[@type="submit"]',
		alerts: [],
		title2: 'Startseite',
		elements: {
			'//body[@class="indexBody"]': '',
			'//*[@id="headline"]': 'Vielen Dank für die Anmeldung!',
			'//*[@id="editAccountLink"][@href="/login/index.php?editAccount"]': 'Daten bearbeiten',
			'//*[@id="deleteAccountLink"][@href="/login/index.php?deleteAccount"]': 'Meine Zugangsdaten löschen',
			'//*[@id="lastLogin"]': '',
			'//*[@id="logoutLink"][@href="/login/index.php?logout=true"]': 'abmelden'
		},
		elementsNotExist: [
			'//*[contains(@class,"inputError")]'
		]
	}
);

testCases.push(
	{
		name: 'EditUserPassword',
		uri: baseUrl + scriptName +'?editAccount',
		title1: 'Login Zugangsdaten bearbeiten',
		input: [
			'form[name="editAccount"]',
			{
				Password: 'testpassword2',
				Password2: 'testpassword2'
			}
		],
		submit: '//*[@type="submit"]',
		alerts: [],
		title2: 'Login Zugangsdaten gespeichert',
		elements: {
			'//body[@class="editAccountBodyOk"]': '',
			'//*[@id="headline"]': 'Daten gespeichert:',
			'//*[@id="NameContainer"]//*[contains(@class,"form-control-static")]': 'Testuser 2',
			'//*[@id="eMailContainer"]//*[contains(@class,"form-control-static")]': 'testbox@uwegerdes.de',
			'//*[@id="UsernameContainer"]//*[contains(@class,"form-control-static")]': 'testuser',
			'//*[@id="PasswordContainer"]//*[contains(@class,"form-control-static")]': '*****',
			'//a[@href="/login/index.php"]': 'zurück zum Start'
		},
		elementsNotExist: [
			'//*[contains(@class,"inputError")]'
		]
	},
	// TODO: new feature: password forgotten
	{
		name: 'LoginNewPassword',
		uri: baseUrl + scriptName,
		title1: 'Bitte anmelden',
		input: [
			'form[name="login"]',
			{
				Username: 'testuser',
				Password: 'testpassword2'
			}
		],
		submit: '//*[@type="submit"]',
		alerts: [],
		title2: 'Startseite',
		elements: {
			'//body[@class="indexBody"]': '',
			'//*[@id="headline"]': 'Vielen Dank für die Anmeldung!',
			'//*[@id="editAccountLink"][@href="/login/index.php?editAccount"]': 'Daten bearbeiten',
			'//*[@id="deleteAccountLink"][@href="/login/index.php?deleteAccount"]': 'Meine Zugangsdaten löschen',
			'//*[@id="lastLogin"]': '',
			'//*[@id="logoutLink"][@href="/login/index.php?logout=true"]': 'abmelden'
		},
		elementsNotExist: [
			'//*[contains(@class,"inputError")]'
		]
	}
);

testCases.push(
	{
		name: 'EditUserPassword2',
		uri: baseUrl + scriptName +'?editAccount',
		title1: 'Login Zugangsdaten bearbeiten',
		input: [
			'form[name="editAccount"]',
			{
				Password: 'testpassword',
				Password2: 'testpassword'
			}
		],
		submit: '//*[@type="submit"]',
		alerts: [],
		title2: 'Login Zugangsdaten gespeichert',
		elements: {
			'//body[@class="editAccountBodyOk"]': '',
			'//*[@id="headline"]': 'Daten gespeichert:',
			'//*[@id="NameContainer"]//*[contains(@class,"form-control-static")]': 'Testuser 2',
			'//*[@id="eMailContainer"]//*[contains(@class,"form-control-static")]': 'testbox@uwegerdes.de',
			'//*[@id="UsernameContainer"]//*[contains(@class,"form-control-static")]': 'testuser',
			'//*[@id="PasswordContainer"]//*[contains(@class,"form-control-static")]': '*****',
			'//a[@href="/login/index.php"]': 'zurück zum Start'
		},
		elementsNotExist: [
			'//*[contains(@class,"inputError")]'
		]
	}
);

testCases.push(
	{
		name: 'LoginOldPassword',
		uri: baseUrl + scriptName,
		title1: 'Bitte anmelden',
		input: [
			'form[name="login"]',
			{
				Username: 'testuser',
				Password: 'testpassword'
			}
		],
		submit: '//*[@type="submit"]',
		alerts: [],
		title2: 'Startseite',
		elements: {
			'//body[@class="indexBody"]': '',
			'//*[@id="headline"]': 'Vielen Dank für die Anmeldung!',
			'//*[@id="editAccountLink"][@href="/login/index.php?editAccount"]': 'Daten bearbeiten',
			'//*[@id="deleteAccountLink"][@href="/login/index.php?deleteAccount"]': 'Meine Zugangsdaten löschen',
			'//*[@id="lastLogin"]': '',
			'//*[@id="logoutLink"][@href="/login/index.php?logout=true"]': 'abmelden'
		},
		elementsNotExist: [
			'//*[contains(@class,"inputError")]'
		]
	}
);

testCases.push(
	{
		name: 'DeleteUserPage',
		uri: baseUrl + scriptName +'?deleteAccount',
		title1: 'Login Zugang löschen',
		elements: {
			'//body[@class="deleteAccountBody"]': '',
			'//*[@id="headline"]': 'Wirklich löschen?',
			'//form[@name="deleteAccount"]': '',
			'//input[@type="password"][@name="Password"]': '',
			'//input[@type="checkbox"][@name="deleteConfirm"]': '',
			'//*[@type="submit"][@name="submit"]': 'Löschen',
			'//a[@href="/login/index.php"]': 'nein - zurück zum Start'
		},
		elementsNotExist: [
			'//*[contains(@class,"inputError")]'
		]
	}
);

testCases.push(
	{
		name: 'DeleteUserFailPassword',
		uri: baseUrl + scriptName +'?deleteAccount',
		title1: 'Login Zugang löschen',
		input: [
			'form[name="deleteAccount"]',
			{
				Password: 'testpasswordFail',
				deleteConfirm: true
			}
		],
		submit: '//*[@type="submit"]',
		alerts: [],
		title2: 'Login Zugang löschen',
		elements: {
			'//body[@class="deleteAccountBody"]': '',
			'//*[@id="headline"]': 'Wirklich löschen?',
			'//form[@name="deleteAccount"][contains(@class,"inputError")]': '',
			'//*[@id="deleteAccountError"]': 'Passwort stimmt nicht.',
			'//div[contains(@class,"inputError")]//input[@type="password"][@name="Password"]': '',
			'//input[@type="checkbox"][@name="deleteConfirm"]': '',
			'//*[@type="submit"][@name="submit"]': 'Löschen',
			'//a[@href="/login/index.php"]': 'nein - zurück zum Start'
		}
	}
);

testCases.push(
	{
		name: 'DeleteUserFailCheckbox',
		uri: baseUrl + scriptName +'?deleteAccount',
		title1: 'Login Zugang löschen',
		input: [
			'form[name="deleteAccount"]',
			{
				Password: 'testpassword'
			}
		],
		submit: '//*[@type="submit"]',
		alerts: [],
		title2: 'Login Zugang löschen',
		elements: {
			'//body[@class="deleteAccountBody"]': '',
			'//*[@id="headline"]': 'Wirklich löschen?',
			'//form[@name="deleteAccount"][contains(@class,"inputError")]': '',
			'//*[@id="deleteAccountError"]': 'Bitte Passwort eingeben und Bestätigung anklicken.',
			'//div[contains(@class,"inputError")]//input[@type="password"][@name="Password"]': '',
			'//div[contains(@class,"inputError")]//input[@type="checkbox"][@name="deleteConfirm"]': '',
			'//*[@type="submit"][@name="submit"]': 'Löschen',
			'//a[@href="/login/index.php"]': 'nein - zurück zum Start'
		}
	}
);

testCases.push(
	{
		name: 'Error404LoginPageUnknown1',
		uri: baseUrl + scriptName +'?unkownPage',
		title1: '404 not found: unkownPage',
		elements: {
			'//h1' : 'Error 404: unkownPage',
			'//*[contains(@class,"loggedIn")]': ''
		},
		elementsNotExist: [
			'//*[@id="headline"]',
			'//*[@id="loginError"]',
			'//*[contains(@class,"inputError")]',
			'//*[contains(@class,"notLoggedIn")]',
			'//form',
			'//input'
		]
	}
);

testCases.push(
	{
		name: 'DeleteUser',
		uri: baseUrl + scriptName +'?deleteAccount',
		title1: 'Login Zugang löschen',
		input: [
			'form[name="deleteAccount"]',
			{
				Password: 'testpassword',
				deleteConfirm: true
			}
		],
		submit: '//*[@type="submit"]',
		alerts: [],
		title2: 'Login Zugang gelöscht',
		elements: {
			'//body[@class="deleteAccountBodyOk"]': '',
			'//*[@id="headline"]': 'Daten gelöscht.',
			'//a[@href="/login/index.php"]': 'zurück zur Anmeldeseite'
		},
		elementsNotExist: [
			'//*[contains(@class,"inputError")]'
		]
	}
);

testCases.push(
	{
		name: 'LoginFailDeleted',
		uri: baseUrl + scriptName,
		title1: 'Bitte anmelden',
		input: [
			'form[name="login"]',
			{
				Username: 'testuser',
				Password: 'testpassword'
			}
		],
		submit: '//*[@type="submit"]',
		alerts: [],
		title2: 'Bitte anmelden',
		elements: {
			'//body[@class="loginBody"]': '',
			'//*[@id="headline"]': 'Anmelden',
			'//form[@name="login"][contains(@class,"inputError")]': '',
			'//*[@id="loginError"]': 'Anmeldung fehlgeschlagen!',
			'//input[@type="text"][@name="Username"][@value="testuser"]': '',
			'//input[@type="password"][@name="Password"]': '',
			'//*[@type="submit"][@name="submit"]': 'Anmelden'
		}
	}
);

testCases.push(
	{
		name: 'Error404LoginPageUnknown2',
		uri: baseUrl + scriptName +'?unkownPage',
		title1: '404 not found: unkownPage',
		elements: {
			'//h1' : 'Error 404: unkownPage',
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
);

testCases.push(
	{
		name: 'Error404ServerScriptUnknown',
		uri: baseUrl + 'unknown.php',
		title1: '404 Not Found',
		elements: {
			'//h1' : '404 Not Found'
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
);

module.exports = {
	name: 'login',
	dumpDir: './results/login/',
	viewportSize: { width: 800, height: 700 },
	testCases: testCases
};
