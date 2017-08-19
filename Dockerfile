#
# Dockerfile for compare-layouts
#
# docker build -t uwegerdes/gulp-frontend .

FROM uwegerdes/nodejs

MAINTAINER Uwe Gerdes <entwicklung@uwegerdes.de>

ARG GULP_LIVERELOAD='5381'
ARG RESPONSIVE_CHECK_HTTP='5382'
ARG COMPARE_LAYOUTS_HTTP='5383'

ENV NODE_ENV development
ENV HOME ${NODE_HOME}
ENV APP_HOME ${NODE_HOME}/app
ENV GULP_LIVERELOAD ${GULP_LIVERELOAD}
ENV RESPONSIVE_CHECK_HTTP ${RESPONSIVE_CHECK_HTTP}
ENV COMPARE_LAYOUTS_HTTP ${COMPARE_LAYOUTS_HTTP}

RUN apt-get update && \
	apt-get dist-upgrade -y && \
	apt-get install -y \
					firefox \
					graphviz \
					imagemagick \
					php-cli \
					python \
					xvfb && \
	apt-get clean && \
	rm -rf /var/lib/apt/lists/*

COPY package.json ${NODE_HOME}/

RUN chown -R ${USER_NAME}:${USER_NAME} ${NODE_HOME}/package.json && \
	npm ${NPM_LOGLEVEL} ${NPM_PROXY} install -g \
				bower \
				casperjs \
				gulp \
				phantomjs-prebuilt \
				phplint \
				slimerjs && \
	sed -i -e "s/MaxVersion=5.\.\*/MaxVersion=55.*/" /usr/lib/node_modules/slimerjs/src/application.ini && \
	npm cache clean

WORKDIR ${NODE_HOME}

RUN npm ${NPM_LOGLEVEL} ${NPM_PROXY} install && \
	chown -R node:node ${NODE_HOME} && \
	npm cache clean

COPY . ${APP_HOME}

RUN chown -R ${USER_NAME}:${USER_NAME} ${APP_HOME}

WORKDIR ${APP_HOME}

USER ${USER_NAME}

VOLUME [ "${APP_HOME}" ]

EXPOSE ${GULP_LIVERELOAD} ${RESPONSIVE_CHECK_HTTP} ${COMPARE_LAYOUTS_HTTP}

CMD [ "npm", "start" ]
