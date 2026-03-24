#!/bin/bash
# Icon generation script for TABLES CMS
# Run this script to generate all required icons from a source image

SOURCE_ICON="./src-tauri/icons/icon-source.png"

# Check if source icon exists
if [ ! -f "$SOURCE_ICON" ]; then
    echo "Source icon not found at $SOURCE_ICON"
    echo "Please add a 1024x1024 PNG icon as icon-source.png"
    exit 1
fi

# Generate icons using Tauri CLI
echo "Generating icons..."
npm run tauri icon "$SOURCE_ICON"

echo "Icons generated successfully!"
