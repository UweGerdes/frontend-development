FROM node:4
MAINTAINER Uwe Gerdes <entwicklung@uwegerdes.de>

ARG APT_PROXY='http://192.168.1.18:3142'
ARG NPM_PROXY='--proxy http://192.168.1.18:3143 --https-proxy http://192.168.1.18:3143 --strict-ssl false'
ARG NPM_LOGLEVEL='--loglevel warn'
ARG TZ='Europe/Berlin'

ENV DEBIAN_FRONTEND noninteractive
ENV NPM_HOME /usr/src/npm
ENV NODE_PATH ${NPM_HOME}/node_modules
ENV APP_DIR /usr/src/app
ENV TZ '${TZ}'

RUN if [ -n "${APT_PROXY}" ]; then echo "Acquire::http { Proxy \"${APT_PROXY}\"; };" >> /etc/apt/apt.conf.d/01proxy; fi

COPY package.json ${APP_DIR}/

RUN apt-get update && apt-get dist-upgrade -y && \
	apt-get install -y \
			graphviz \
			imagemagick \
			sudo \
			vim \
			xvfb && \
	apt-get clean && \
	rm -rf /var/lib/apt/lists/* && \
	mkdir -p ${NPM_HOME} && \
	cd ${NPM_HOME} && \
	ln -s ${APP_DIR}/package.json ./package.json && \
	npm ${NPM_LOGLEVEL} ${NPM_PROXY} install && \
	sed -i -e "s/done/then/" ${NODE_PATH}/gulp-less/index.js && \
	ln -s ${NODE_PATH}/bower/bin/bower /usr/local/bin/bower && \
	ln -s ${NODE_PATH}/gulp/bin/gulp.js /usr/local/bin/gulp && \
	ln -s ${NODE_PATH}/casperjs/bin/casperjs /usr/local/bin/casperjs && \
	ln -s ${NODE_PATH}/phantomjs-prebuilt/bin/phantomjs /usr/local/bin/phantomjs && \
	ln -s ${NODE_PATH}/slimerjs/bin/slimerjs /usr/local/bin/slimerjs && \
	useradd -s /bin/bash node && \
	adduser node sudo && \
	echo "node:node" | chpasswd && \
	chown -R node:node ${APP_DIR} && \
	chown -R node:node ${NPM_HOME}

ENV HOME ${APP_DIR}

WORKDIR ${APP_DIR}

USER node

CMD [ "bash" ]
