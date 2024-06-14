#!/usr/bin/bash

# Description content to add
DESCRIPTION="© 2024 Bluesky, PBC. All rights reserved. | https://github.com/bluesky-social/atproto/blob/main/LICENSE-MIT.txt"

# Recursively find all JSON files in the specified directory and subdirectories
find "$1" -type f -name "*.json" | while read -r file; do
  # Apply the jq command to add the description key to each file and overwrite the file
  jq --arg content "$DESCRIPTION" '{ description: $content } + .' "$file" > tmp.$$.json && mv tmp.$$.json "$file"
done
