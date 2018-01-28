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

USER root

COPY package.json ${NODE_HOME}/

WORKDIR ${NODE_HOME}

RUN apt-get update && \
	apt-get dist-upgrade -y && \
	apt-get install -y \
					firefox \
					graphviz \
					imagemagick \
					php-cli \
					xvfb && \
	apt-get clean && \
	rm -rf /var/lib/apt/lists/* && \
	chown -R ${USER_NAME}:${USER_NAME} ${NODE_HOME}/package.json && \
	npm -g config set user ${USER_NAME} && \
	npm install -g \
				bower \
				casperjs \
				gulp \
				marked \
				node-gyp \
				npm-check-updates \
				phantomjs-prebuilt \
				phplint \
				varstream && \
	npm install -g git+https://github.com/laurentj/slimerjs.git && \
	export NODE_TLS_REJECT_UNAUTHORIZED=0 && \
	npm install -g ttf2woff2 && \
	npm install && \
	chown -R ${USER_NAME}:${USER_NAME} ${NODE_HOME} && \
	npm cache clean

COPY entrypoint.sh /usr/local/bin/
RUN chmod 755 /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

COPY . ${APP_HOME}

RUN chown -R ${USER_NAME}:${USER_NAME} ${APP_HOME}

WORKDIR ${APP_HOME}

USER ${USER_NAME}

VOLUME [ "${APP_HOME}" ]

EXPOSE ${GULP_LIVERELOAD} ${RESPONSIVE_CHECK_HTTP} ${COMPARE_LAYOUTS_HTTP}

CMD [ "npm", "start" ]

