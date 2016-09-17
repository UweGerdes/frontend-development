FROM node:4
MAINTAINER Uwe Gerdes <entwicklung@uwegerdes.de>

ARG APT_PROXY
ARG NPM_PROXY
ARG NPM_LOGLEVEL
ARG TZ='Europe/Berlin'
ARG UID='1000'
ARG GID='1000'
ARG HTTP_PORT='5382'

ENV DEBIAN_FRONTEND noninteractive
ENV NPM_HOME /usr/src/npm
ENV NODE_PATH ${NPM_HOME}/node_modules
ENV APP_DIR /usr/src/app
ENV NPM_PROXY ${NPM_PROXY}
ENV NPM_LOGLEVEL ${NPM_LOGLEVEL}
ENV TZ ${TZ}
ENV HTTP_PORT ${HTTP_PORT}

RUN if [ -n "${APT_PROXY}" ]; then echo "Acquire::http { Proxy \"${APT_PROXY}\"; };" >> /etc/apt/apt.conf.d/01proxy; fi

COPY package.json ${APP_DIR}/

RUN apt-get update && apt-get dist-upgrade -y && \
	apt-get install -y \
			graphviz \
			iceweasel \
			sudo \
			vim \
			xvfb && \
	apt-get clean && \
	rm -rf /var/lib/apt/lists/* && \
	mkdir -p ${NPM_HOME} && \
	groupadd --gid ${GID} node && \
	useradd --uid ${UID} --gid ${GID} -s /bin/bash node && \
	adduser node sudo && \
	echo "node:node" | chpasswd && \
	chown -R node:node ${APP_DIR} && \
	chown -R node:node ${NPM_HOME}

ENV HOME ${NPM_HOME}

WORKDIR ${APP_DIR}

USER node

RUN cd ${NPM_HOME} && \
	ln -s ${APP_DIR}/package.json ./package.json && \
	npm ${NPM_LOGLEVEL} ${NPM_PROXY} install && \
	sed -i -e "s/done/then/" ${NODE_PATH}/gulp-less/index.js && \
	ln -s ${NODE_PATH}/bower/bin/bower /usr/local/bin/bower && \
	ln -s ${NODE_PATH}/gulp/bin/gulp.js /usr/local/bin/gulp && \
	ln -s ${NODE_PATH}/casperjs/bin/casperjs /usr/local/bin/casperjs && \
	ln -s ${NODE_PATH}/phantomjs-prebuilt/bin/phantomjs /usr/local/bin/phantomjs && \
	ln -s ${NODE_PATH}/slimerjs/bin/slimerjs /usr/local/bin/slimerjs

EXPOSE ${HTTP_PORT}

CMD [ "bash" ]
