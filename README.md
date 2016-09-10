# Frontend Development and Testing

This example shows an application where a user can create an account, confirm, login, modify and delete the account.

To run the application you have to install and configure:

- Webserver (Apache, nginx or other)
- PHP
- MySQL
- Node.js
- Gulp
- and some more

There is another way: install [Docker](https://www.docker.com/) and use the preconfigurations included in the project directory and the `docker` subdirectory. A `docker-compose.yml` is included and can be used in every project you have on your system to start and stop the environment and keep them separated.

There is also a `gulpfile.js` for different tasks like compile less and graphviz, check js files, execute tests with CasperJS and more. A `Dockerfile` for that is included. Please read `docker-gulp.md`.

When the webserver is started on a local virtual domain `frontend.local` with `htdocs` as base directory and PHP support for the `login` subdirectory you should open `http://frontend.local` to see what the project includes. If the styles in the login application look primitive you should install bootstrap 2.3.2 files in the `src\less\login\bootstrap` subdirectory and start `gulp build` to create the necessary files.

I should use bower for bootstrap and perhaps others.
