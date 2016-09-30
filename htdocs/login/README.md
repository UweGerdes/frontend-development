# Login sample application

## Subject

To demonstrate frontend development with a lot of tools I need an application
which contains some basic HTML, PHP and database. Your project will be different
but might use some of the features implemented here.

## Description

The application is a basic workflow for login on a web server, set a cookie, allow new users to subscribe, confirm the subscription sent by mail, change user data and delete the account.

It uses PHP, MySQL, Bootstrap, and follows the MVC paradigm.

Some files are generated (Less), that is done with Gulp (based on Node.js).

Dependencies are loaded with Bower.

## Workflow

- open /login/index.php
- click on "new account"
- fill in form, submit, see confirmation, wait for mail
- open confirmation link
- login
- edit account
- delete account

## Tests

There are several tests implemented to check the workflow and the states in between, e.g. login to unconfirmed account fails.

The tests are executed in a Casper.js environment, test execution is done with Gulp and Node.js.
