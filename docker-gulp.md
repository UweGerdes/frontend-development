# Dockerfile for frontend development and testing environment with GulpJS, PhantomJS, CasperJS, SlimerJS

## Docker uwegerdes/frontend-development

Install [Docker](https://www.docker.com/).

During development I've used cache docker to speed up the building of the docker image.

I'm using some firewall settings on my local system. Make sure the localhost port 3142 and 3143 are open for docker server (mine works in the subnet 172.17.0.0/24), in the commands you find $(hostname -i) which should echo your local ip address.

### [apt-cacher-ng](https://hub.docker.com/r/uwegerdes/apt-cacher-ng/)

```bash
$ sudo mkdir -p /srv/docker/apt-cacher-ng
$ sudo chmod a+w /srv/docker/apt-cacher-ng
$ docker run -d \
	--restart=always \
	--name apt-cacher-ng \
	--hostname apt-cacher-ng \
	-p 3142:3142 \
	-v /srv/docker/apt-cacher-ng:/var/cache/apt-cacher-ng \
	uwegerdes/apt-cacher-ng
```

### [npm-proxy-cache](https://hub.docker.com/r/folha/npm-proxy-cache/)

```bash
$ sudo mkdir -p /srv/docker/npm-proxy-cache
$ sudo chmod a+w /srv/docker/npm-proxy-cache
$ docker run -d \
	--name npm-proxy-cache \
	--restart=always \
	-p 3143:8080 \
	-v /srv/docker/npm-proxy-cache:/cache \
	folha/npm-proxy-cache
```

## Build and run application server dockers

Build the dockers in the `docker-compose.yml` - the servers are needed for tests.

```bash
$ export APT_PROXY=http://$(hostname -i):3142 && \
  export TZ=Europe/Berlin && \
  docker-compose up -d
```

Some Minutes and 2.5 GB later...

## Create gulp docker image

Now build the docker image - mind the '.' at the end of the command (meaning use current directory containing `Dockerfile` and other files needed for build). The build-args might be ommitted, the proxy settings assume that your computer `$(hostname -i)` has the proxy servers.

If the docker should run on an arm based system please build phantomjs first (see my docker for that) and copy the resulting `bin/phantomjs` to `./build/phantomjs/bin/phantomjs`.

If you have npm-proxy-cache running please make sure you build uwegerdes/nodejs with parameters before this:

```bash
$ docker build -t uwegerdes/frontend-development \
	--build-arg GULP_LIVERELOAD="8081" \
	--build-arg RESPONSIVE_CHECK_HTTP="8082" \
	--build-arg COMPARE_LAYOUTS_HTTP="8083" \
	.
```

Some Minutes and 1.1 GB later...

If you are using Docker on armhf you should add `-f Dockerfile.armhf` to the build command and wait about 30 minutes.

## Start the gulp container

Run a container from the image just created and connect to your environment (with the ports of gulp livereload on 8081, responsive-check on 8082 and a running nginx docker container, the hostname `dockerhost` is used in test configs).

This command removes the container after end - useful if your nginx ip address changes.

```bash
$ docker run -it --rm \
	--name frontend-development \
	-v $(pwd):/home/node/app \
	-p 8081:8081 \
	-p 8082:8082 \
	-p 8083:8083 \
	--network="$(docker inspect --format='{{.HostConfig.NetworkMode}}' nginx)" \
	--add-host dockerhost:$(docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}' nginx) \
	uwegerdes/frontend-development \
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

There are some sub-projects with a gulp:

```bash
$ cd ~/app/tests/compare-layouts && gulp
$ cd ~/app/tests/responsive-check && gulp
$ cd ~/app/tests/test-forms && gulp
```

Stop `gulp watch` with CTRL-C and exit the container with CTRL-D.

To have a second terminal connected to the gulp container (perhaps start tasks that are not triggered by watch):

```bash
$ docker exec -it frontend-development bash
```

If you started frontend-development without `--rm` you may restart and attach to the container (just hit RETURN to get a prompt):

```bash
$ docker start -ai frontend-development
```

## Tests

Start the self tests with:

```bash
$ docker run -it --rm \
	-v $(pwd):/home/node/app \
	--network="$(docker inspect --format='{{.HostConfig.NetworkMode}}' nginx)" \
	--add-host dockerhost:$(docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}' nginx) \
	uwegerdes/frontend-development \
	npm test
```

You can start the tests in a running container - change a file (a test config) in the respective directory to see gulp working:

```bash
$ npm run compare-layouts
$ npm run responsive-check
$ npm run test-forms
```

To install node modules use the following commands:

```bash
$ cd ${HOME} && \
	cp ${APP_HOME}/package.json . && \
	npm install --save-dev node_module && \
	cp package.json ${APP_HOME}/ && \
	cd ${APP_HOME}
```

The cp commands make sure that `npm` uses the projects `package.json`. Because `npm` hard replaces `package.json` it cannot use a soft link inside the container.

You can also run this container in another project which uses gulp. Make sure to `npm update` to get additional project dependencies installed in the container.

If you think of removing a container after installing some node modules and want to run it later and *must* call the update command above inside the new container to reinstall the modules. Or you can `docker build` the image with the full featured `package.json`.

Rebuild the image if container is deleted - the node_modules are gone too.
