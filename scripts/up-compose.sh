#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f ".env" ]]; then
  if [[ -f ".env.example" ]]; then
    cp .env.example .env
    echo "[openfamily] .env created from .env.example"
  else
    echo "[openfamily] ERROR: .env.example not found" >&2
    exit 1
  fi
fi

mkdir -p nginx/ssl

echo "[openfamily] starting docker compose stack..."
if docker compose version >/dev/null 2>&1; then
  docker compose up -d --build
elif command -v docker-compose >/dev/null 2>&1; then
  docker-compose up -d --build
else
  echo "[openfamily] ERROR: docker compose (or docker-compose) is not available" >&2
  exit 1
fi

echo "[openfamily] stack is up"
