FROM uwegerdes/baseimage
MAINTAINER Uwe Gerdes <entwicklung@uwegerdes.de>

RUN apt-get update && \
	apt-get install -y \
					software-properties-common \
					nginx && \
	apt-get clean && \
	rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY nginx.conf /etc/nginx/nginx.conf
COPY sites-enabled/default /etc/nginx/sites-enabled/default

EXPOSE 80

CMD ["/usr/sbin/nginx"]
