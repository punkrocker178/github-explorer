#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

#pm2 delete 0
#pm2 start "$SCRIPT_DIR/server.js"
cd "$SCRIPT_DIR"
nohup node server.js > /tmp/server.log 2>&1 &