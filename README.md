# frontend-development

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
	--build-arg GULP_LIVERELOAD="5381" \
	--build-arg RESPONSIVE_CHECK_HTTP="5382" \
	--build-arg COMPARE_LAYOUTS_HTTP="5383" \
	.
```

Some 8 Minutes and 1.5 GB later...

## Start the gulp container

Run a container from the image just created and connect to your environment (with the localhost ports of gulp livereload on 5381, responsive-check on 5382, compare-layouts on 5383 and a running nginx docker container, the hostname `dockerhost` is used in test configs).

This command removes the container after end - useful if your nginx ip address changes.

```bash
$ docker run -it --rm \
	--name gulp-frontend \
	-v $(pwd):/usr/src/app \
	-p 5381:5381 \
	-p 5382:5382 \
	-p 5383:5383 \
	--network="$(docker inspect --format='{{.HostConfig.NetworkMode}}' nginx)" \
	--add-host dockerhost:$(docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}' nginx) \
	uwegerdes/gulp-frontend
```

With the running docker container start `bower install` from another terminal to load more dependencies, they will be installed in your project directory (you might want to look there when using the components).

You will need this step only once, the data is saved in your project and not in the docker container.

```bash
$ docker exec -t gulp-frontend bower install
```

Open `http://localhost:5382` and `http://localhost:5383` in your favorite browser.

You should exit (CTRL-C) and restart the container if you change a `gulpfile.js`.

You can also start `gulp` with a test-forms task from another terminal:

```bash
$ docker exec -t gulp-frontend gulp test-forms-default
$ docker exec -t gulp-frontend gulp test-forms-default-slimer
$ docker exec -t gulp-frontend gulp test-forms-login
$ docker exec -t gulp-frontend gulp test-forms-login-slimer
```

If you executed `test-forms-login` you might want to have a look in the `mail` container:

```bash
docker exec -it mail gosu testbox alpine
```

To ease your live you might want to define an alias:

```bash
$ alias dockergulp='docker exec -t gulp-frontend gulp'
```
