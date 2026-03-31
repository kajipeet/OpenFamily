#!/bin/sh
set -eu

mkdir -p /etc/nginx/ssl

if [ ! -f /etc/nginx/ssl/fullchain.pem ] || [ ! -f /etc/nginx/ssl/privkey.pem ]; then
  echo "[nginx] SSL certs not found, generating temporary self-signed certificate"
  openssl req -x509 -nodes -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/privkey.pem \
    -out /etc/nginx/ssl/fullchain.pem \
    -days 2 \
    -subj "/CN=localhost"
fi

exec nginx -g 'daemon off;'
