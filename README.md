# frontend-development

Frontend Development and Testing with gulp, nginx, php, mysql, mail, casperjs and docker.

Please see [my github repo](https://github.com/UweGerdes/frontend-development).

The example shows an application where a user can create an account, confirm, login, modify and delete the account.

To run the application you have to install and configure:

- Webserver (Apache, nginx or other)
- PHP
- MySQL
- Node.js
- GulpJS
- and some more

Well - install [Docker](https://www.docker.com/) (please read the installation guide carefully, on Linux don't forget to add yourself to the docker group).

## docker-compose.yml

Make sure you have at least docker-compose version 1.6.0 to use the version 2 syntax of `docker-compose.yml`. On Linux you have to follow the instructions on [https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/). On Windows or Mac the Docker setup should have done this.

In the root directory of this project you find `docker-compose.yml` to set up and run the server dockers.

If you have an apt-cacher-ng proxy server (see below) you should run:

```bash
$ export APT_PROXY=http://$(hostname -i):3142
```

Perhaps open port 3142 in your firewall to allow access from the docker-engine.

Now build and start the servers:

```bash
$ export TZ=Europe/Berlin
$ docker-compose up -d
$ docker ps
```

Open [http://localhost:3080/](http://localhost:3080/) in your preferred browser

## Create gulp docker image

Now build the gulp docker image - mind the '.' at the end of the command (meaning use current directory containing `Dockerfile` and other files needed for build). The build-args might be ommitted, the proxy settings assume that your computer `$(hostname -i)` has the proxy servers.

```bash
$ docker build -t uwegerdes/gulp-frontend \
	--build-arg NPM_PROXY="--proxy http://$(hostname -i):3143 --https-proxy http://$(hostname -i):3143 --strict-ssl false" \
	--build-arg NPM_LOGLEVEL="--loglevel warn" \
	--build-arg TZ="Europe/Berlin" \
	--build-arg GULP_LIVERELOAD="5381" \
	--build-arg RESPONSIVE_CHECK_HTTP="5382" \
	.
```

Some 8 Minutes and 1.5 GB later...

## Start the gulp container

Run a container from the image just created and connect to your environment (with the ports of gulp livereload on 5381, responsive-check on 5382 and a running nginx docker container, the hostname `dockerhost` is used in test configs).

This command removes the container after end - useful if your nginx ip address changes.

```bash
$ docker run -it --rm \
	--name gulp-frontend \
	-v $(pwd):/usr/src/app \
	-p 5381:5381 \
	-p 5382:5382 \
	--network="$(docker inspect --format='{{.HostConfig.NetworkMode}}' nginx)" \
	--add-host dockerhost:$(docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}' nginx) \
	uwegerdes/gulp-frontend \
	bash
```

Inside the running docker container start `bower install` to load more dependencies, they will be in your project directory (you might want to look inside for using the components).

You will need this step only once, the data is saved in your project and not in the docker container.

```bash
$ bower install
```

Next start `gulp` with an optional task. If no task is given the default task runs `[ 'build', 'watch' ]`, the test tasks are triggered by their config files, you may add more watch files as you like:

```bash
$ gulp build

$ gulp tests

$ gulp watch

$ gulp
```

Stop `gulp watch` with CTRL-C and exit the container with CTRL-D.
