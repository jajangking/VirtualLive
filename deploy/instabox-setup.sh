#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/virtuallive"
REPO_URL="https://github.com/jajangking/VirtualLive.git"
BRANCH="arena/e041ca7d-virtuallive"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run with sudo: sudo bash deploy/instabox-setup.sh" >&2
  exit 1
fi
if ! command -v git >/dev/null 2>&1; then
  echo "Git is required. Install it first (for Debian/Ubuntu: apt-get install git)." >&2
  exit 1
fi
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 22+ and npm are required. Install Node.js first, then rerun this setup." >&2
  exit 1
fi
node_major="$(node -p 'Number(process.versions.node.split(".")[0])')"
if (( node_major < 22 )); then
  echo "Node.js 22+ required; found $(node --version)." >&2
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required to install the TikTok LIVE connector dependency." >&2
  exit 1
fi
if ! command -v systemctl >/dev/null 2>&1; then
  echo "This setup expects a systemd-based VPS." >&2
  exit 1
fi

if [[ -e "$APP_DIR" ]]; then
  if [[ ! -d "$APP_DIR/.git" ]]; then
    echo "$APP_DIR already exists and is not a Git checkout; refusing to overwrite it." >&2
    exit 1
  fi
  actual_remote="$(git -C "$APP_DIR" remote get-url origin)"
  if [[ "$actual_remote" != "$REPO_URL" && "$actual_remote" != "git@github.com:jajangking/VirtualLive.git" ]]; then
    echo "$APP_DIR has another origin ($actual_remote); refusing to replace it." >&2
    exit 1
  fi
  git -C "$APP_DIR" fetch origin "$BRANCH"
  git -C "$APP_DIR" checkout -B "$BRANCH" FETCH_HEAD
else
  git clone --single-branch --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
fi

npm --prefix "$APP_DIR" ci --omit=dev
APP_DIR="$APP_DIR" bash "$APP_DIR/deploy/install-edge-tts.sh"

node_bin="$(command -v node)"
sed "s|@NODE_BIN@|$node_bin|g" "$APP_DIR/deploy/virtuallive.service" > /etc/systemd/system/virtuallive.service
install -m 0644 "$APP_DIR/deploy/virtuallive-update.service" /etc/systemd/system/virtuallive-update.service
install -m 0644 "$APP_DIR/deploy/virtuallive-update.timer" /etc/systemd/system/virtuallive-update.timer
chmod 0755 "$APP_DIR/deploy/update-from-branch.sh"

systemctl daemon-reload
systemctl enable virtuallive.service
systemctl restart virtuallive.service
systemctl enable --now virtuallive-update.timer

echo "VirtualLive is installed. Check with: systemctl status virtuallive.service"
echo "Automatic branch checks: systemctl status virtuallive-update.timer"
echo "If port 3000 is already occupied, stop the old service and rerun this setup."
