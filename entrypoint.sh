#!/bin/bash

if [ ! -d "${APP_HOME}/bower_components" ]; then
	echo "initial loading frontend dependencies"
	bower install
fi

if [ ! -f "${APP_HOME}/htdocs/css/bootstrap.css" ]; then
	echo "initial building frontend-development"
	gulp build
fi

if [ ! -f "${APP_HOME}/htdocs/css/fonts/iconfont.ttf" ]; then
	echo "initial building iconfont"
	gulp iconfont
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
