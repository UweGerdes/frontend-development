# frontend-development [![Build Status](https://travis-ci.org/UweGerdes/frontend-development.svg?branch=master)](https://travis-ci.org/UweGerdes/frontend-development)

Frontend Development and Testing with gulp, nginx, php, mysql, mail, casperjs and docker.

The example is an application where a user can create an account, confirm, login, modify and delete the account.

To run the application you have to install and configure:

- Webserver (Apache, nginx or other)
- PHP
- MySQL
- Node.js
- GulpJS
- and some more

Well - install [Docker](https://www.docker.com/) (please read the installation guide carefully, on Linux don't forget to add yourself to the docker group).

## docker-compose.yml

To install the servers please clone [my github repo](https://github.com/UweGerdes/frontend-development) and use `docker-compose` to fire them up.

Make sure you have at least docker-compose version 1.6.0 to use the version 2 syntax of `docker-compose.yml`. On Linux you have to follow the instructions on [https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/). On Windows or Mac the Docker setup should have done this.

On Raspberry Pi 3 the following worked for me (2018.01.28), using cache dockers on another system in my network:

```bash
$ COMPOSE_VERSION="1.18.0"
$ git clone https://github.com/docker/compose
$ cd compose
$ git checkout ${COMPOSE_VERSION}
$ docker build -t docker/compose:${COMPOSE_VERSION} -f Dockerfile.armhf .
$ sudo curl -L --fail https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/run.sh -o /usr/local/bin/docker-compose
$ sudo chmod +x /usr/local/bin/docker-compose
$ docker build -t uwegerdes/baseimage \
	--build-arg APT_PROXY="http://192.168.1.18:3142" \
	--build-arg TZ="Europe/Berlin" \
	--build-arg TERM="${TERM}" \
	https://github.com/UweGerdes/docker-baseimage-arm32v7.git
$ docker build -t uwegerdes/nodejs \
	--build-arg NPM_PROXY="http://192.168.1.18:3143" \
	--build-arg NPM_LOGLEVEL="warn" \
	https://github.com/UweGerdes/docker-nodejs.git
```

In the root directory of this project you find `docker-compose.yml` to set up and run the server dockers.

If you have an apt-cacher-ng proxy server (I have a [docker](https://github.com/UweGerdes/docker-apt-cacher-ng)) you should open port 3142 in your firewall to allow access from the docker-engine (on another network in your PC!): ```sudo ufw allow to any port 3142```.

Now build and start the servers:

```bash
$ docker-compose up -d
$ docker ps
```

About 5 minutes and about 2 GB later open [http://localhost:3080/](http://localhost:3080/) in your preferred browser

## Create gulp docker image

Now build the gulp docker image - mind the '.' at the end of the command (meaning use current directory containing `Dockerfile` and other files needed for build). The build-args might be ommitted, the proxy settings assume that your computer `$(hostname -i)` has the proxy servers.

```bash
$ docker build -t uwegerdes/frontend-development \
	--build-arg GULP_LIVERELOAD="5381" \
	--build-arg RESPONSIVE_CHECK_HTTP="5382" \
	--build-arg COMPARE_LAYOUTS_HTTP="5383" \
	.
```

Some 8 Minutes and 2 GB later...

## Start the gulp container

Run a container from the image just created and connect to your environment (with the localhost ports of gulp livereload on 5381, responsive-check on 5382, compare-layouts on 5383 and a running nginx docker container, the hostname `dockerhost` is used in test configs).

Removes the container after if your nginx ip address changes.

```bash
$ docker run -it \
	--name frontend-development \
	-v $(pwd):/home/node/app \
	-p 5381:5381 \
	-p 5382:5382 \
	-p 5383:5383 \
	--network="$(docker inspect --format='{{.HostConfig.NetworkMode}}' nginx)" \
	--add-host dockerhost:$(docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}' nginx) \
	uwegerdes/frontend-development bash
```

With the running docker container start `bower install` from another terminal to load more dependencies, they will be installed in your project directory (you might want to look there when using the components).

You will need this step only once, the data is saved in your project and not in the docker container.

```bash
$ docker exec -t frontend-development bower install
```

Stop (CTRL-D) and restart the server with:

```bash
$ docker start -ai frontend-development
```

When gulp (and the test servers) is started inside the container, open `http://localhost:5382` and `http://localhost:5383` in your favorite browser.

You should exit (CTRL-C) and restart the container if you change a `gulpfile.js`.

You can also start `gulp` with a test-forms task from another terminal:

```bash
$ docker exec -t frontend-development gulp test-forms-default
$ docker exec -t frontend-development gulp test-forms-default-slimer
$ docker exec -t frontend-development gulp test-forms-login
$ docker exec -t frontend-development gulp test-forms-login-slimer
```

If you executed `test-forms-login` you might want to have a look in the `mail` container:

```bash
docker exec -it mail gosu testbox alpine
```

To ease your live you might want to define an alias:

```bash
$ alias dockergulp='docker exec -t frontend-development gulp'
```

## Known Problems

The first start of the container might take a while - keep calm, the next start is done within 5 seconds.

The same applies to the first start of tests - just rerun them, if they report an unexpected error.

If your running frontend-development container refuses to stop on CTRL-C (one of its servers refuses to stop) you should:

```bash
$ docker stop frontend-development
$ docker rm frontend-development
```

and run it again.
