#!/bin/sh
set -eu

mkdir -p /etc/nginx/ssl
mkdir -p /var/www/certbot
mkdir -p /etc/letsencrypt

CERTBOT_DOMAIN="${CERTBOT_DOMAIN:-}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"

copy_cert_if_exists() {
  if [ -n "$CERTBOT_DOMAIN" ] && [ -f "/etc/letsencrypt/live/$CERTBOT_DOMAIN/fullchain.pem" ] && [ -f "/etc/letsencrypt/live/$CERTBOT_DOMAIN/privkey.pem" ]; then
    cp "/etc/letsencrypt/live/$CERTBOT_DOMAIN/fullchain.pem" /etc/nginx/ssl/fullchain.pem
    cp "/etc/letsencrypt/live/$CERTBOT_DOMAIN/privkey.pem" /etc/nginx/ssl/privkey.pem
    return 0
  fi
  return 1
}

if [ ! -f /etc/nginx/ssl/fullchain.pem ] || [ ! -f /etc/nginx/ssl/privkey.pem ]; then
  if ! copy_cert_if_exists; then
    echo "[nginx] SSL certs not found, generating temporary self-signed certificate"
    openssl req -x509 -nodes -newkey rsa:2048 \
      -keyout /etc/nginx/ssl/privkey.pem \
      -out /etc/nginx/ssl/fullchain.pem \
      -days 2 \
      -subj "/CN=localhost"
  fi
fi

nginx -g 'daemon off;' &
NGINX_PID="$!"

if [ -n "$CERTBOT_DOMAIN" ] && [ -n "$CERTBOT_EMAIL" ]; then
  # Always upgrade to real cert if it already exists in the volume (e.g. after
  # a container recreate where ssl/ still has a stale self-signed cert).
  if copy_cert_if_exists; then
    echo "[nginx] upgrading to existing Let's Encrypt certificate"
    nginx -s reload || true
  fi

  if [ ! -f "/etc/letsencrypt/live/$CERTBOT_DOMAIN/fullchain.pem" ]; then
    echo "[nginx] requesting initial Let's Encrypt certificate for $CERTBOT_DOMAIN"
    certbot certonly \
      --webroot -w /var/www/certbot \
      -d "$CERTBOT_DOMAIN" \
      --email "$CERTBOT_EMAIL" \
      --agree-tos --no-eff-email \
      --non-interactive || true

    if copy_cert_if_exists; then
      nginx -s reload || true
    fi
  fi

  (
    trap 'exit 0' TERM INT
    while :; do
      certbot renew --webroot -w /var/www/certbot --non-interactive || true
      if copy_cert_if_exists; then
        nginx -s reload || true
      fi
      sleep 12h
    done
  ) &
fi

wait "$NGINX_PID"
