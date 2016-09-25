# frontend-development

Frontend Development and Testing with gulp, nginx, php, mysql, casperjs and docker

This example shows an application where a user can create an account, confirm, login, modify and delete the account.

To run the application you have to install and configure:

- Webserver (Apache, nginx or other)
- PHP
- MySQL
- Node.js
- GulpJS
- and some more

There is another way: install [Docker](https://www.docker.com/) and use the preconfigurations included in the project directory and the `docker` subdirectory. A `docker-compose.yml` is included and can be used in every project you have on your system to start and stop the environment and keep them separated.

There is also a `gulpfile.js` for different tasks like compile less and graphviz, check js files, execute tests with CasperJS and more. A `Dockerfile` for that is included. Please read `docker-gulp.md`.
