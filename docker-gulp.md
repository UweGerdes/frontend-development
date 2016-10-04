# Dockerfile for frontend development and testing environment with GulpJS, PhantomJS, CasperJS, SlimerJS

## Installation

My system is Ubuntu 16.04 - perhaps there are some other steps to be taken on Windows systems (TODO).

You may also try this installation in a virtual machine. It worked for me on an Ubuntu 16.04 (I hope all dependencies are included here).

Or build a Docker image using the supplied Dockerfile (and keep your project directory clean from node_modules).

# Installation on your OS (no docker)

Some software is required on a blank Ubuntu system:

```bash
$ sudo apt-get install g++ git imagemagick python
```

Perhaps some other packages might be useful: ```bzip2 curl make openssh-client subversion wget```

Install [Node.js](https://nodejs.org/en/) (my version is 4.4.7, don't use the version from Ubuntu repositories if it is still below 4.x) and use `npm` to install [PhantomJS](http://phantomjs.org), [CasperJS](http://phantomjs.org) and [SlimerJS](https://slimerjs.org):

```bash
$ sudo npm install -g casperjs phantomjs-prebuilt slimerjs
```

Now you should clone this repository in a project directory:

```bash
$ git clone https://bitbucket.org/uwegerdes/frontend-development.git
```

Some node modules have to be installed:

```bash
$ cd frontend-development
$ npm install
```

If you pull from this repository and get a new version of `package.json` you should run:

```bash
$ npm update
```

## Usage

Use the default config file or edit your own.

Start the tests with:

```bash
$ cd frontend-development
$ gulp [task]
```

Test results are saved in the `results` subdirectory.

## Headless Slimerjs

If you are on a Linux system (Mac might work too) you can switch the execution of SlimerJS to run headles with Xvfb.

```bash
$ sudo apt-get install xvfb
$ xvfb-run -a [-e /dev/stdout] casperjs test --engine=slimerjs test-forms.js --cfg=config/default.js
```

# Docker uwegerdes/gulp-frontend

Install [Docker](https://www.docker.com/).

During development I've used cache docker to speed up the building of the docker image.

I'm using some firewall settings on my local system. Make sure the localhost port 3142 and 3143 are open for docker server (mine works in the subnet 172.17.0.0/24), in the commands you find $(hostname -i) which should echo your local ip address.

### [apt-cacher-ng](https://hub.docker.com/r/sameersbn/apt-cacher-ng/)

On my system had problems with more than 20(?) files - restart the `docker build` below 5 or 6 times, than the cache is filled. Perhaps other apt-cacher-ng dockers might work better.

```bash
$ sudo mkdir -p /srv/docker/apt-cacher-ng
$ docker run --name apt-cacher-ng -d --restart=always -p 3142:3142 -v /srv/docker/apt-cacher-ng:/var/cache/apt-cacher-ng sameersbn/apt-cacher-ng
```

### [npm-proxy-cache](https://hub.docker.com/r/kudoz/npm-proxy-cache/)

```bash
$ sudo mkdir -p /srv/docker/npm-proxy-cache
$ docker run --name npm-proxy-cache -d --restart=always -p 3143:8080 -v /srv/docker/npm-proxy-cache:/cache kudoz/npm-proxy-cache
```

## Create docker image

Here are the commands to build the docker image - mind the '.' at the end of the commands (meaning use current directory containing `Dockerfile` and other files needed for build). The build-args might be ommitted, the proxy settings assume that your computer `$(hostname -i)` has the proxy servers.

```bash
$ docker build -t uwegerdes/gulp-frontend \
	--build-arg APT_PROXY="http://$(hostname -i):3142" \
	--build-arg NPM_PROXY="--proxy http://$(hostname -i):3143 --https-proxy http://$(hostname -i):3143 --strict-ssl false" \
	--build-arg NPM_LOGLEVEL="--loglevel warn" \
	--build-arg TZ="Europe/Berlin" \
	--build-arg GULP_LIVERELOAD="5381" \
	--build-arg RESPONSIVE_CHECK_HTTP="5382" \
	.
```

Some 20 Minutes and 1.5 GB later...

Run a container from the image just created and connect to your environment (with the ports of gulp livereload on 5381, responsive-check on 5382 and a running nginx docker container):

```bash
$ docker run -it \
	--name gulp-frontend \
	-v $(pwd):/usr/src/app \
	-p 5381:5381 \
	-p 5382:5382 \
	--add-host dockerhost:$(docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}' nginx) \
	uwegerdes/gulp-frontend \
	bash
```

Inside the running docker container start `bower install` to load more dependencies, they will be in your project directory (you might want to look inside for using the components) and set your git settings - you can `git commit` etc. inside the container:

```bash
$ bower install
$ git config --global user.name "Your Name"
$ git config --global user.email "you@example.com"
```

Next start `gulp` with an optional task. If no task is given the default task runs `[ 'build', 'watch' ]`:

```bash
$ gulp build
$ gulp lint
$ gulp less

$ gulp tests
$ gulp test-forms-default
$ gulp test-forms-default-slimer
$ gulp test-forms-login
$ gulp test-forms-login-slimer

$ gulp watch

$ gulp
```

Stop `gulp watch` with CTRL-C and exit the container with CTRL-D.

Restart and attach to the container (just hit RETURN to get a prompt):

```bash
$ docker start --attach -i gulp-frontend
```

To install or update node modules use the following commands:

```bash
$ cd ${HOME} && \
	cp ${APP_DIR}/package.json . && \
	npm ${NPM_LOGLEVEL} ${NPM_PROXY} --save-dev install node_module && \
	cp package.json ${APP_DIR}/ && \
	cd ${APP_DIR}

$ cd ${HOME} && \
	cp ${APP_DIR}/package.json . && \
	npm ${NPM_LOGLEVEL} ${NPM_PROXY} update && \
	cp package.json ../app/ && \
	cd ${APP_DIR}
```

The cp commands make shure that `npm` uses the projects `package.json`. Because `npm` hard replaces `package.json` it cannot use a soft link inside the container.

You can also restart this container in another project which uses gulp. All installed node modules will be available in all projects. Please be careful not to remove modules used in other projects. Removing them from the `package.json` should be enough.

If you think of removing a container after installing some node modules and want to run it later and *must* call the update command above inside the new container to reinstall the modules. Or you can `docker build` the image with the full featured `package.json`.
