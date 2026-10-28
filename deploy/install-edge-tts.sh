#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/virtuallive}"
PYTHON_BIN="${PYTHON_BIN:-python3}"
VENV_DIR="$APP_DIR/.venv-edge-tts"

if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
  echo "Python 3 is required for Edge TTS. Install python3 and python3-venv, then retry." >&2
  exit 1
fi
if ! "$PYTHON_BIN" -m venv "$VENV_DIR"; then
  echo "Could not create the Edge TTS Python environment. On Debian/Ubuntu install python3-venv, then retry." >&2
  exit 1
fi
"$VENV_DIR/bin/python" -m pip install --disable-pip-version-check --no-cache-dir -r "$APP_DIR/requirements-edge-tts.txt"
