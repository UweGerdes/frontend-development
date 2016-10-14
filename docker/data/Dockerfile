FROM uwegerdes/baseimage
MAINTAINER Uwe Gerdes <entwicklung@uwegerdes.de>

ARG WWW_ROOT='/var/www/htdocs'

ENV WWW_ROOT ${WWW_ROOT}

RUN mkdir -p ${WWW_ROOT}

VOLUME [ "${WWW_ROOT}" ]

CMD [ "true" ]
