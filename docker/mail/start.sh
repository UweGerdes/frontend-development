#!/bin/bash

# Run dovecot
/usr/sbin/dovecot -c /etc/dovecot/dovecot.conf
# Run postfix
/usr/sbin/postfix start
# keep container alive
sleep infinity
