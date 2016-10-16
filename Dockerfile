FROM uwegerdes/baseimage
MAINTAINER Uwe Gerdes <entwicklung@uwegerdes.de>

ARG UID='1000'
ARG GID='1000'
ARG NPM_PROXY
ARG NPM_LOGLEVEL
ARG GULP_LIVERELOAD='5381'
ARG RESPONSIVE_CHECK_HTTP='5382'

ENV DEBIAN_FRONTEND noninteractive
ENV NPM_HOME /usr/src/npm
ENV NODE_PATH ${NPM_HOME}/node_modules
ENV APP_DIR /usr/src/app
ENV NPM_PROXY ${NPM_PROXY}
ENV NPM_LOGLEVEL ${NPM_LOGLEVEL}
ENV GULP_LIVERELOAD ${GULP_LIVERELOAD}
ENV RESPONSIVE_CHECK_HTTP ${RESPONSIVE_CHECK_HTTP}

COPY package.json ${NPM_HOME}/
COPY README.md ${NPM_HOME}/

RUN apt-get update && \
	apt-get dist-upgrade -y && \
	apt-get install -y \
					bzip2 \
					firefox \
					git \
					graphviz \
					imagemagick \
					php-cli \
					python \
					sudo \
					xvfb && \
	curl -s https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add - && \
	echo 'deb http://deb.nodesource.com/node_4.x xenial main' > /etc/apt/sources.list.d/nodesource.list && \
	echo 'deb-src http://deb.nodesource.com/node_4.x xenial main' >> /etc/apt/sources.list.d/nodesource.list && \
	apt-get update && \
	apt-get install -y \
					nodejs && \
	apt-get clean && \
	rm -rf /var/lib/apt/lists/* && \
	groupadd --gid ${GID} node && \
	useradd --uid ${UID} --gid ${GID} --home-dir ${NPM_HOME} --shell /bin/bash node && \
	echo "Adding node to group sudo" && \
	adduser node sudo && \
	echo "node:node" | chpasswd && \
	echo "changing file owner for some files - please stand by" && \
	chown -R node:node /usr/local/bin && \
	chown -R node:node ${NPM_HOME} && \
	mkdir -p ${APP_DIR} && \
	chown -R node:node ${APP_DIR}

USER node

ENV HOME ${NPM_HOME}

WORKDIR ${NPM_HOME}

RUN npm ${NPM_LOGLEVEL} ${NPM_PROXY} install && \
	sed -i -e "s/done/then/" ${NODE_PATH}/gulp-less/index.js && \
	ln -s ${NODE_PATH}/bower/bin/bower /usr/local/bin/bower && \
	ln -s ${NODE_PATH}/casperjs/bin/casperjs /usr/local/bin/casperjs && \
	ln -s ${NODE_PATH}/gulp/bin/gulp.js /usr/local/bin/gulp && \
	ln -s ${NODE_PATH}/phantomjs-prebuilt/bin/phantomjs /usr/local/bin/phantomjs && \
	ln -s ${NODE_PATH}/phplint/cli.js /usr/local/bin/phplint && \
	ln -s ${NODE_PATH}/slimerjs/bin/slimerjs /usr/local/bin/slimerjs

WORKDIR ${APP_DIR}

EXPOSE ${GULP_LIVERELOAD} ${RESPONSIVE_CHECK_HTTP}

CMD [ "bash" ]
