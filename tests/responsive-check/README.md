# responsive-check

Screenshots for different device viewports.

The example configs tests an application where a user can create an account, confirm, login, modify and delete the account.

## Create gulp docker image

If you have an apt-cacher-ng proxy server (see below) you should run:

```bash
$ export APT_PROXY=http://$(hostname -i):3142
```

Perhaps open port 3142 in your firewall to allow access from the docker-engine.

Run a container from the image `uwegerdes/gulp-frontend` and connect to your environment (with the localhost ports of gulp livereload on 5381, responsive-check on 5382 and a running nginx docker container, the hostname `dockerhost` is used in test configs).

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

Stop the container with CTRL-C and exit the container with CTRL-D.
