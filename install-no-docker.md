## Installation without Docker

The documentation here is not complete - consider using the dockered application environment.

My system is Ubuntu 16.04 - there are some other steps to be taken on Windows systems.

You may also try this installation in a virtual machine. It worked for me on an Ubuntu 16.04 (I hope all dependencies are included here).

Or build Docker containers using the supplied `docker-compose.yml` (and keep your project directory clean from node_modules). Sorry for repeating myself.

# Installation on your OS (no docker)

Some software is required on a blank Ubuntu system:

```bash
$ sudo apt-get install bzip2 curl git imagemagick python wget
```

Install [Node.js](https://nodejs.org/en/) (my version is 4.4.7, don't use the version from Ubuntu repositories if it is still below 4.x) and use `npm` to install [PhantomJS](http://phantomjs.org), [CasperJS](http://phantomjs.org) and [SlimerJS](https://slimerjs.org) (make sure you have Firefox installed for SlimerJS):

```bash
$ sudo npm install -g bower casperjs gulp phantomjs-prebuilt phplint slimerjs
```

Now you should clone this repository in a project directory:

```bash
$ git clone https://github.com/TinTom/frontend-development.git
```

Some node modules and bower components have to be installed:

```bash
$ cd frontend-development
$ npm install
$ bower install
```

## Usage

Start the gulp with:

```bash
$ cd frontend-development
$ gulp
```

Build tasks are executed and the responsive-check server is started. Check the configurations and edit the hostname for the tests to your environment.

## Headless Slimerjs

If you are on a Linux system (Mac might work too) you can switch the execution of SlimerJS to run headless with Xvfb.

```bash
$ sudo apt-get install xvfb
$ xvfb-run -a [-e /dev/stdout] casperjs test --engine=slimerjs test-forms.js --cfg=config/default.js
```
