#!/bin/bash

# Find all media files in public directory
MEDIA_FILES=$(find public -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.svg" -o -iname "*.mp4" -o -iname "*.webm" -o -iname "*.gif" \))

echo "Found $(echo "$MEDIA_FILES" | wc -l) media files in public directory."
echo "Checking for unused files..."

UNUSED_FILES=()

for FILE in $MEDIA_FILES; do
  # Get the filename (e.g., logo.png)
  BASENAME=$(basename "$FILE")
  
  # Search for the filename in the src and public directory (for manifest.json, etc)
  # Also search in the root folder for config files
  if ! grep -q -r "$BASENAME" src public *.ts *.js *.json 2>/dev/null; then
    UNUSED_FILES+=("$FILE")
  fi
done

if [ ${#UNUSED_FILES[@]} -eq 0 ]; then
  echo "No unused media files found!"
else
  echo "Unused files found:"
  for f in "${UNUSED_FILES[@]}"; do
    echo "$f"
  done
fi
