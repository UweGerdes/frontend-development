#!/bin/bash

# fix for installation failures on nodejs 8.11.1 (perhaps proxy problem)
export PATH=$PATH:/home/node/bin
if ! [ -x "$(command -v phantomjs)" ]; then
	echo "initial install phantomjs"
	cd "${NODE_HOME}"
	export NODE_TLS_REJECT_UNAUTHORIZED=0
	npm install phantomjs-prebuilt
	mkdir -p /home/node/bin/
	cp /home/node/node_modules/phantomjs-prebuilt/lib/phantom/bin/phantomjs /home/node/bin/
	cd "${APP_HOME}"
fi

if [ ! -w "${APP_HOME}/" ]; then
	echo "ERROR: ${APP_HOME}/ cannot write"
	exit 1
fi

if [ ! -d "${APP_HOME}/bower_components" ]; then
	echo "initial loading frontend dependencies"
	bower install
fi

if [ ! -f "${APP_HOME}/htdocs/css/fonts/iconfont.ttf" ]; then
	echo "initial building iconfont"
	gulp iconfont
fi

if [ ! -f "${APP_HOME}/htdocs/css/bootstrap.css" ]; then
	echo "initial building frontend-development"
	gulp build
fi

if [ -d "${APP_HOME}/tests/compare-layouts" -a ! -f "${APP_HOME}/tests/compare-layouts/css/app.css" ]; then
	echo "initial building tests/compare-layouts"
	cd "${APP_HOME}/tests/compare-layouts/"
	gulp build
fi

if [ -d "${APP_HOME}/tests/responsive-check" -a ! -f "${APP_HOME}/tests/responsive-check/css/app.css" ]; then
	echo "initial building tests/responsive-check"
	cd "${APP_HOME}/tests/responsive-check/"
	gulp build
fi

cd "${APP_HOME}"
exec "$@"
