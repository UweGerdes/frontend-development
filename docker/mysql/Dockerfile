FROM uwegerdes/baseimage
MAINTAINER Uwe Gerdes <entwicklung@uwegerdes.de>

ENV MYSQL_USER=mysql
ENV MYSQL_DATA_DIR=/var/lib/mysql
ENV MYSQL_RUN_DIR=/run/mysqld
ENV MYSQL_LOG_DIR=/var/log/mysql

RUN apt-get update && \
	apt-get install -y \
					mysql-server && \
	rm -rf ${MYSQL_DATA_DIR} && \
	rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
	ln -sf /dev/stderr ${MYSQL_LOG_DIR}/error.log

COPY entrypoint.sh /sbin/entrypoint.sh
RUN chmod 755 /sbin/entrypoint.sh

EXPOSE 3306/tcp

VOLUME [ "${MYSQL_DATA_DIR}", "${MYSQL_RUN_DIR}" ]

ENTRYPOINT ["/sbin/entrypoint.sh"]

CMD ["/usr/bin/mysqld_safe"]
