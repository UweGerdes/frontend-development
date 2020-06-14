/**
 * Testdata for expressjs-boilerplate
 *
 * (c) Uwe Gerdes, entwicklung@uwegerdes.de
 */

const domain = 'http://uwe-hamburg.dedyn.io:51289';

module.exports = {
  group: 'Boilerplate E2E Test',
  name: 'Frontend-Development Workflow Test',
  viewports: {
    //'Mobile': { width: 480, height: 768 },
    'Tablet Portrait': { width: 768, height: 1024 },
    //'Desktop': { width: 1200, height: 900 }
  },
  testCases: {
    'Vorbereitung': {
      uri: domain + '/login/index.php?deleteAccount&username=testuser',
      steps: {
        'Reset User': {
          title: 'Login Zugang gelöscht',
          elements: {
            '//body[@class="deleteAccountBodyOk"]': '',
            '//*[@id="headline"]': 'Daten gelöscht.',
            '//a[@href="/login/index.php"]': 'zurück zur Anmeldeseite'
          },
          elementsNotExist: [
            '//*[contains(@class,"has-error")]'
          ]
        }
      }
    },
    'Startseite': {
      uri: domain + '/',
      steps: {
        'Info': {
          title: 'Frontend-Entwicklung und Test',
          elements: {
            '//h1' : 'Frontend-Entwicklung und Test',
            '//a[@href="/login/"]' : 'Login'
          },
          elementsNotExist: [
            '//*[@id="headline"]',
            '//*[@id="loginError"]',
            '//*[contains(@class,"has-error")]',
            '//*[contains(@class,"loggedIn")]',
            '//form',
            '//input'
          ],
          click: '//a[@href="/login/"]'
        }
      }
    },
    'Anmeldeversuche': {
      uri: domain + '/login/',
      steps: {
        'Login-Seite': {
          title: 'Bitte anmelden',
          elements: {
            '//h1' : 'Bitte anmelden',
            '//form[@id="login"]': '',
            '//form//h2' : 'Anmelden',
            '//input[@name="Username"]': '',
            '//input[@name="Password"]': '',
            '//input[@name="rememberMe"]': '',
            '//form[//h2[contains(., "Anmelden")]]//label[//input[@name="rememberMe"]]' : 'Auf diesem Computer angemeldet bleiben',
            '//form[//h2[contains(., "Anmelden")]]//label[//*[contains(., "Auf diesem Computer angemeldet bleiben")]]//input[@name="rememberMe"]' : '',
            '//button[@type="submit"]': '',
            '//a[@href="/login/index.php?newAccount"]' : 'Login beantragen'
          },
          elementsNotExist: [
            '//*[@id="loginError"]',
            '//*[contains(@class,"has-error")]',
            '//*[contains(@class,"loggedIn")]'
          ],
          click: '//button[@type="submit"]'
        },
        'Login-Seite ohne Login': {
          title: 'Bitte anmelden',
          elements: {
            '//h1' : 'Bitte anmelden',
            '//form[@id="login"]': '',
            '//form//h2' : 'Anmelden',
            '//input[@name="Username"]': '',
            '//input[@name="Password"]': '',
            '//input[@name="rememberMe"]': '',
            '//button[@type="submit"]': '',
            '//a[@href="/login/index.php?newAccount"]' : 'Login beantragen'
          },
          elementsNotExist: [
            '//*[@id="loginError"]',
            '//*[contains(@class,"has-error")]',
            '//*[contains(@class,"loggedIn")]'
          ],
          input: {
            '//input[@name="Username"]': 'testuser',
            '//input[@name="Password"]': 'testpass'
          },
          click: '//button[@type="submit"]'
        },
        'Login-Seite ohne gültiges Login': {
          title: 'Bitte anmelden',
          elements: {
            '//h1' : 'Bitte anmelden',
            '//form[@id="login"]': '',
            '//form//h2' : 'Anmelden',
            '//*[@id="loginError"]': 'Anmeldung fehlgeschlagen!',
            '//*[contains(@class,"has-error")]': 'Anmeldung fehlgeschlagen!',
            '//*[contains(@class,"messages")]': 'Benutzername / Passwort nicht gültig',
            '//input[@name="Username"]': '',
            '//input[@name="Password"]': '',
            '//input[@name="rememberMe"]': '',
            '//button[@type="submit"]': '',
            '//a[@href="/login/index.php?newAccount"]' : 'Login beantragen'
          },
          elementsNotExist: [
            '//*[contains(@class,"loggedIn")]'
          ],
          input: {
            '//input[@name="Username"]': 'testuser',
            '//input[@name="Password"]': 'test'
          },
          click: '//button[@type="submit"]'
        },
        'Login-Seite Passwort zu kurz': {
          title: 'Bitte anmelden',
          elements: {
            '//h1' : 'Bitte anmelden',
            '//form[@id="login"]': '',
            '//form//h2' : 'Anmelden',
            '//*[@id="loginError"]': 'Anmeldung fehlgeschlagen!',
            '//*[contains(@class,"has-error")]': 'Anmeldung fehlgeschlagen!',
            '//*[contains(@class,"messages")]': 'Benutzername / Passwort nicht gültig',
            '//input[@name="Username"]': '',
            '//input[@name="Password"]': '',
            '//input[@name="rememberMe"]': '',
            '//button[@type="submit"]': '',
            '//a[@href="/login/index.php?newAccount"]' : 'Login beantragen'
          },
          elementsNotExist: [
            '//*[contains(@class,"loggedIn")]'
          ],
          click: '//a[@href="/login/index.php?newAccount"]'
        },
      }
    },
    'Registrierung': {
      uri: domain + '/login/index.php?newAccount',
      steps: {
        'Anmelde-Formular': {
          title: 'Login Zugang beantragen',
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
            '//*[contains(@class,"has-error")]'
          ],
          click: '//*[@type="submit"]'
        },
        'Anmelde-Formular: keine Eingaben': {
          title: 'Login Zugang beantragen',
          elements: {
            '//body[@class="newAccountBody"]': '',
            '//*[@id="headline"]': 'Zugang beantragen',
            '//form[@name="newAccount"]': '',
            '//*[@id="newAccountError"]': 'Anwendername fehlt.\nMail-Adresse fehlt.\nAnmeldename fehlt.\nPasswort fehlt oder die Passworte stimmen nicht überein.',
            '//*[contains(@class,"has-error")][1]': 'Name',
            '//*[contains(@class,"has-error")][2]': 'E-Mail',
            '//*[contains(@class,"has-error")][3]': 'Anmeldename',
            '//*[contains(@class,"has-error")][4]': 'Passwort',
            '//*[contains(@class,"has-error")][5]': 'Wiederholung',
            '//input[@type="text"][@name="Name"][@value=""]': '',
            '//input[@type="text"][@name="eMail"][@value=""]': '',
            '//input[@type="text"][@name="Username"][@value=""]': '',
            '//input[@type="password"][@name="Password"]': '',
            '//input[@type="password"][@name="Password2"]': '',
            '//*[@type="submit"][@name="submit"]': 'Anmelden'
          },
          elementsNotExist: [
          ],
          input: {
            '//input[@name="Name"]': 'Testuser 1',
            '//input[@name="eMail"]': 'failed_uwegerdes.de',
            '//input[@name="Username"]': 'testuser1',
            '//input[@name="Password"]': 'testpassword1',
            '//input[@name="Password2"]': 'testpassword1'
          },
          click: '//*[@type="submit"]'
        },
        'Anmelde-Formular: eMail-Fehler': {
          title: 'Login Zugang beantragen',
          elements: {
            '//body[@class="newAccountBody"]': '',
            '//*[@id="headline"]': 'Zugang beantragen',
            '//form[@name="newAccount"]': '',
            '//*[@id="newAccountError"]': 'Mail-Adresse falsch.',
            '//*[contains(@class,"has-error")][1]': 'E-Mail',
            '//input[@type="text"][@name="Name"][@value="Testuser 1"]': '',
            '//input[@type="text"][@name="eMail"][@value="failed_uwegerdes.de"]': '',
            '//input[@type="text"][@name="Username"][@value="testuser1"]': '',
            '//input[@type="password"][@name="Password"]': '',
            '//input[@type="password"][@name="Password2"]': '',
            '//*[@type="submit"][@name="submit"]': 'Anmelden'
          },
          elementsNotExist: [
            '//*[contains(@class,"has-error")][2]'
          ],
          input: {
            '//input[@name="Name"]': 'Testuser 1',
            '//input[@name="eMail"]': 'testbox@mail.local',
            '//input[@name="Username"]': 'uwe',
            '//input[@name="Password"]': 'testpassword1',
            '//input[@name="Password2"]': 'testpassword1'
          },
          click: '//*[@type="submit"]'
        },
        'Anmelde-Formular: Username existiert': {
          title: 'Login Zugang beantragen',
          elements: {
            '//body[@class="newAccountBody"]': '',
            '//*[@id="headline"]': 'Zugang beantragen',
            '//form[@name="newAccount"]': '',
            '//*[@id="newAccountError"]': 'Anwendername \'uwe\' bereits vorhanden.',
            '//*[contains(@class,"has-error")][1]': 'Anmeldename',
            '//input[@type="text"][@name="Name"][@value="Testuser 1"]': '',
            '//input[@type="text"][@name="eMail"][@value="testbox@mail.local"]': '',
            '//input[@type="text"][@name="Username"][@value="uwe"]': '',
            '//input[@type="password"][@name="Password"]': '',
            '//input[@type="password"][@name="Password2"]': '',
            '//*[@type="submit"][@name="submit"]': 'Anmelden'
          },
          elementsNotExist: [
            '//*[contains(@class,"has-error")][2]'
          ],
          input: {
            '//input[@name="Name"]': 'Testuser 1',
            '//input[@name="eMail"]': 'testbox@mail.local',
            '//input[@name="Username"]': 'testuser',
            '//input[@name="Password"]': 'testpassword1',
            '//input[@name="Password2"]': 'testpassword2'
          },
          click: '//*[@type="submit"]'
        },
        'Anmelde-Formular: Passworte nicht gleich': {
          title: 'Login Zugang beantragen',
          elements: {
            '//body[@class="newAccountBody"]': '',
            '//*[@id="headline"]': 'Zugang beantragen',
            '//form[@name="newAccount"]': '',
            '//*[@id="newAccountError"]': 'Passwort fehlt oder die Passworte stimmen nicht überein.',
            '//*[contains(@class,"has-error")][1]': 'Passwort',
            '//*[contains(@class,"has-error")][2]': 'Wiederholung',
            '//input[@type="text"][@name="Name"][@value="Testuser 1"]': '',
            '//input[@type="text"][@name="eMail"][@value="testbox@mail.local"]': '',
            '//input[@type="text"][@name="Username"][@value="testuser"]': '',
            '//input[@type="password"][@name="Password"]': '',
            '//input[@type="password"][@name="Password2"]': '',
            '//*[@type="submit"][@name="submit"]': 'Anmelden'
          },
          elementsNotExist: [
            '//*[contains(@class,"has-error")][3]'
          ],
          input: {
            '//input[@name="Name"]': 'Testuser 1',
            '//input[@name="eMail"]': 'testbox@mail.local',
            '//input[@name="Username"]': 'testuser',
            '//input[@name="Password"]': 'testpass',
            '//input[@name="Password2"]': 'testpass'
          },
          click: '//*[@type="submit"]'
        },
        'Anmelde-Formular: Login Zugang beantragt': {
          title: 'Login Zugang beantragt',
          elements: {
            '//body[@class="newAccountBodyOk"]': '',
            '//*[@id="headline"]': 'Vielen Dank für die Anmeldung',
            '//*[@id="NameContainer"]//*[@class="form-control-static"]': 'Testuser 1',
            '//*[@id="eMailContainer"]//*[@class="form-control-static"]': 'testbox@mail.local',
            '//*[@id="UsernameContainer"]//*[@class="form-control-static"]': 'testuser',
            '//*[@id="PasswordContainer"]//*[@class="form-control-static"]': '*****'
          },
          elementsNotExist: [
            '//*[contains(@class,"has-error")]'
          ]
        },
      }
    },
    'Aktivierung fehlt': {
      uri: domain + '/login/',
      steps: {
        'Login-Seite': {
          title: 'Bitte anmelden',
          elements: {
            '//h1' : 'Bitte anmelden',
            '//form[@id="login"]': '',
            '//form//h2' : 'Anmelden',
            '//input[@name="Username"]': '',
            '//input[@name="Password"]': '',
            '//input[@name="rememberMe"]': '',
            '//button[@type="submit"]': '',
            '//a[@href="/login/index.php?newAccount"]' : 'Login beantragen'
          },
          elementsNotExist: [
            '//*[@id="loginError"]',
            '//*[contains(@class,"has-error")]',
            '//*[contains(@class,"loggedIn")]'
          ],
          input: {
            '//input[@name="Username"]': 'testuser',
            '//input[@name="Password"]': 'testpass'
          },
          click: '//button[@type="submit"]'
        },
        'Login-Seite ohne aktiviertes Login': {
          title: 'Bitte anmelden',
          elements: {
            '//body[@class="loginBody"]': '',
            '//*[@id="headline"]': 'Anmelden',
            '//*[@id="loginError"][contains(@class,"has-error")]': 'Anmeldung fehlgeschlagen!',
            '//*[@id="notConfirmedError"]': 'Zugang noch nicht aktiviert, bitte E-Mail-Eingang prüfen.',
            '//input[@type="text"][@name="Username"][@value="testuser"]': '',
            '//input[@type="password"][@name="Password"]': '',
            '//input[@type="checkbox"][@name="rememberMe"][@value="ja"]': '',
            '//*[@type="submit"][@name="submit"]': 'Anmelden',
            '//a[@href="/login/index.php?newAccount"]': 'Login beantragen'
          },
          elementsNotExist: [
            '//*[contains(@class,"loggedIn")]'
          ],
          input: {
            '//input[@name="Username"]': 'testuser',
            '//input[@name="Password"]': 'test'
          },
          click: '//button[@type="submit"]'
        }
      }
    },
    'Aktivierung falsch': {
      uri: domain + '/login/?newAccountConfirm&confirm=1234567890123456789012345678901',
      steps: {
        'Link ungültig': {
          title: 'Login Zugang nicht bestätigt',
          elements: {
            '//body[@class="newAccountConfirmBody"]': '',
            '//*[@id="headline"]': 'Keine gültige Bestätigung',
            '//*[@id="newAccountFail"]': '',
            '//*[@id="newAccountConfirmError"]': 'Freischaltung nicht möglich!',
            '//a[@href="/login/index.php"]': 'zur Anmeldeseite'
          }
        }
      }
    },
    'Aktivierung': {
      uri: domain + '/login/index.php?lastUnseenMail',
      steps: {
        'Aktiverungsmail öffnen': {
          title: 'Letzte ungelesene Mail',
          elements: {
            '//*[@class="link"]': ''
          },
          click: '//*[@class="link"]'
        },
        'Aktivierungslink geklickt': {
          title: 'Login Zugang bestätigt',
          elements: {
            '//body[@class="newAccountConfirmBody"]': '',
            '//*[@id="headline"]': 'Bestätigung der Freischaltung',
            '//*[@id="newAccountConfirm"]': '',
            '//*[@id="NameContainer"]//*[@class="form-control-static"]': 'Testuser 1',
            '//*[@id="eMailContainer"]//*[@class="form-control-static"]': 'testbox@mail.local',
            '//*[@id="UsernameContainer"]//*[@class="form-control-static"]': 'testuser',
            '//*[@id="PasswordContainer"]//*[@class="form-control-static"]': '*****',
            '//a[@href="/login/index.php"]': 'zur Anmeldeseite'
          },
          elementsNotExist: [
            '//*[contains(@class,"has-error")]'
          ]
        }
      }
    },
    'Anmeldung': {
      uri: domain + '/login/',
      steps: {
        'Login-Seite vor Login': {
          title: 'Bitte anmelden',
          elements: {
            '//h1' : 'Bitte anmelden',
            '//form[@id="login"]': '',
            '//form//h2' : 'Anmelden',
            '//input[@name="Username"]': '',
            '//input[@name="Password"]': '',
            '//input[@name="rememberMe"]': '',
            '//button[@type="submit"]': '',
            '//a[@href="/login/index.php?newAccount"]' : 'Login beantragen'
          },
          elementsNotExist: [
            '//*[@id="loginError"]',
            '//*[contains(@class,"has-error")]',
            '//*[contains(@class,"loggedIn")]'
          ],
          input: {
            '//input[@name="Username"]': 'testuser',
            '//input[@name="Password"]': 'testpass'
          },
          click: '//button[@type="submit"]'
        },
        'Anmeldung ok': {
          title: 'Startseite',
          elements: {
            '//body[@class="indexBody"]': '',
            '//*[@id="headline"]': 'Vielen Dank für die Anmeldung!',
            '//*[@id="editAccountLink"][@href="/login/index.php?editAccount"]': 'Daten bearbeiten',
            '//*[@id="deleteAccountLink"][@href="/login/index.php?deleteAccount"]': 'Meine Zugangsdaten löschen',
            '//*[@id="lastLogin"]': '',
            '//*[@id="logoutLink"][@href="/login/index.php?logout=true"]': 'abmelden'
          },
          elementsNotExist: [
            '//*[contains(@class,"has-error")]'
          ],
          click: '//a[@href="/login/index.php?editAccount"]'
        }
      }
    },
    'Benutzer ändern': {
      uri: domain + '/login/?editAccount',
      steps: {
        'Zugangsdaten bearbeiten': {
          title: 'Login Zugangsdaten bearbeiten',
          elements: {
            '//body[@class="editAccountBody"]': '',
            '//*[@id="headline"]': 'Benutzerdaten bearbeiten',
            '//form[@name="editAccount"]': '',
            '//input[@type="text"][@name="Name"][@value="Testuser 1"]': '',
            '//input[@type="text"][@name="eMail"][@value="testbox@mail.local"]': '',
            '//input[@type="text"][@name="Username"][@value="testuser"]': '',
            '//input[@type="password"][@name="Password"]': '',
            '//input[@type="password"][@name="Password2"]': '',
            '//*[@type="submit"][@name="submit"]': 'Speichern',
            '//a[@href="/login/index.php"]': 'zurück zum Start'
          },
          elementsNotExist: [
            '//*[contains(@class,"has-error")]'
          ],
          input: {
            '//input[@name="Name"]': '',
            '//input[@name="eMail"]': '',
            '//input[@name="Username"]': '',
            '//input[@name="Password"]': '',
            '//input[@name="Password2"]': ''
          },
          click: '//*[@type="submit"]',
        },
        'Leere Eingabefelder': {
          title: 'Login Zugangsdaten bearbeiten',
          elements: {
            '//body[@class="editAccountBody"]': '',
            '//*[@id="headline"]': 'Benutzerdaten bearbeiten',
            '//form[@name="editAccount"]': '',
            '//*[@id="editAccountError"]': 'Anwendername fehlt.\nMail-Adresse fehlt.\nAnmeldename fehlt.',
            '//div[contains(@class,"has-error")]//input[@type="text"][@name="Name"][@value="Testuser 1"][contains(@class,"has-error")]': '',
            '//div[contains(@class,"has-error")]//input[@type="text"][@name="eMail"][@value="testbox@mail.local"][contains(@class,"has-error")]': '',
            '//div[contains(@class,"has-error")]//input[@type="text"][@name="Username"][@value="testuser"][contains(@class,"has-error")]': '',
            '//input[@type="password"][@name="Password"]': '',
            '//input[@type="password"][@name="Password2"]': '',
            '//*[@type="submit"][@name="submit"]': 'Speichern',
            '//a[@href="/login/index.php"]': 'zurück zum Start'
          },
          input: {
            '//input[@name="eMail"]': 'testbox_mail.local',
          },
          click: '//*[@type="submit"]',
        },
        'E-Mail Syntaxfehler': {
          title: 'Login Zugangsdaten bearbeiten',
          elements: {
            '//body[@class="editAccountBody"]': '',
            '//*[@id="headline"]': 'Benutzerdaten bearbeiten',
            '//form[@name="editAccount"]': '',
            '//*[@id="editAccountError"]': 'Mail-Adresse falsch.',
            '//input[@type="text"][@name="Name"][@value="Testuser 1"]': '',
            '//div[contains(@class,"has-error")]//input[@type="text"][@name="eMail"][@value="testbox@mail.local"][contains(@class,"has-error")]': '',
            '//input[@type="text"][@name="Username"][@value="testuser"]': '',
            '//input[@type="password"][@name="Password"]': '',
            '//input[@type="password"][@name="Password2"]': '',
            '//*[@type="submit"][@name="submit"]': 'Speichern',
            '//a[@href="/login/index.php"]': 'zurück zum Start'
          },
          input: {
            '//input[@name="Username"]': 'uwe',
          },
          click: '//*[@type="submit"]',
        },
        'Username existiert': {
          title: 'Login Zugangsdaten bearbeiten',
          elements: {
            '//body[@class="editAccountBody"]': '',
            '//*[@id="headline"]': 'Benutzerdaten bearbeiten',
            '//form[@name="editAccount"]': '',
            '//*[@id="editAccountError"]': 'Anwendername \'uwe\' bereits vorhanden.',
            '//input[@type="text"][@name="Name"][@value="Testuser 1"]': '',
            '//input[@type="text"][@name="eMail"][@value="testbox@mail.local"]': '',
            '//div[contains(@class,"has-error")]//input[@type="text"][@name="Username"][@value="testuser"][contains(@class,"has-error")]': '',
            '//input[@type="password"][@name="Password"]': '',
            '//input[@type="password"][@name="Password2"]': '',
            '//*[@type="submit"][@name="submit"]': 'Speichern',
            '//a[@href="/login/index.php"]': 'zurück zum Start'
          },
          input: {
            '//input[@name="Password"]': 'testpassword',
            '//input[@name="Password2"]': 'testpassword2',
          },
          click: '//*[@type="submit"]',
        },
        'Passworte nicht gleich': {
          title: 'Login Zugangsdaten bearbeiten',
          elements: {
            '//body[@class="editAccountBody"]': '',
            '//*[@id="headline"]': 'Benutzerdaten bearbeiten',
            '//form[@name="editAccount"]': '',
            '//*[@id="editAccountError"]': 'Passworte stimmen nicht überein.',
            '//input[@type="text"][@name="Name"][@value="Testuser 1"]': '',
            '//input[@type="text"][@name="eMail"][@value="testbox@mail.local"]': '',
            '//input[@type="text"][@name="Username"][@value="testuser"]': '',
            '//div[contains(@class,"has-error")]//input[@type="password"][@name="Password"][contains(@class,"has-error")]': '',
            '//div[contains(@class,"has-error")]//input[@type="password"][@name="Password2"][contains(@class,"has-error")]': '',
            '//*[@type="submit"][@name="submit"]': 'Speichern',
            '//a[@href="/login/index.php"]': 'zurück zum Start'
          },
          input: {
            '//input[@name="Password"]': 'test',
            '//input[@name="Password2"]': 'test',
          },
          click: '//*[@type="submit"]',
        },
        'Passworte nicht gleich': {
          title: 'Login Zugangsdaten bearbeiten',
          elements: {
            '//body[@class="editAccountBody"]': '',
            '//*[@id="headline"]': 'Benutzerdaten bearbeiten',
            '//form[@name="editAccount"]': '',
            '//*[@id="editAccountError"]': 'Passworte stimmen nicht überein.',
            '//input[@type="text"][@name="Name"][@value="Testuser 1"]': '',
            '//input[@type="text"][@name="eMail"][@value="testbox@mail.local"]': '',
            '//input[@type="text"][@name="Username"][@value="testuser"]': '',
            '//div[contains(@class,"has-error")]//input[@type="password"][@name="Password"][contains(@class,"has-error")]': '',
            '//div[contains(@class,"has-error")]//input[@type="password"][@name="Password2"][contains(@class,"has-error")]': '',
            '//*[@type="submit"][@name="submit"]': 'Speichern',
            '//a[@href="/login/index.php"]': 'zurück zum Start'
          },
          input: {
            '//input[@name="Name"]': 'Testuser 2'
          },
          click: '//*[@type="submit"]',
        },
        'Name geändert': {
          title: 'Login Zugangsdaten gespeichert',
          elements: {
            '//body[@class="editAccountBodyOk"]': '',
            '//*[@id="headline"]': 'Daten gespeichert:',
            '//*[@id="NameContainer"]//*[contains(@class,"form-control-static")]': 'Testuser 2',
            '//*[@id="eMailContainer"]//*[contains(@class,"form-control-static")]': 'testbox@mail.local',
            '//*[@id="UsernameContainer"]//*[contains(@class,"form-control-static")]': 'testuser',
            '//*[@id="PasswordContainer"]//*[contains(@class,"form-control-static")]': 'nicht geändert',
            '//a[@href="/login/index.php"]': 'zurück zum Start'
          },
          click: '//a[@href="/login/index.php"]',
        },
        'Benutzerdaten erneut bearbeiten': {
          title: 'Startseite',
          elements: {
            '//body[@class="indexBody"]': '',
            '//*[@id="headline"]': 'Vielen Dank für die Anmeldung!',
            '//*[@id="editAccountLink"][@href="/login/index.php?editAccount"]': 'Daten bearbeiten',
            '//*[@id="deleteAccountLink"][@href="/login/index.php?deleteAccount"]': 'Meine Zugangsdaten löschen',
            '//*[@id="logoutLink"][@href="/login/index.php?logout=true"]': 'abmelden'
          },
          elementsNotExist: [
            '//*[contains(@class,"has-error")]'
          ],
          click: '//a[@href="/login/index.php?editAccount"]'
        },
        'eMail und Username ändern': {
          title: 'Login Zugangsdaten bearbeiten',
          elements: {
            '//body[@class="editAccountBody"]': '',
            '//*[@id="headline"]': 'Benutzerdaten bearbeiten',
            '//form[@name="editAccount"]': '',
            '//input[@type="text"][@name="Name"][@value="Testuser 2"]': '',
            '//input[@type="text"][@name="eMail"][@value="testbox@mail.local"]': '',
            '//input[@type="text"][@name="Username"][@value="testuser"]': '',
            '//input[@type="password"][@name="Password"]': '',
            '//input[@type="password"][@name="Password2"]': '',
            '//*[@type="submit"][@name="submit"]': 'Speichern',
            '//a[@href="/login/index.php"]': 'zurück zum Start'
          },
          input: {
            '//input[@name="eMail"]': 'testbox@uwegerdes.de',
            '//input[@name="Username"]': 'testuser2'
          },
          click: '//*[@type="submit"]',
        },
        'eMail und Username geändert': {
          title: 'Login Zugangsdaten gespeichert',
          elements: {
            '//body[@class="editAccountBodyOk"]': '',
            '//*[@id="headline"]': 'Daten gespeichert:',
            '//*[@id="NameContainer"]//*[contains(@class,"form-control-static")]': 'Testuser 2',
            '//*[@id="eMailContainer"]//*[contains(@class,"form-control-static")]': 'testbox@uwegerdes.de',
            '//*[@id="UsernameContainer"]//*[contains(@class,"form-control-static")]': 'testuser2',
            '//*[@id="PasswordContainer"]//*[contains(@class,"form-control-static")]': 'nicht geändert',
            '//a[@href="/login/index.php"]': 'zurück zum Start'
          },
          click: '//a[@href="/login/index.php"]',
        },
      }
    },
    'Benutzer zurück ändern': {
      uri: domain + '/login/',
      steps: {
        'Login-Seite vor Login': {
          title: 'Bitte anmelden',
          elements: {
            '//h1' : 'Bitte anmelden',
            '//form[@id="login"]': '',
            '//form//h2' : 'Anmelden',
            '//input[@name="Username"]': '',
            '//input[@name="Password"]': '',
            '//input[@name="rememberMe"]': '',
            '//button[@type="submit"]': '',
            '//a[@href="/login/index.php?newAccount"]' : 'Login beantragen'
          },
          elementsNotExist: [
            '//*[@id="loginError"]',
            '//*[contains(@class,"has-error")]',
            '//*[contains(@class,"loggedIn")]'
          ],
          input: {
            '//input[@name="Username"]': 'testuser2',
            '//input[@name="Password"]': 'testpass'
          },
          click: '//button[@type="submit"]'
        },
        'Anmeldung ok': {
          title: 'Startseite',
          elements: {
            '//body[@class="indexBody"]': '',
            '//*[@id="headline"]': 'Vielen Dank für die Anmeldung!',
            '//*[@id="editAccountLink"][@href="/login/index.php?editAccount"]': 'Daten bearbeiten',
            '//*[@id="deleteAccountLink"][@href="/login/index.php?deleteAccount"]': 'Meine Zugangsdaten löschen',
            '//*[@id="lastLogin"]': '',
            '//*[@id="logoutLink"][@href="/login/index.php?logout=true"]': 'abmelden'
          },
          elementsNotExist: [
            '//*[contains(@class,"has-error")]'
          ],
          click: '//a[@href="/login/index.php?editAccount"]'
        },
        'Zugangsdaten bearbeiten': {
          title: 'Login Zugangsdaten bearbeiten',
          elements: {
            '//body[@class="editAccountBody"]': '',
            '//*[@id="headline"]': 'Benutzerdaten bearbeiten',
            '//form[@name="editAccount"]': '',
            '//input[@type="text"][@name="Name"][@value="Testuser 2"]': '',
            '//input[@type="text"][@name="eMail"][@value="testbox@uwegerdes.de"]': '',
            '//input[@type="text"][@name="Username"][@value="testuser2"]': '',
            '//input[@type="password"][@name="Password"]': '',
            '//input[@type="password"][@name="Password2"]': '',
            '//*[@type="submit"][@name="submit"]': 'Speichern',
            '//a[@href="/login/index.php"]': 'zurück zum Start'
          },
          elementsNotExist: [
            '//*[contains(@class,"has-error")]'
          ],
          input: {
            '//input[@name="Name"]': 'Testuser 1',
            '//input[@name="eMail"]': 'testbox@mail.local',
            '//input[@name="Username"]': 'testuser'
          },
          click: '//*[@type="submit"]',
        },
        'Name, eMail und Username geändert': {
          title: 'Login Zugangsdaten gespeichert',
          elements: {
            '//body[@class="editAccountBodyOk"]': '',
            '//*[@id="headline"]': 'Daten gespeichert:',
            '//*[@id="NameContainer"]//*[contains(@class,"form-control-static")]': 'Testuser 1',
            '//*[@id="eMailContainer"]//*[contains(@class,"form-control-static")]': 'testbox@mail.local',
            '//*[@id="UsernameContainer"]//*[contains(@class,"form-control-static")]': 'testuser',
            '//*[@id="PasswordContainer"]//*[contains(@class,"form-control-static")]': 'nicht geändert',
            '//a[@href="/login/index.php"]': 'zurück zum Start'
          },
          click: '//a[@href="/login/index.php"]',
        },
      }
    },
    'Benutzer löschen': {
      uri: domain + '/login/',
      steps: {
        'Login-Seite vor Login': {
          title: 'Bitte anmelden',
          elements: {
            '//h1' : 'Bitte anmelden',
            '//form[@id="login"]': '',
            '//form//h2' : 'Anmelden',
            '//input[@name="Username"]': '',
            '//input[@name="Password"]': '',
            '//input[@name="rememberMe"]': '',
            '//button[@type="submit"]': '',
            '//a[@href="/login/index.php?newAccount"]' : 'Login beantragen'
          },
          elementsNotExist: [
            '//*[@id="loginError"]',
            '//*[contains(@class,"has-error")]',
            '//*[contains(@class,"loggedIn")]'
          ],
          input: {
            '//input[@name="Username"]': 'testuser',
            '//input[@name="Password"]': 'testpass'
          },
          click: '//button[@type="submit"]'
        },
        'Anmeldung ok': {
          title: 'Startseite',
          elements: {
            '//body[@class="indexBody"]': '',
            '//*[@id="headline"]': 'Vielen Dank für die Anmeldung!',
            '//*[@id="editAccountLink"][@href="/login/index.php?editAccount"]': 'Daten bearbeiten',
            '//*[@id="deleteAccountLink"][@href="/login/index.php?deleteAccount"]': 'Meine Zugangsdaten löschen',
            '//*[@id="lastLogin"]': '',
            '//*[@id="logoutLink"][@href="/login/index.php?logout=true"]': 'abmelden'
          },
          elementsNotExist: [
            '//*[contains(@class,"has-error")]'
          ],
          click: '//a[@href="/login/index.php?deleteAccount"]'
        },
        'Zugangsdaten löschen': {
          title: 'Login Zugang löschen',
          elements: {
            '//body[@class="deleteAccountBody"]': '',
            '//*[@id="headline"]': 'Wirklich löschen?',
            '//form[@name="deleteAccount"]': '',
            '//*[@id="NameContainer"]//*[contains(@class,"form-control-static")]': 'Testuser 1',
            '//*[@id="eMailContainer"]//*[contains(@class,"form-control-static")]': 'testbox@mail.local',
            '//*[@id="UsernameContainer"]//*[contains(@class,"form-control-static")]': 'testuser',
            '//input[@type="password"][@name="Password"]': '',
            '//input[@type="checkbox"][@name="deleteConfirm"]': '',
            '//label[@for="deleteConfirm"][//input[@type="checkbox"][@name="deleteConfirm"]]': 'wirklich löschen?',
            '//*[@type="submit"][@name="submit"]': 'Löschen',
            '//a[@href="/login/index.php"]': 'nein - zurück zum Start'
          },
          elementsNotExist: [
            '//*[contains(@class,"has-error")]'
          ],
          click: '//*[@type="submit"]',
        },
        'Fehler Passwort fehlt': {
          title: 'Login Zugang löschen',
          elements: {
            '//body[@class="deleteAccountBody"]': '',
            '//*[@id="headline"]': 'Wirklich löschen?',
            '//form[@name="deleteAccount"]': '',
            '//*[contains(@class,"has-error")]': 'Bitte Passwort eingeben und Bestätigung anklicken.',
            '//*[@id="NameContainer"]//*[contains(@class,"form-control-static")]': 'Testuser 1',
            '//*[@id="eMailContainer"]//*[contains(@class,"form-control-static")]': 'testbox@mail.local',
            '//*[@id="UsernameContainer"]//*[contains(@class,"form-control-static")]': 'testuser',
            '//div[contains(@class,"has-error")]//input[@type="password"][@name="Password"][contains(@class,"has-error")]': '',
            '//div[contains(@class,"has-error")]//input[@type="checkbox"][@name="deleteConfirm"]': '',
            '//input[@type="password"][@name="Password"]': '',
            '//*[@type="submit"][@name="submit"]': 'Löschen',
            '//a[@href="/login/index.php"]': 'nein - zurück zum Start'
          },
          input: {
            '//input[@name="Password"]': 'testpass'
          },
          click: '//*[@type="submit"]',
        },
        'Fehler Bestätigung fehlt': {
          title: 'Login Zugang löschen',
          elements: {
            '//body[@class="deleteAccountBody"]': '',
            '//*[@id="headline"]': 'Wirklich löschen?',
            '//form[@name="deleteAccount"]': '',
            '//*[contains(@class,"has-error")]': 'Bitte Passwort eingeben und Bestätigung anklicken.',
            '//*[@id="NameContainer"]//*[contains(@class,"form-control-static")]': 'Testuser 1',
            '//*[@id="eMailContainer"]//*[contains(@class,"form-control-static")]': 'testbox@mail.local',
            '//*[@id="UsernameContainer"]//*[contains(@class,"form-control-static")]': 'testuser',
            '//div[contains(@class,"has-error")]//input[@type="password"][@name="Password"][contains(@class,"has-error")]': '',
            '//div[contains(@class,"has-error")]//input[@type="checkbox"][@name="deleteConfirm"]': '',
            '//input[@type="password"][@name="Password"]': '',
            '//*[@type="submit"][@name="submit"]': 'Löschen',
            '//a[@href="/login/index.php"]': 'nein - zurück zum Start'
          },
          input: {
            '//input[@name="Password"]': 'testpass',
            '//input[@name="deleteConfirm"]': true
          },
          click: '//*[@type="submit"]',
        },
        'Login Zugang löschen ok': {
          title: 'Login Zugang gelöscht',
          elements: {
            '//body[@class="deleteAccountBodyOk"]': '',
            '//*[@id="headline"]': 'Daten gelöscht.',
            '//a[@href="/login/index.php"]': 'zurück zur Anmeldeseite'
          },
          elementsNotExist: [
            '//*[contains(@class,"has-error")]'
          ],
          click: '//a[@href="/login/index.php"]',
        },
      }
    },
    'Anmeldund nach Löschen versuchen': {
      uri: domain + '/login/',
      steps: {
        'Login-Seite': {
          title: 'Bitte anmelden',
          elements: {
            '//h1' : 'Bitte anmelden',
            '//form[@id="login"]': '',
            '//form//h2' : 'Anmelden',
            '//input[@name="Username"]': '',
            '//input[@name="Password"]': '',
            '//input[@name="rememberMe"]': '',
            '//form[//h2[contains(., "Anmelden")]]//label[//input[@name="rememberMe"]]' : 'Auf diesem Computer angemeldet bleiben',
            '//form[//h2[contains(., "Anmelden")]]//label[//*[contains(., "Auf diesem Computer angemeldet bleiben")]]//input[@name="rememberMe"]' : '',
            '//button[@type="submit"]': '',
            '//a[@href="/login/index.php?newAccount"]' : 'Login beantragen'
          },
          elementsNotExist: [
            '//*[@id="loginError"]',
            '//*[contains(@class,"has-error")]',
            '//*[contains(@class,"loggedIn")]'
          ],
          click: '//button[@type="submit"]'
        },
        'Login-Seite ohne Login': {
          title: 'Bitte anmelden',
          elements: {
            '//h1' : 'Bitte anmelden',
            '//form[@id="login"]': '',
            '//form//h2' : 'Anmelden',
            '//input[@name="Username"]': '',
            '//input[@name="Password"]': '',
            '//input[@name="rememberMe"]': '',
            '//button[@type="submit"]': '',
            '//a[@href="/login/index.php?newAccount"]' : 'Login beantragen'
          },
          elementsNotExist: [
            '//*[@id="loginError"]',
            '//*[contains(@class,"loggedIn")]'
          ],
          input: {
            '//input[@name="Username"]': 'testuser',
            '//input[@name="Password"]': 'testpass'
          },
          click: '//button[@type="submit"]'
        },
        'Login-Seite ohne gültiges Login': {
          title: 'Bitte anmelden',
          elements: {
            '//h1' : 'Bitte anmelden',
            '//form[@id="login"]': '',
            '//form//h2' : 'Anmelden',
            '//*[@id="loginError"]': 'Anmeldung fehlgeschlagen!',
            '//*[contains(@class,"has-error")]': 'Anmeldung fehlgeschlagen!',
            '//*[contains(@class,"messages")]': 'Sitzung nicht (mehr) gültig\nBenutzername / Passwort nicht gültig',
            '//input[@name="Username"]': '',
            '//input[@name="Password"]': '',
            '//input[@name="rememberMe"]': '',
            '//button[@type="submit"]': '',
            '//a[@href="/login/index.php?newAccount"]' : 'Login beantragen'
          },
          elementsNotExist: [
            '//*[contains(@class,"loggedIn")]'
          ]
        },
      }
    },
  }
};
