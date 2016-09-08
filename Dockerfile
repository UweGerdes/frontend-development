# Pull base image.
FROM node:4

MAINTAINER Uwe Gerdes <entwicklung@uwegerdes.de>

ARG NPM_PROXY='--proxy http://192.168.1.18:3143 --https-proxy http://192.168.1.18:3143 --strict-ssl false'
ARG NPM_LOGLEVEL='--loglevel warn'

ENV NPM_DIR /usr/src/npm
ENV APP_DIR /usr/src/app

# install graphviz

# Install development and testing environment
RUN mkdir -p ${APP_DIR} && mkdir -p ${NPM_DIR}
WORKDIR ${APP_DIR}

COPY package.json ${APP_DIR}
RUN echo "prefix=${NPM_DIR}/npm" > ${APP_DIR}/.npmrc && \
	npm ${NPM_LOGLEVEL}  install -g phantomjs@1.9.19 && \
	npm ${NPM_LOGLEVEL} ${NPM_PROXY} install -g casperjs slimerjs gulp && \
	npm ${NPM_LOGLEVEL} ${NPM_PROXY} install -g && \
	useradd -m -s /bin/bash node && \
	chown -R node:node ${APP_DIR} && \
	chown -R node:node ${NPM_DIR}

ENV HOME ${APP_DIR}

USER node

CMD [ "gulp" ]
