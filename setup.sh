#!/bin/bash
# Reads .env and generates wrangler.toml from wrangler.toml.example

set -e

if [ ! -f .env ]; then
  echo "Error: .env file not found. Copy .env.example and fill in your values."
  exit 1
fi

export $(grep -v '^#' .env | xargs)
envsubst < wrangler.toml.example > wrangler.toml
echo "wrangler.toml generated successfully."
