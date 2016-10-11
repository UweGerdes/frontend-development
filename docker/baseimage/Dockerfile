FROM ubuntu:latest
MAINTAINER entwicklung@uwegerdes.de

ARG APT_PROXY
ARG TZ=Europe/Berlin

ENV DEBIAN_FRONTEND noninteractive
ENV TZ Europe/Berlin

RUN if [ -n "${APT_PROXY}" ]; then \
		echo "Acquire::http { Proxy \"${APT_PROXY}\"; };" >> /etc/apt/apt.conf.d/01proxy; \
	fi

RUN echo 'APT::Install-Recommends 0;' >> /etc/apt/apt.conf.d/01norecommends && \
	echo 'APT::Install-Suggests 0;' >> /etc/apt/apt.conf.d/01norecommends && \
	apt-get update && \
	apt-get dist-upgrade -y && \
	apt-get install -y \
					ca-certificates \
					curl \
					gosu \
					net-tools \
					unzip \
					vim \
					wget && \
	rm -rf /var/lib/apt/lists/*

RUN echo $TZ > tz.txt
