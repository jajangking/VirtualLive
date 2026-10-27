#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/virtuallive}"
BRANCH="arena/e041ca7d-virtuallive"

if [[ ! -d "$APP_DIR/.git" ]]; then
  echo "Not a git checkout: $APP_DIR" >&2
  exit 1
fi
actual_remote="$(git -C "$APP_DIR" remote get-url origin)"
if [[ "$actual_remote" != "https://github.com/jajangking/VirtualLive.git" && "$actual_remote" != "git@github.com:jajangking/VirtualLive.git" ]]; then
  echo "Unexpected origin: $actual_remote" >&2
  exit 1
fi

git -C "$APP_DIR" fetch --quiet origin "$BRANCH"
current="$(git -C "$APP_DIR" rev-parse HEAD)"
target="$(git -C "$APP_DIR" rev-parse FETCH_HEAD)"
if [[ "$current" == "$target" ]]; then
  exit 0
fi

# Never silently deploy a backwards or unrelated history.
if ! git -C "$APP_DIR" merge-base --is-ancestor "$current" "$target"; then
  echo "Refusing non-fast-forward deployment ($current -> $target)." >&2
  exit 1
fi

git -C "$APP_DIR" reset --hard "$target"
npm --prefix "$APP_DIR" ci --omit=dev
systemctl restart virtuallive.service
echo "Deployed $BRANCH at ${target:0:12}"
