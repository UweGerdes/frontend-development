# Dockerfile for frontend development and testing environment with GulpJS, PhantomJS, CasperJS, SlimerJS

## Docker uwegerdes/gulp-frontend

Install [Docker](https://www.docker.com/).

During development I've used cache docker to speed up the building of the docker image.

I'm using some firewall settings on my local system. Make sure the localhost port 3142 and 3143 are open for docker server (mine works in the subnet 172.17.0.0/24), in the commands you find $(hostname -i) which should echo your local ip address.

### [apt-cacher-ng](https://hub.docker.com/r/sameersbn/apt-cacher-ng/)

```bash
$ sudo mkdir -p /srv/docker/apt-cacher-ng
$ sudo chmod a+w /srv/docker/apt-cacher-ng
$ docker run --name apt-cacher-ng -d --restart=always -p 3142:3142 -v /srv/docker/apt-cacher-ng:/var/cache/apt-cacher-ng sameersbn/apt-cacher-ng
```

### [npm-proxy-cache](https://hub.docker.com/r/kudoz/npm-proxy-cache/)

```bash
$ sudo mkdir -p /srv/docker/npm-proxy-cache
$ sudo chmod a+w /srv/docker/npm-proxy-cache
$ docker run --name npm-proxy-cache -d --restart=always -p 3143:8080 -v /srv/docker/npm-proxy-cache:/cache kudoz/npm-proxy-cache
```

## Create application server dockers

Build the dockers in the `docker-compose.yml` - the servers are needed for tests.

Some 8 Minutes and 1.5 GB later...

## Create gulp docker image

Now build the docker image - mind the '.' at the end of the command (meaning use current directory containing `Dockerfile` and other files needed for build). The build-args might be ommitted, the proxy settings assume that your computer `$(hostname -i)` has the proxy servers.

```bash
$ docker build -t uwegerdes/gulp-frontend \
	--build-arg NPM_PROXY="--proxy http://$(hostname -i):3143 --https-proxy http://$(hostname -i):3143 --strict-ssl false" \
	--build-arg NPM_LOGLEVEL="--loglevel warn" \
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
	-p 5383:5383 \
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

$ gulp watch

$ gulp
```

Stop `gulp watch` with CTRL-C and exit the container with CTRL-D.

To have a second terminal connected to the gulp container (perhaps start tasks that are not triggered by watch):

```bash
$ docker exec -it gulp-frontend bash
```

If you started gulp-frontend without `--rm` you may restart and attach to the container (just hit RETURN to get a prompt):

```bash
$ docker start --attach -i gulp-frontend
```

## Tests

You can start the tests in a running container - change a file (a test config) in the respective directory to see gulp working:

```bash
$ npm run compare-layouts
$ npm run responsive-check
$ npm run test-forms
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

You can also run this container in another project which uses gulp. Make sure to `npm update` to get additional project dependencies installed in the container.

If you think of removing a container after installing some node modules and want to run it later and *must* call the update command above inside the new container to reinstall the modules. Or you can `docker build` the image with the full featured `package.json`.
