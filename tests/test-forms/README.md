# test-forms

Testing forms and submit results with gulp, casperjs and docker.

The example configs test an application where a user can create an account, confirm, login, modify and delete the account.

See the config files to get an idea of what is happening. After running the test tasks look at the results directory for screen shots and html snippets.

## Integration in frontend-development project

The gulp tasks in this project are integrated in the gulpfile.js of my frontend-development project. You don't need to run this gulpfile if you use that project.

You can start `gulp` with a task from another terminal:

```bash
$ docker exec -it gulp-frontend bash
node@xxx:/usr/src/app$ cd tests/test-forms
node@xxx:/usr/src/app$ gulp test-forms-default
node@xxx:/usr/src/app$ gulp test-forms-default-slimer
node@xxx:/usr/src/app$ gulp test-forms-login
node@xxx:/usr/src/app$ gulp test-forms-login-slimer
```

## Run gulp docker image

Run a container from the image `uwegerdes/gulp-frontend` in this directory and connect to your environment (with a running nginx docker container, the hostname `dockerhost` is used in test configs - start the servers with `docker-compose up -d` in the frontend-development project).

```bash
$ docker run -it --rm \
	--name test-forms \
	-v $(pwd):/usr/src/app \
	--network="$(docker inspect --format='{{.HostConfig.NetworkMode}}' nginx)" \
	--add-host dockerhost:$(docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}' nginx) \
	uwegerdes/gulp-frontend \
	bash
```

You can start `gulp` without parameters to start watching changes of the .js files or with the following tasks:

```bash
$ gulp test-forms-default
$ gulp test-forms-default-slimer
$ gulp test-forms-login
$ gulp test-forms-login-slimer
```

If you executed `test-forms-login` you might want to have a look in the `mail` container:

```bash
docker exec -it mail gosu testbox alpine
```

Exit the container with CTRL-D.
