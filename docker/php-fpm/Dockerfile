FROM uwegerdes/baseimage
MAINTAINER Uwe Gerdes <entwicklung@uwegerdes.de>

RUN apt-get update && \
	apt-get install -y \
					php5-fpm \
					php5-mysql && \
	rm -rf /var/lib/apt/lists/* && \
	sed 's/;daemonize = yes/daemonize = no/' -i /etc/php5/fpm/php-fpm.conf && \
	sed 's/;cgi.fix_pathinfo=1/cgi.fix_pathinfo = 0/' -i /etc/php5/fpm/php.ini && \
	ln -sf /dev/stdout /var/log/php-fpm.log && \
	ln -sf /dev/stderr /var/log/php-fpm.err

COPY www.conf /etc/php5/fpm/pool.d/www.conf

VOLUME [ "/var/run", "/var/log" ]

EXPOSE 9000

CMD ["/usr/sbin/php5-fpm"]
