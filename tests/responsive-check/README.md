# responsive-check

Make screenshots for different device viewports and see them on one page with the server.

The example configs tests use my frontend-development sample application where a user can create an account, confirm, login, modify and delete the account.

## Run gulp docker image

Run a container from the image `uwegerdes/gulp-frontend` and connect to your environment (with the localhost ports of gulp livereload on 8081, responsive-check on 8082 and a running nginx docker container, the hostname `dockerhost` is used in test configs).

This command removes the container after end - useful if your nginx ip address changes.

```bash
$ docker run -it --rm \
	--name responsive-check \
	-v $(pwd):/usr/src/app \
	-p 8081:8081 \
	-p 8082:8082 \
	--network="$(docker inspect --format='{{.HostConfig.NetworkMode}}' nginx)" \
	--add-host dockerhost:$(docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}' nginx) \
	uwegerdes/gulp-frontend
```

Open `http://localhost:8082/` in your favourite browser.

Stop the container with CTRL-C and exit the container with CTRL-D.
