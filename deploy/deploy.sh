#!/usr/bin/env bash
# Deploys (or updates) Paper Maths on a Debian/Ubuntu server. Run as root:
#   curl -fsSL https://raw.githubusercontent.com/Deocomate/paper-maths/main/deploy/deploy.sh | bash
# Re-running it pulls the latest code, rebuilds and restarts the service.
set -euo pipefail

APP=paper-maths
REPO=https://github.com/Deocomate/paper-maths.git
DOMAIN="${DOMAIN:-paper-maths.thceramics.admirable.site}"
PORT="${PORT:-3107}"
DIR=/opt/$APP

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y git python3 curl ca-certificates

if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 22 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

# A deterministic port: refuse to start if something else already owns it.
if ss -ltn "sport = :$PORT" | grep -q LISTEN && ! systemctl is-active --quiet "$APP"; then
  echo "Port $PORT is used by another program. Re-run with PORT=<free port>." >&2
  exit 1
fi

if [ -d "$DIR/.git" ]; then git -C "$DIR" pull --ff-only; else git clone "$REPO" "$DIR"; fi
cd "$DIR"
python3 build.py
npm ci --omit=dev

# Settings live in .env (kept on update, so the database path never changes).
if [ ! -f .env ]; then
  printf 'PORT=%s\nHOST=127.0.0.1\nDB_FILE=%s/data-store/app.db\n' "$PORT" "$DIR" > .env
fi

cat > /etc/systemd/system/$APP.service <<EOF
[Unit]
Description=Paper Maths
After=network.target

[Service]
WorkingDirectory=$DIR
EnvironmentFile=$DIR/.env
ExecStart=$(command -v node) server/index.js
Restart=always

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable "$APP"
systemctl restart "$APP"

# Reverse proxy with HTTPS: Caddy if present, otherwise nginx.
PORT_IN_USE=$(grep '^PORT=' .env | cut -d= -f2)
if command -v caddy >/dev/null; then
  if ! grep -q "$DOMAIN" /etc/caddy/Caddyfile; then
    printf '\n%s {\n\tencode gzip\n\treverse_proxy 127.0.0.1:%s\n}\n' "$DOMAIN" "$PORT_IN_USE" >> /etc/caddy/Caddyfile
  fi
  systemctl reload caddy
elif command -v nginx >/dev/null; then
  cat > /etc/nginx/conf.d/$APP.conf <<EOF
server {
  listen 80;
  server_name $DOMAIN;
  client_max_body_size 50m;
  gzip on;
  gzip_types text/html application/javascript application/json;
  location / { proxy_pass http://127.0.0.1:$PORT_IN_USE; proxy_set_header Host \$host; proxy_set_header X-Forwarded-For \$remote_addr; }
}
EOF
  nginx -t && systemctl reload nginx
  if command -v certbot >/dev/null; then certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email --redirect || true; fi
else
  echo "No Caddy or nginx found. The app listens on 127.0.0.1:$PORT_IN_USE; install a reverse proxy for $DOMAIN." >&2
fi

sleep 2
curl -fsS "http://127.0.0.1:$PORT_IN_USE/api/health" && echo && echo "Deployed: https://$DOMAIN"
