set -euo pipefail
APP=paper-maths; DOMAIN=paper-maths.thceramics.admirable.site; PORT=3060; DIR=/opt/$APP
export PATH=/opt/node22/bin:$PATH
ss -ltn | grep -q ":$PORT " && { echo "port $PORT busy"; exit 1; }
id $APP >/dev/null 2>&1 || useradd --system --home-dir $DIR --shell /sbin/nologin $APP
mkdir -p $DIR /etc/$APP && tar xzf /tmp/pm.tgz -C $DIR && rm /tmp/pm.tgz
cd $DIR && npm ci --omit=dev 2>&1 | tail -2
[ -f /etc/$APP/environment ] || printf 'PORT=%s\nHOST=127.0.0.1\nDB_FILE=%s/data-store/app.db\n' $PORT $DIR > /etc/$APP/environment
mkdir -p $DIR/data-store && chown -R $APP:$APP $DIR/data-store
cat > /etc/systemd/system/$APP.service <<UNIT
[Unit]
Description=Paper Maths (Node, Express, SQLite)
After=network.target

[Service]
Type=simple
User=$APP
Group=$APP
WorkingDirectory=$DIR
EnvironmentFile=/etc/$APP/environment
ExecStart=/opt/node22/bin/node --disable-warning=ExperimentalWarning server/index.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload && systemctl enable $APP >/dev/null 2>&1 && systemctl restart $APP
sleep 2; curl -fsS http://127.0.0.1:$PORT/api/health; echo
# HTTP-only vhost so acme.sh can validate
cat > /etc/nginx/conf.d/$DOMAIN.conf <<NG
server {
	listen 80;
	server_name $DOMAIN;
	location /.well-known/acme-challenge/ { root /var/www/acme; }
	location / { return 301 https://$DOMAIN\$request_uri; }
}
NG
nginx -t && systemctl reload nginx
/root/.acme.sh/acme.sh --issue -d $DOMAIN -w /var/www/acme --keylength ec-256 2>&1 | tail -4
/root/.acme.sh/acme.sh --install-cert -d $DOMAIN --ecc --fullchain-file /etc/nginx/ssl/$DOMAIN.crt --key-file /etc/nginx/ssl/$DOMAIN.key --reloadcmd "systemctl reload nginx" 2>&1 | tail -2
chmod 600 /etc/nginx/ssl/$DOMAIN.key
cat >> /etc/nginx/conf.d/$DOMAIN.conf <<NG

server {
	listen 443 ssl;
	server_name $DOMAIN;
	access_log /var/log/nginx/$DOMAIN.access.log;
	error_log /var/log/nginx/$DOMAIN.error.log;
	ssl_certificate /etc/nginx/ssl/$DOMAIN.crt;
	ssl_certificate_key /etc/nginx/ssl/$DOMAIN.key;
	ssl_protocols TLSv1.2;
	ssl_prefer_server_ciphers on;
	add_header Strict-Transport-Security "max-age=31536000" always;
	client_max_body_size 50m;
	gzip on;
	gzip_types text/html application/javascript application/json;
	location / {
		proxy_pass http://127.0.0.1:$PORT;
		proxy_http_version 1.1;
		proxy_set_header Host \$host;
		proxy_set_header X-Real-IP \$remote_addr;
		proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto \$scheme;
		proxy_read_timeout 60s;
	}
}
NG
nginx -t && systemctl reload nginx && echo NGINX-OK
