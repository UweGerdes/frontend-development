# Pull base image.
FROM node:4

MAINTAINER Uwe Gerdes <entwicklung@uwegerdes.de>

ARG NPM_PROXY='--proxy http://192.168.1.18:3143 --https-proxy http://192.168.1.18:3143 --strict-ssl false'
ARG NPM_LOGLEVEL='--loglevel warn'
ENV APP_DIR /usr/src/app

# Install developement and testing environment
RUN npm ${NPM_LOGLEVEL}  install -g phantomjs@1.9.19
RUN npm ${NPM_LOGLEVEL} ${NPM_PROXY} install -g casperjs slimerjs gulp

RUN mkdir -p ${APP_DIR}
WORKDIR ${APP_DIR}

COPY package.json ${APP_DIR}
RUN npm ${NPM_LOGLEVEL} ${NPM_PROXY} install
COPY gulpfile.js ${APP_DIR}

RUN useradd -m -s /bin/bash node
RUN chown -R node:node ${APP_DIR}
ENV HOME ${APP_DIR}
USER node

CMD [ "gulp" ]
