FROM uwegerdes/baseimage
MAINTAINER Uwe Gerdes <entwicklung@uwegerdes.de>

ARG MYSQL_ROOT_PASSWORD=123456

ENV MYSQL_USER=mysql
ENV MYSQL_DATA_DIR=/var/lib/mysql
ENV MYSQL_RUN_DIR=/run/mysqld
ENV MYSQL_LOG_DIR=/var/log/mysql
ENV MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}

RUN { \
		echo mysql-community-server mysql-community-server/data-dir select ''; \
		echo mysql-community-server mysql-community-server/root-pass password ''; \
		echo mysql-community-server mysql-community-server/re-root-pass password ''; \
		echo mysql-community-server mysql-community-server/remove-test-db select false; \
	} | debconf-set-selections && \
	apt-get update && \
	apt-get install -y \
					mysql-server && \
	rm -rf ${MYSQL_DATA_DIR} && \
	rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
	rm -rf /var/lib/mysql && \
	mkdir -p /var/lib/mysql /var/run/mysqld && \
	chown -R mysql:mysql /var/lib/mysql /var/run/mysqld && \
	chmod 777 /var/run/mysqld && \
	sed -Ei 's/^(bind-address|log)/#&/' /etc/mysql/mysql.conf.d/mysqld.cnf && \
	echo 'skip-host-cache\nskip-name-resolve' | awk '{ print } $1 == "[mysqld]" && c == 0 { c = 1; system("cat") }' /etc/mysql/mysql.conf.d/mysqld.cnf > /tmp/mysqld.cnf && \
	mv /tmp/mysqld.cnf /etc/mysql/mysql.conf.d/mysqld.cnf

COPY entrypoint.sh /usr/local/bin/
RUN chmod 755 /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

COPY init_database.sql /entrypoint-initdb.d/

EXPOSE 3306

VOLUME [ "${MYSQL_DATA_DIR}", "${MYSQL_RUN_DIR}" ]

CMD ["mysqld"]
