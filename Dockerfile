# Pull base image.
FROM node:4

MAINTAINER Uwe Gerdes <entwicklung@uwegerdes.de>

ARG APT_PROXY='http://192.168.1.18:3142'
ARG NPM_PROXY='--proxy http://192.168.1.18:3143 --https-proxy http://192.168.1.18:3143 --strict-ssl false'
ARG NPM_LOGLEVEL='--loglevel warn'
ARG TZ='Europe/Berlin'

ENV DEBIAN_FRONTEND noninteractive
ENV NPM_PATH /usr/src/npm
ENV NODE_PATH ${NPM_PATH}/node_modules
ENV APP_DIR /usr/src/app
ENV TZ '${TZ}'

RUN if [ -n "${APT_PROXY}" ]; then echo "Acquire::http { Proxy \"${APT_PROXY}\"; };" >> /etc/apt/apt.conf.d/01proxy; fi

RUN apt-get update && \
	apt-get dist-upgrade -y && \
	apt-get install -y sudo vim imagemagick graphviz && \
	apt-get clean && \
	rm -rf /var/lib/apt/lists/*

RUN mkdir -p ${APP_DIR} && mkdir -p ${NPM_PATH}
COPY package.json ${APP_DIR}
RUN cd ${NPM_PATH} && \
	ln -s ${APP_DIR}/package.json ./package.json && \
	npm ${NPM_LOGLEVEL} ${NPM_PROXY} install && \
	ln -s ${NODE_PATH}/gulp/bin/gulp.js /usr/local/bin/gulp && \
	ln -s ${NODE_PATH}/casperjs/bin/casperjs /usr/local/bin/casperjs && \
	ln -s ${NODE_PATH}/phantomjs-prebuilt/bin/phantomjs /usr/local/bin/phantomjs && \
	ln -s ${NODE_PATH}/slimerjs/bin/slimerjs /usr/local/bin/slimerjs && \
	useradd -m -s /bin/bash node && \
	chown -R node:node ${APP_DIR} && \
	chown -R node:node ${NPM_PATH}
COPY gulpfile.js ${APP_DIR}

ENV HOME ${APP_DIR}
WORKDIR ${APP_DIR}

USER node

CMD [ "bash" ]
