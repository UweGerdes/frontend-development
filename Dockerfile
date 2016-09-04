# Pull base image.
FROM node:4

MAINTAINER Uwe Gerdes <entwicklung@uwegerdes.de>

# apt-cacher-ng docker on 172.17.0.x
RUN echo 'Acquire::http { Proxy "http://192.168.1.18:3142"; };' >> /etc/apt/apt.conf.d/01proxy

# Global install gulp (w/o npm set progress=false && npm install --global --progress=false npm-cache)
RUN npm --proxy http://192.168.1.18:3143 --https-proxy http://192.168.1.18:3143 --strict-ssl false install --global gulp

# Install these for the testing environment used by test-forms
RUN npm --loglevel warn install -g phantomjs@1.9.19
RUN npm --loglevel warn --proxy http://192.168.1.18:3143 --https-proxy http://192.168.1.18:3143 --strict-ssl false install -g casperjs slimerjs

# Cleanup image
RUN apt-get -y autoremove && \
	apt-get -y clean && \
	rm -rf /var/lib/apt/lists/* /var/cache/* /tmp/* /var/tmp/*

ENV APP_DIR /usr/src/app
RUN mkdir -p ${APP_DIR}
WORKDIR ${APP_DIR}

COPY package.json ${APP_DIR}
RUN npm --proxy http://192.168.1.18:3143 --https-proxy http://192.168.1.18:3143 --strict-ssl false install
COPY gulpfile.js ${APP_DIR}

RUN useradd -m -s /bin/bash node
RUN chown -R node:node ${APP_DIR}
ENV HOME ${APP_DIR}
USER node

CMD [ "gulp" ]
