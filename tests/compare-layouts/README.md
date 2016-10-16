# compare-layouts

Comparing rendered HTML pages

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
$ git clone https://bitbucket.org/uwegerdes/compare-layouts.git
```

Some node modules have to be installed:

```bash
$ cd compare-layouts
$ npm install
```

If you pull from this repository and get a new version of `package.json` you should run:

```bash
$ npm update
```

## Usage

Start the server:

```bash
$ npm start
```

You can now use your favorite browser to open [http://localhost:3000/app/](http://localhost:3000/app/).

The config file `default.js` uses PhantomJS (headless Webkit) and CasperJS (Firefox) to compare the homepage (index.html) of the application and the /app view generated from the templates in the views directory. This fails usually because the rendering is not identical. But this is only a default test. You may change or remove it if you like.

On the first run there could be an error from SlimerJS: the profile is missing. It is created and the error should not appear again.

Write your own config file(s) to define the pages and elements on the page you want to compare.

The normal use case compares a previous version (use `'cache': true` in the config file) with the actual version (`'cache': false`) using either PhantomJS *OR* SlimerJS. But you may also wish to compare your developement version (with a virtual domain on your PC) with a live version or staging system.

During developement most tests should continue to succeed. The things you develop might fail until they are completed - set both cachings to true to disable the test temporarily. Or you might wish to set both caches to false and use engines PhantomJS and CasperJS to see both rendered results after running the test. If you stop developing that feature simply make a copy of the test, change one to PhantomJS, the other test to CasperJS and set one `"cache"` to `true` and the other to `false`.

## Headless Slimerjs

If you are on a Linux system (Mac might work too) you can switch the execution of SlimerJS to run headles with Xvfb.

```bash
$ sudo apt-get install xvfb
```

The command is commented out in `compare-layouts.js`. Activate it (and deactivate the other command) and restart the server.

## [Docker](http://www.docker.com/) building and useful commands

The application can be containered with Docker.

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

### Build docker image

The `Dockerfile` can be built with the following command (don't forget the '.' at the end of the line):

```bash
$ docker build -t compare-layouts .
```

### First start of Docker

```bash
$ docker run -d \
    --name compare-layouts-default \
    compare-layouts
```

Open 'http://[ip address]:3000/ in your browser.

### Start with config and results in host file system

Create you PROJECTDIR with subdirectories `config` (and have some configuration files there) and `results` and run:

```bash
$ cd PROJECTDIR
$ docker run -d \
    -v $(pwd)/config:/usr/src/app/config \
    -v $(pwd)/results:/usr/src/app/results \
    -p 3001:3000 \
    -e TZ=Europe/Berlin \
    --name compare-layouts \
    compare-layouts
```

Now open 'http://localhost:3001/ in your browser.

### Useful commands

```bash
$ docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}' compare-layouts
$ docker exec -it compare-layouts bash
$ docker logs -f compare-layouts
$ docker stop compare-layouts
$ docker start compare-layouts
$ docker restart compare-layouts
```

With `--add-host mydomain.local:192.168.1.18` you can add a local virtual host to the containers `/etc/hosts` file.

