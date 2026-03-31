FROM nginx:1.25-alpine
RUN apk add --no-cache openssl certbot
COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh && mkdir -p /etc/nginx/ssl
ENTRYPOINT ["/entrypoint.sh"]
