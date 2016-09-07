# docker with jshint and testing environment GulpJS, PhantomJS, CasperJS, SlimerJS

test html form input and result

## Installation

My system is Ubuntu 16.04 - perhaps there are some other steps to be taken on Windows systems (TODO).

You may also try this installation in a virtual machine. It worked for me on an Ubuntu 16.04 (I hope all dependencies are included here).

Or build a Docker image using the supplied Dockerfile.

Some other software is required on a blank Ubuntu system:

```bash
$ sudo apt-get install g++ git imagemagick python
```

Perhaps some other packages might be useful: ```bzip2 curl make openssh-client subversion wget```

Install [Node.js](https://nodejs.org/en/) (my version is 4.4.7, don't use the version from Ubuntu repositories if it is still below 4.x) and use `npm` to install [PhantomJS](http://phantomjs.org), [CasperJS](http://phantomjs.org) and [SlimerJS](https://slimerjs.org):

```bash
$ sudo npm install -g phantomjs@1.9.19 casperjs slimerjs
```

The above version number for phantomjs is the npm installer version - it installs PhantomJS 1.9.8.

Now you should clone this repository in a project directory:

```bash
$ git clone https://bitbucket.org/uwegerdes/test-forms.git
```

Some node modules have to be installed:

```bash
$ cd test-forms
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
$ cd test-forms
$ casperjs test test-forms.js --cfg=config/default.js
$ casperjs test --engine=slimerjs test-forms.js --cfg=config/default.js
```

Test results are saved in the `results` subdirectory.

## Headless Slimerjs

If you are on a Linux system (Mac might work too) you can switch the execution of SlimerJS to run headles with Xvfb.

```bash
$ sudo apt-get install xvfb
$ xvfb-run -a [-e /dev/stdout] casperjs test --engine=slimerjs test-forms.js --cfg=config/default.js
```

## Use Docker uwegerdes/gulp-frontend-dev-test

During developement I've used cache docker to speed up the building of the docker image.

I'm using some firewall settings - make sure the localhost ports 3142 and 3143 are open for Docker (mine works in the subnet 172.17.0.0/24).

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

```bash
$ docker build -t uwegerdes/gulp-frontend-dev-test .
$ docker run -it \
	--name gulp-frontend-dev-test \
	-v $(pwd)/package.json:/usr/src/app/package.json \
	-v $(pwd)/gulpfile.js:/usr/src/app/gulpfile.js \
	-v $(pwd)/tests:/usr/src/app/tests \
	-v $(pwd)/tools:/usr/src/app/tools \
	-v $(pwd)/src:/usr/src/app/src \
	-v $(pwd)/htdocs:/usr/src/app/htdocs \
	--add-host frontend.local:192.168.1.18 \
	-e TZ=Europe/Berlin \
	uwegerdes/gulp-frontend-dev-test \
	bash

	gulp --gulpfile tools/gulpfile.js less

	npm --proxy http://192.168.1.18:3143 --https-proxy http://192.168.1.18:3143 --strict-ssl false --loglevel warn --save-dev install gulp-less gulp-autoprefixer gulp-uglify gulp-notify gulp-changed gulp-less-changed gulp-shell gulp-markdown gulp-insert

	npm update
```

In the shell run your favourite gulp commands or install more packages.

Restart the container after install/update and attach to the container to reconnect (just hit RETURN to get a prompt):

```bash
$ docker restart gulp-frontend-dev-test && docker attach gulp-frontend-dev-test
```

Perhaps you want to add a watch target for gulpfile.js and package.json which restarts the gulp process using a bash script inside the container. But be careful when the gulpfile.js has errors: it will exit and you can't access it with exec.
Correct your errors and run the container again (-rm flag).

Perhaps one might consider to commit an elaborate base image from the container to be used in other projects.

With `--add-host acteam4:192.168.1.18` you can add a local virtual host to the containers `/etc/hosts` file.
