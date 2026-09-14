#!/usr/bin/env bash
# Auto-start Tailscale on Codespace startup
# Runs via devcontainer postStartCommand (no systemd available)

set -euo pipefail

LOG=/tmp/tailscaled.log

# If tailscaled is already running, skip
if pgrep -x tailscaled > /dev/null 2>&1; then
  echo '[tailscale] tailscaled already running, skipping start.'
  sudo tailscale up --accept-routes 2>/dev/null || true
  tailscale status
  exit 0
fi

echo '[tailscale] Starting tailscaled daemon...'
sudo tailscaled   --tun=userspace-networking   --socks5-server=localhost:1055   --outbound-http-proxy-listen=localhost:1055   >> "$LOG" 2>&1 &

# Wait for socket to be ready
for i in $(seq 1 10); do
  sleep 2
  if sudo tailscale status &>/dev/null; then
    break
  fi
  echo "[tailscale] Waiting for daemon... ($i/10)"
done

echo '[tailscale] Bringing Tailscale up...'
sudo tailscale up --accept-routes

echo '[tailscale] Done!'
tailscale status
