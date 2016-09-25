FROM uwegerdes/baseimage
MAINTAINER Uwe Gerdes <entwicklung@uwegerdes.de>

ARG WWW_ROOT='/var/www/htdocs'
ARG MYSQL_DATA='/var/lib/mysql'

ENV WWW_ROOT ${WWW_ROOT}
ENV MYSQL_DATA ${MYSQL_DATA}

RUN mkdir -p ${WWW_ROOT} && \
	mkdir -p ${MYSQL_DATA}

VOLUME [ "${WWW_ROOT}", "${MYSQL_DATA}" ]

CMD [ "true" ]
#CMD [ "/bin/bash" ]
