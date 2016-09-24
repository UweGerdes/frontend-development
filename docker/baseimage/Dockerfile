FROM ubuntu:trusty
MAINTAINER entwicklung@uwegerdes.de

RUN echo 'Acquire::http { Proxy "http://172.17.0.1:3142"; };' >> /etc/apt/apt.conf.d/01proxy && \
    echo 'APT::Install-Recommends 0;' >> /etc/apt/apt.conf.d/01norecommends && \
    echo 'APT::Install-Suggests 0;' >> /etc/apt/apt.conf.d/01norecommends && \
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y ca-certificates curl net-tools sudo unzip vim wget && \
    rm -rf /var/lib/apt/lists/*
