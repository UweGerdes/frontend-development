# Dockerfiles for sample php application servers

You could run the sample php application on you pc: install a web server, MySQL-Database, Gulp and configure them.

Or install Docker on your computer and use the scripts here to generate the docker images and containers. Less effort - more diskspace and downloading time. And new inspiration for your development workflow.

## Quick start

- Install the newest [Docker](https://www.docker.com/) version and docker-compose (see below). Read the docs, there might be a bit more configuration required.
- Create a project directory: `mkdir ~/projects/sample-frontend-projects` and `cd ~/projects/sample-frontend-projects`.
- Clone this repository (or download and unpack the zip file): `git clone https://github.com/TinTom/frontend-development.git`.
- Change to the new directory: `cd frontend-development`.
- Build Docker server images and launch containers: `docker-compose up -d`.
- Open [http://localhost:3080](http://localhost:3080) in your favorite browser.
- Build and and run the `Dockerfile` in the project directory to have a lot of useful Gulp tasks (see `docker-gulp.md`).
- Run at least `bower install` and `gulp build` in the Gulp container to generate some files.

You may edit the code in the subdirectories and see how the Docker containers do their work.

If you have a firewall you might want to open some ports.

You find more on starting, stopping, inspecting, changing and much more below.

## Installing docker-compose

Make sure you have at least docker-compose version 1.6.0 to use the version 2 syntax of `docker-compose.yml`. On Linux you have to follow the instructions on [https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/). On Windows or Mac the Docker setup should have done this.

In the root directory of this project you find `docker-compose.yml` to set up and run the server dockers.

If you have an apt-cacher-ng proxy server (see below) you should run:

```bash
$ export APT_PROXY=http://$(hostname -i):3142
```

Perhaps open port 3142 in your firewall to allow access from the docker-engine.

Now build and start the servers:

```bash
$ export TZ=Europe/Berlin
$ docker-compose up -d
$ docker ps
```

Open [http://localhost:3080/](http://localhost:3080/) in your preferred browser

## Install in another project

If you have a project simply copy the file `docker-compose.yml` into that directory, change some paths that point to your project structure and storage directories, give it a unique local ip port, change the container names and fire it up.

Copy `package.json`, `gulpfile.js`, `Dockerfile` and perhaps some more files to your project directory, edit them to your needs. Build and run the gulp docker to have Gulp tasks for your project.

## Docker basics

You need [Docker](https://www.docker.com/) installed on your System - see the documentation. Please read the notes to you operating system - I'm using Ubuntu. You may give it a try in a virtual machine - connect some shared directories for your project files.

Then you will need some docker images and containers for the different tasks. `docker-compose up -d` will do the work for you. In this document you find the detailed setup if you want to learn more about Docker.

The docker images are built once (or again if you like - its only a single command). The build requires a lot of files downloaded from the internet so make sure your internet connection has enough bandwidth. Some 500 MB will be downloaded. And more than 5GB free disk space is recommended. But it's worth it!

With an image a container can be started, some parameters connect the containers with each other and your system (e.g. mount files or directories of your file system into the container, connect ip ports from the container to ports on you localhost).

## Preparations

During developement I've used apt-cacher-ng docker to speed up the building of the docker images. The cache settings are included in the baseimage and reused for other builds based on that image.

I'm using some firewall settings on my local system. Make sure the localhost port 3142 is open for docker server (mine works in the subnet 172.17.0.0/24), in the commands you find $(hostname -i) which should echo your local ip address.

### [apt-cacher-ng](https://hub.docker.com/r/sameersbn/apt-cacher-ng/)

You might want to save some download time when playing around with docker, a cache for apt-get is installed on your system with:

```bash
$ sudo mkdir -p /srv/docker/apt-cacher-ng
$ sudo chmod a+w /srv/docker/apt-cacher-ng
$ docker run --name apt-cacher-ng -d --restart=always -p 3142:3142 -v /srv/docker/apt-cacher-ng:/var/cache/apt-cacher-ng sameersbn/apt-cacher-ng
```

The APT_PROXY argument for the baseimage must be an ip address that is known in the docker server - it knows nothing of your hostfile but you can use the ip of your system (not `127.0.0.1`, try `$(hostname -i)`) or the ip of the running apt-cacher-ng container. This ip might change on your system if containers are started in different order, see `$(docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}' apt-cacher-ng)`.

## Build the images

Change to the docker directory:

```bash
$ cd docker
```

The commands to build the docker images for the application servers are:

```bash
$ docker build -t uwegerdes/baseimage --build-arg TZ="Europe/Berlin" ./baseimage/

### with apt-cacher-ng
$ docker build -t uwegerdes/baseimage --build-arg APT_PROXY="http://$(hostname -i):3142" --build-arg TZ="Europe/Berlin" ./baseimage/

$ docker build -t uwegerdes/data ./data/

$ docker build -t uwegerdes/mysql ./mysql/

$ docker build -t uwegerdes/mail ./mail/

$ docker build -t uwegerdes/php-fpm ./php-fpm/

$ docker build -t uwegerdes/nginx ./nginx/
```

I'm using my own baseimage, it remembers the proxy setting for apt - if you build more often this will save some download time.

## Running the containers

Now we need to start and connect the containers for our application. The commands here do the same as the `docker-compose.yml` but here you see how the magic works.

### data

The `$(pwd)/../htdocs` is used by nginx and php-fpm. The expect to have it in `/var/www/htdocs` (see the configurations).

Make sure you have a htdocs directory in your parent folder (`$(pwd)/../htdocs`) or supply the absolute (not relative!) path to your desired web root:

```bash
$ docker run \
	-v $(pwd)/../htdocs:/var/www/htdocs \
	--name data \
	uwegerdes/data
```

The command will create a container and exit. That is ok because only the volumes from the container will be used.

### mysql

Now run your mysql server in background:

```bash
$ docker run -d \
	-e 'MYSQL_ROOT_PASSWORD=123456' \
	--name mysql \
	uwegerdes/mysql
```

The mysql container exposes port 3306 but we don't expose it on the host system. The php-fpm container get's a direct link.

To keep the database on your host you could add `-v /srv/docker/mysql:/var/lib/mysql` to the run command.

To work with the database go to the `docker` directory and exec commands in the running container:

```bash
$ docker exec -i mysql mysql -u root -p123546 demoDb < ./mysql/init_database.sql
$ docker exec -i mysql mysqldump -u root -p123546 demoDb > demoDbDump.sql
$ docker exec -it mysql bash
```

### mail

For the login application we need a mail server which receives and delivers mail:

```bash
$ docker run -d \
	--hostname mail.local \
	--name mail \
	uwegerdes/mail
```

To see what is happening there you might want to:

```bash
$ docker exec -it mail gosu testbox alpine
$ docker exec -it php-fpm tail -f /var/log/www-fpm.log
$ docker exec -it mail bash
```

Alpine is a simple mail client, if you started test-forms-login from the Gulp Docker container you should find the mails.

Hit CTRL-C to stop the tail command and CTRL-D to exit the bash.

### php-fpm

Now let's run a php-fpm container:

```bash
$ docker run -d \
	--volumes-from data \
	--link mysql \
	--link mail \
	--name php-fpm \
	uwegerdes/php-fpm
```

`php-fpm` needs the php files (the server only sends the http request) and the application uses network to mysql and mail server.

To see what is happening there you might want to:

```bash
$ docker exec -it php-fpm tail -f /var/log/www-fpm.log
$ docker exec -it php-fpm bash
```

Hit CTRL-C to stop the tail command and CTRL-D to exit the bash.

### nginx

To connect it with php-fpm use:

```bash
$ docker run -d \
	-p 3080:80 \
	--volumes-from data \
	--volumes-from php-fpm \
	--name nginx \
	uwegerdes/nginx
```

To use different configuration add the following lines

```bash
	-v $(pwd)/nginx/nginx.conf:/etc/nginx/nginx.conf \
	-v $(pwd)/nginx/sites-enabled/default:/etc/nginx/sites-enabled/default \
```

Useful commands:

```bash
$ docker exec -it nginx tail -f /var/log/nginx/access.log
$ docker exec -it nginx bash
```

Hit CTRL-C to stop the tail command and CTRL-D to exit the bash.

## Open Page

Open [http://localhost:3080/](http://localhost:3080/) in your preferred browser - you should see the /htdocs/index.html content. Change the file and reload it.

## Some useful docker commands

```bash
$ docker logs -f mysql
$ docker stop nginx php-fpm mail mysql
$ docker start mysql mail php-fpm nginx
$ docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}' nginx
```

To get rid of it you need to:

```bash
$ docker stop nginx php-fpm mail mysql
$ docker rm nginx php-fpm mail mysql data
$ docker rmi uwegerdes/nginx uwegerdes/php-fpm uwegerdes/mail uwegerdes/mysql uwegerdes/data uwegerdes/baseimage
```

To clean up the docker directories try:

```bash
$ docker rmi $(docker images --filter "dangling=true" -q --no-trunc)
$ docker volume rm $(docker volume ls -qf dangling=true)
```

## What is happening

In the subdirectoies you find several files named `Dockerfile` - they contain the commands to create a docker image. You may edit them if you like - then create a new image (use another `-t tag/name` or delete the other image).

When building images Docker will execute several steps and cache them. If another docker image is built with similar steps they are reused to save bandwidth and build time.

The prepared Dockerfiles are on my [Docker Hub](https://hub.docker.com/uwegerdes) account for nginx, mysql, php-fpm, mail, gulp etc. They depend on the same baseimage.

I followed the excellent explanations on [http://www.newmediacampaigns.com/blog/docker-for-php-developers](http://www.newmediacampaigns.com/blog/docker-for-php-developers) to set up the base server system, but modified the files to use cache dockers, changed scripts and paths to reflect my favorite project structure and added some nice tools for development. Perhaps you might want to extend the features with other helpful tools.

## Pros and Cons

### Isolation and Connection

The system can be set up for every frontend project you develop and maintain. Each one lives in a separate (or connected) docker container collection. The container names should be unique for each project. With docker-compose (remove the `container_name` entries) that is automated.

### Minimal OS impact

You only need Docker - the rest is running inside Docker and only valuable (project) and/or persistent data (cache, database) is stored on your disk. You should backup those files on a regular basis.

The Docker image and container files are in a special folder (/var/lib/docker on my Ubuntu 16.04 system) but you should keep you hands off of that. But there you see a subfolder `aufs` - that is how docker images and containers are layered onto each other.

The containers require much less memory and startup time than other virtualization solutions - this encourages to create a Docker container for a single task and connect it to others to do other things for a complex application.

### Flexibility

You have a different approach to your project? You may play around with my samples and create something that you like.

### Killing problems with disk space

Yes - Docker images and containers require space on your disk. If you want to play with Docker yourself make sure to have some 10GB free. But that doesn't influence the need of RAM - only the programs you need are started inside the docker container. And everything starts up in short time.

# Common failures

docker: Error response from daemon: rpc error: code = 2 desc = "oci runtime error: could not synchronise with container process: not a directory".

* Please make sure you connect `v file:directory/` or `-v directory:directory` in docker run command.
* Please make sure you are in the right directory - perhaps docker created some directories.

Changes to baseimage not affecting dependet images

* remove baseimage with `docker rmi baseimage` - perhaps you have to remove some unnamed cached images first (see `docker images`).

nginx not executing php scripts

* Make sure you replace `/etc/nginx/sites-enabled/default` or create a vhost.conf that doesn't collide with it (port / hostname).
