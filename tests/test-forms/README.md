# test-forms

Testing forms and submit results with gulp, casperjs and docker.

The example configs test an application where a user can create an account, confirm, login, modify and delete the account.

## Create gulp docker image

If you have an apt-cacher-ng proxy server you should run:

```bash
$ export APT_PROXY=http://$(hostname -i):3142
```

Perhaps open port 3142 in your firewall to allow access from the docker-engine.

Now build the gulp docker image - mind the '.' at the end of the command (meaning use current directory containing `Dockerfile` and other files needed for build). The build-args might be ommitted, the proxy settings assume that your computer `$(hostname -i)` has the proxy servers.

```bash
$ docker build -t uwegerdes/test-forms \
	--build-arg NPM_PROXY="--proxy http://$(hostname -i):3143 --https-proxy http://$(hostname -i):3143 --strict-ssl false" \
	--build-arg NPM_LOGLEVEL="--loglevel warn" \
	--build-arg GULP_LIVERELOAD="5381" \
	--build-arg RESPONSIVE_CHECK_HTTP="5382" \
	--build-arg COMPARE_LAYOUTS_HTTP="5383" \
	.
```

Some 8 Minutes and 1.5 GB later...

## Start the gulp container

Run a container from the image just created and connect to your environment (with a running nginx docker container, the hostname `dockerhost` is used in test configs).

This command removes the container after end - useful if your nginx ip address changes.

```bash
$ docker run -it --rm \
	--name test-forms \
	-v $(pwd):/usr/src/app \
	--network="$(docker inspect --format='{{.HostConfig.NetworkMode}}' nginx)" \
	--add-host dockerhost:$(docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}' nginx) \
	uwegerdes/gulp-frontend
```

You can also start `gulp` with a task from another terminal:

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
$ alias testforms='docker exec -t test-forms gulp'
```

Stop the container with CTRL-C and exit the container with CTRL-D.
