#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/virtuallive}"
REPO_URL="https://github.com/jajangking/VirtualLive.git"
BRANCH="arena/e041ca7d-virtuallive"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run with sudo: sudo bash deploy/deploy-vps.sh" >&2
  exit 1
fi
if ! command -v git >/dev/null 2>&1; then
  echo "Git is required. Install it first." >&2
  exit 1
fi

if [[ ! -d "$APP_DIR/.git" ]]; then
  if [[ -d "$APP_DIR" ]] && [[ -n "$(find "$APP_DIR" -mindepth 1 -maxdepth 1 -print -quit)" ]]; then
    echo "$APP_DIR exists but is not a Git checkout and is not empty; refusing to overwrite it." >&2
    exit 1
  fi
  rmdir "$APP_DIR" 2>/dev/null || true
  echo "No Git checkout found; cloning $BRANCH into $APP_DIR."
  git clone --single-branch --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
fi

actual_remote="$(git -C "$APP_DIR" remote get-url origin)"
if [[ "$actual_remote" != "$REPO_URL" && "$actual_remote" != "git@github.com:jajangking/VirtualLive.git" ]]; then
  echo "$APP_DIR has another origin ($actual_remote); refusing to deploy it." >&2
  exit 1
fi

if [[ ! -f /etc/systemd/system/virtuallive.service ]]; then
  echo "VirtualLive service is not installed; running the full installer."
  exec bash "$APP_DIR/deploy/instabox-setup.sh"
fi

exec bash "$APP_DIR/deploy/update-from-branch.sh"
