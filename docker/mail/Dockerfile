FROM uwegerdes/baseimage
MAINTAINER Uwe Gerdes <entwicklung@uwegerdes.de>

ARG USERNAME='testbox'
ARG PASSWORD='testpass'

ENV USERNAME=${USERNAME}
ENV TERM=xterm

RUN apt-get update && \
	apt-get install -y \
					alpine \
					bsd-mailx \
					dovecot-imapd \
					dovecot-lmtpd \
					dovecot-pop3d \
					postfix && \
	apt-get clean && \
	rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
	echo "root:${USERNAME}" >> /etc/aliases && \
	newaliases && \
	mkdir -p /home/${USERNAME} && \
	useradd --shell /bin/bash --home /home/${USERNAME} ${USERNAME} && \
	chown ${USERNAME}:${USERNAME} /home/${USERNAME} && \
	adduser ${USERNAME} mail && \
	echo "${USERNAME}:${PASSWORD}" | chpasswd && \
	sed -i -e 's/(lmtp\s+unix\s+-\s+-\s+)-(\s+-\s+-\s+lmtp)/$1n$2/g' /etc/postfix/master.cf

COPY dovecot/ /etc/dovecot/
COPY postfix/ /etc/postfix/
COPY pinerc /home/${USERNAME}/.pinerc
RUN chown ${USERNAME}:${USERNAME} /home/${USERNAME}/.pinerc

COPY start.sh /start.sh
RUN chmod a+x /start.sh

EXPOSE 25 110 143

CMD ["/start.sh"]
