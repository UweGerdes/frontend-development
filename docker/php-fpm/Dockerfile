FROM uwegerdes/baseimage
MAINTAINER Uwe Gerdes <entwicklung@uwegerdes.de>

RUN apt-get update && \
	apt-get install -y \
					php-fpm \
					php-mysql && \
	rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
	sed 's/;daemonize = yes/daemonize = no/' -i /etc/php/7.0/fpm/php-fpm.conf && \
	mkdir -p /run/php

COPY www.conf /etc/php/7.0/fpm/pool.d/www.conf

VOLUME [ "/run/php" ]

EXPOSE 9000

CMD ["/usr/sbin/php-fpm7.0"]
