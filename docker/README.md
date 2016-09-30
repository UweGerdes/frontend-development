# Dockerfiles for sample php application

You could run the sample php application on you pc: install a web server, MySQL-Database, Gulp and configure them.

Or install Docker and use the scripts here to generate the docker images and containers. Less effort - more diskspace and downloading time. And new inspiration for your development workflow.

## Quick start

- Install [Docker](https://www.docker.com/) - *OR* install a web server, MySQL-Database, Gulp and configure them.
- Create a project directory: `mkdir -p ~/projects/myproject`.
- Check out this repository (or download and unpack the zip file): `git checkout https://bitbucket.org/uwegerdes/frontend-development.git`.
- Change to the new directory: `cd frontend-development`.
- Build images and launch containers: `docker-compose up -d`.
- Open [http://localhost:3280](http://localhost:3280) in your favorite browser.

You may edit the code in the subdirectories and see how the Docker containers do their work.

If you have a firewall you might want to open some ports.

You find more on starting, stopping, inspecting, changing and much more below.

If you have a project simply copy the file `docker-compose.yml` into that directory, change some path names that point to your project structure and storage directories, give it a unique local ip port and fire it up.

## Docker basics

You need [Docker](https://www.docker.com/) installed on your System - see the documentation. Please read the notes to you operating system - I'm using Ubuntu. You may give it a try in a virtual machine - connect some shared directories to for your project files.

Then we will need some docker images and containers for the different tasks. Don't worry, they are created and maintained with some simple commands.

The docker images are built once (or again if you like - its only a single command). The build requires a lot of files and prepared images - they are downloaded from the internet so make sure your internet connection has enough bandwidth. Some 100 MB will be downloaded. And more than 2GB free disk space is recommended. But it's worth it!

With an image a container can be started, some parameters connect the container with you system (e.g. mount files or directories of your file system into the container, connect ip ports from the container to ports on you localhost).

## Building the images

During developement I've used apt-cacher-ng docker to speed up the building of the docker baseimage. The cache settings are included in the baseimage and reused for other builds based on that image.

I'm using some firewall settings - make sure the localhost port 3142 is open for docker server (mine works in the subnet 172.17.0.0/24).

### [apt-cacher-ng](https://hub.docker.com/r/sameersbn/apt-cacher-ng/)

On my system had problems with more than 20(?) files - restart the building the baseimage with APT_PROXY below 5 or 6 times, than the cache is filled. Perhaps other apt-cacher-ng dockers might work better.

```bash
$ sudo mkdir -p /srv/docker/apt-cacher-ng
$ docker run --name apt-cacher-ng -d --restart=always -p 3142:3142 -v /srv/docker/apt-cacher-ng:/var/cache/apt-cacher-ng sameersbn/apt-cacher-ng
```

The APT_PROXY argument for the baseimage must be an ip number that is known in the docker server - it knows nothing of your hostfile so you can use a static ip or the ip of the running apt-cacher-ng container (this ip might change on your system if ).

## Build the images

The commands to build the docker images for the sample php application are:

```bash
$ docker build -t uwegerdes/baseimage --build-arg TZ='Europe/Berlin' ./baseimage/

### with apt-cacher-ng
$ docker build -t uwegerdes/baseimage --build-arg APT_PROXY='http://192.168.1.18:3142' --build-arg TZ='Europe/Berlin' ./baseimage/

$ docker rmi uwegerdes/baseimage

$ docker build -t uwegerdes/data ./data/

$ docker build -t uwegerdes/mysql ./mysql/

$ docker build -t uwegerdes/php-fpm ./php-fpm/

$ docker build -t uwegerdes/nginx ./nginx/
$ docker rmi uwegerdes/nginx
```

I'm using my own baseimage, it contains a proxy setting for apt - if you build more often this will save some download time.

Mysql setup only works on on ubuntu:trusty, not on ubuntu:latest. I should investigate that.

## Starting the containers

Now we need to start and connect the containers for our application. The commands here do the same as the `docker-compose.yml` but here you see how the magic works. The containers Make sure you have the correct file names if you changed your project structure.

### data

There is nothing much happening in the data container. $(pwd)/htdocs is used by nginx and php-fpm, /srv/docker/mysql by mysql. Make sure you have a htdocs directory in your current location or supply the complete path:

```bash
$ docker run \
	-v $(pwd)/../htdocs:/var/www/htdocs \
	-v /srv/docker/mysql:/var/lib/mysql \
	--name data \
	uwegerdes/data
```

The command will create a container and exit. That is ok because only the volumes from the container will be used.

If you set `CMD [ "/bin/bash" ]` in the Dockerfile you can start the container with `-it` to open the shell. You may exit it with CRTL-D but perhaps `docker start --attach -i data` later to look at the data.

### mysql

Create a directory `/srv/docker/mysql` to store the data outside the container and the image - if you recreate them the data is still there.

```bash
$ docker run -d \
	-e 'DB_USER=demoUser' \
	-e 'DB_PASS=demoPass' \
	-e 'DB_NAME=demoDb' \
	-e 'DB_REMOTE_ROOT_NAME=root' \
	-e 'DB_REMOTE_ROOT_PASS=123456' \
	--volumes-from data \
	--name mysql \
	uwegerdes/mysql
```

Now your mysql server runs in background waiting for connections.

You don't need all external params - but either create a database with a user or set a root account to create it later.

The mysql container exposes port 3306 but we don't expose it on the host system. The php-fpm container get's a direct link.

Otherwise you could add `-p 3086:3306` - you see a port number mapping, it should not collide with the server on my host system.

To keep the database on your host you could set `-v /srv/docker/mysql:/var/lib/mysql` instead of `--volumes-from data`.

To work with the database go to the `docker` directory and use:

```bash
$ docker exec -i mysql mysql -u demoUser -pdemoPass demoDb < ./mysql/init_database.sql
$ docker exec -i mysql mysqldump -u demoUser -pdemoPass demoDb > demoDbDump.sql
$ docker exec -it mysql mysql -u demoUser -pdemoPass demoDb
```

Or have a script `docker-mysql.sh` to decide if there is a pipe or not:

```bash
#!/bin/bash
if [ -t 0 ]; then
    docker exec -it docker_db_1 mysql "$@"
else
    docker exec -i docker_db_1 mysql "$@"
fi
```

### php-fpm

Now let's run a php-fpm container with volumes from the data container and network link to the mysql container:

```bash
$ docker run -d \
	--volumes-from data \
	--link mysql \
	--name php-fpm \
	uwegerdes/php-fpm
```

There is nothing much to say: php-fpm need the php files (the server only sends the http request) and the application want's to use the database.

### nginx

To connect it with php-fpm use:

```bash
$ docker run -d \
	-p 3080:80 \
	--volumes-from data \
	--link php-fpm \
	--name nginx \
	uwegerdes/nginx
```

To use different configuration add the following lines

```bash
	-v $(pwd)/nginx/nginx.conf:/etc/nginx/nginx.conf \
	-v $(pwd)/nginx/sites-enabled/default:/etc/nginx/sites-enabled/default \
```

If you prefer to use socket connection you should add `--volumes-from php` and change the settings in `php-fpm/config/pool.d/www.conf`: `listen = /var/run/php5-fpm.sock` and `nginx/config/sites-enabled/default-php-fpm`: `fastcgi_pass unix:/var/run/php5-fpm.sock`.

## Open Page

Open [http://localhost:3080/](http://localhost:3080/) in your preferred browser - you should see the data/htdocs/index.html content. Change the file and reload it.

The log output of nginx is redirected to stdout/stderr (see Dockerfile) so you can easily get it from the running container with `docker logs -f test-nginx`.
If you prefer to use the standard logging simply remove the `RUN ln -sf...` lines from Dockerfile. You can add a `VOLUME [ "/var/log/nginx" ]` to give the hint that containers should mount a host directory `-v SOMEDIR/nginxlog:/var/log/nginx` for permanent storage of the logs.

Now start to examine the container (hit CTRL-C to exit `docker exec -it` and `docker logs -f`):

```bash
$ docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}' test-nginx
$ docker exec -it nginx bash
$ docker logs -f nginx
$ docker stop nginx
$ docker start nginx
$ docker restart nginx
```

To get rid of it you need to:

```bash
$ docker stop nginx
$ docker rm nginx
$ docker rmi uwegerdes/nginx
```

We will create another container for our application later so you might wish to remove this container.

Or include `-ti --rm` instead of `-b` to the docker run command to have it removed automatically and see the output in foreground:

```bash
docker run -ti --rm \
	-p 3080:80 \
	-v $(pwd)/config/vhost.conf:/etc/nginx/sites-enabled/vhost.conf \
	-v $(pwd)/htdocs:/var/www/html \
	--name tmp-nginx \
	uwegerdes/nginx
```

Use another terminal for `docker exec -it tmp-nginx bash`, use CTRL-D to exit.

Hit CTRL-C to stop the docker container `tmp-nginx`.

If you want to work with virtual hosts later, you might want to add `--hostname=nginx.docker` to your run command. That name is added to `/etc/hosts` in the container for it' own ip. You could add a line to your pc /etc/hosts but the ip could change.

## What is happening

In the subdirectoies you find several files named `Dockerfile` - they contain the commands to create a docker image. You may edit them if you like - then create a new image (use another `-t tag/name` or delete the other image).

When building images Docker will make a several steps and cache them. If another docker image is built with silimar steps they are reused to save bandwidth.

So it is a good idea to build the images on the same base image. Here the `phusion/baseimage` is included.

The prepared images on my [Docker Hub](https://hub.docker.com/uwegerdes) account for nginx, mysql, php, gulp etc. They depend on the same base image. For more flexible Docker images see the well documented docker repository [sameersbn](https://hub.docker.com/r/sameersbn/).

I followed the excellent explanations on [http://www.newmediacampaigns.com/blog/docker-for-php-developers](http://www.newmediacampaigns.com/blog/docker-for-php-developers) to set up the base server system, but modified the files to use cache dockers, changed scripts and paths to reflect my favorite project structure and use some nice tools for development. Perhaps you might want to extend the features with your other helpful tools.

## Pros and Cons

### Isolation and Connection

The system can be set up for every frontend project you develop and maintain. Each one lives in a separate (or connected) docker container collection.

### Minimal OS impact

You only need Docker - the rest is running inside Docker and only valuable (project) and/or persistent (cache, database) data is stored in files on your disk. You should backup those files on a regular base.

The Docker image and container files are in a special folder (/var/lib/docker on my Ubuntu 16.04 system) but you should keep you hands off of that. But there you see a subfolder `aufs` - this might give you a hint how the docker build layers and the containers are layered onto each other.

The running containers use much less memory than other virtualization solutions - this leads to the habit to create a Docker container for a single task and connect it to others to do other things for a complex application.

### Flexibility

You have a different approach to your project? You may play around with my samples and create something that you like.

You've got a new PC? Everything you need is at hand - no setup and configuration of servers. You only need the backup of you project directories and the persistence folder `/srv/docker`.

### Killing problems with disk space

Yes - Docker images and containers require space on your disk. If you want to play with Docker yourself make sure to have some GB free. But that doesn't influence the need of RAM - only the programs you need are started inside the docker container. And everything starts up and stop in reasonable time.

# Common failures

docker: Error response from daemon: rpc error: code = 2 desc = "oci runtime error: could not synchronise with container process: not a directory".

* Please make sure you connect `v file:directory/` or `-v directory:directory` in docker run command.
* Please make sure you are in the right directory - perhaps docker created some directories.

Changes to baseimage not affecting dependet images

* remove baseimage with `docker rmi baseimage` - perhaps you have to remove some unnamed cached images first (see `docker images`).

nginx not executing php scripts

* Make sure you replace `/etc/nginx/sites-enabled/default` or create a vhost.conf that doesn't collide with it (port / hostname).

