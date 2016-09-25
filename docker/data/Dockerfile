FROM uwegerdes/baseimage
MAINTAINER Uwe Gerdes <entwicklung@uwegerdes.de>

ARG WWW_ROOT='/var/www/htdocs'
ARG MYSQL_DATA_DIR='/var/lib/mysql'

ENV WWW_ROOT ${WWW_ROOT}
ENV MYSQL_DATA_DIR ${MYSQL_DATA_DIR}

RUN mkdir -p ${WWW_ROOT} && \
	mkdir -p ${MYSQL_DATA_DIR}

VOLUME [ "${WWW_ROOT}", "${MYSQL_DATA_DIR}" ]

CMD [ "true" ]
#CMD [ "/bin/bash" ]
