#
# Dockerfile for frontend-development
#
# docker build -t uwegerdes/frontend-development .

FROM uwegerdes/nodejs

MAINTAINER Uwe Gerdes <entwicklung@uwegerdes.de>

ARG DISPLAY=':0.0'
ARG GULP_LIVERELOAD='8081'
ARG RESPONSIVE_CHECK_HTTP='8082'
ARG COMPARE_LAYOUTS_HTTP='8083'

ENV GULP_LIVERELOAD ${GULP_LIVERELOAD}
ENV RESPONSIVE_CHECK_HTTP ${RESPONSIVE_CHECK_HTTP}
ENV COMPARE_LAYOUTS_HTTP ${COMPARE_LAYOUTS_HTTP}

USER root

COPY package.json ${NODE_HOME}/

WORKDIR ${NODE_HOME}

RUN apt-get update && \
	apt-get dist-upgrade -y && \
	apt-get install -y \
					graphviz \
					imagemagick \
					php-cli \
					software-properties-common \
					xvfb && \
	add-apt-repository -y ppa:mozillateam/ppa && \
	apt-get update && \
	apt-get install -y firefox-esr && \
	apt-get clean && \
	rm -rf /var/lib/apt/lists/* && \
	npm install -g \
				casperjs \
				gulp \
				marked \
				node-gyp \
				phplint && \
	npm install -g git+https://github.com/laurentj/slimerjs.git#v0.10 && \
	export NODE_TLS_REJECT_UNAUTHORIZED=0 && \
	npm install && \
	chown -R ${USER_NAME}:${USER_NAME} ${NODE_HOME}

ENV SLIMERJSLAUNCHER '/usr/bin/firefox-esr'

COPY build/entrypoint.sh /usr/local/bin/
RUN chmod 755 /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

COPY . ${APP_HOME}

RUN chown -R ${USER_NAME}:${USER_NAME} ${APP_HOME}

WORKDIR ${APP_HOME}

USER ${USER_NAME}

VOLUME [ "${APP_HOME}" ]

EXPOSE ${GULP_LIVERELOAD} ${RESPONSIVE_CHECK_HTTP} ${COMPARE_LAYOUTS_HTTP}

CMD [ "npm", "start" ]
