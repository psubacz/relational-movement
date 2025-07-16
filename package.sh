#!/bin/bash

# Relational Movement - Package Script
# Creates a distributable zip file for FoundryVTT module installation

MODULE_NAME="relational-movement"
VERSION="0.2,1"
PACKAGE_NAME="${MODULE_NAME}-v${VERSION}.zip"

echo "📦 Packaging Relational Movement Module..."

# Create temporary directory
TEMP_DIR="./temp_package"
MODULE_DIR="${TEMP_DIR}/${MODULE_NAME}"

# Clean up any existing temp directory
rm -rf "$TEMP_DIR"
mkdir -p "$MODULE_DIR"

# Copy module files
echo "📂 Copying module files..."
cp module.json "$MODULE_DIR/"
cp -r scripts "$MODULE_DIR/"
cp -r styles "$MODULE_DIR/"
cp -r lang "$MODULE_DIR/"
cp README.md "$MODULE_DIR/"

# Create zip file
echo "🗜️  Creating zip file: $PACKAGE_NAME"
cd "$TEMP_DIR"
zip -r "../$PACKAGE_NAME" "$MODULE_NAME/"
cd ..

# Clean up temp directory
rm -rf "$TEMP_DIR"

echo "✅ Package created: $PACKAGE_NAME"
echo ""
echo "📥 Installation instructions:"
echo "1. Extract $PACKAGE_NAME to your FoundryVTT Data/modules/ directory"
echo "2. Restart FoundryVTT"
echo "3. Enable 'Relational Movement' in Module Management"
echo "4. Press Shift+M to toggle the module in-game"
echo ""
echo "🧪 For testing, you can also copy the entire directory:"
echo "   cp -r . /path/to/foundry/Data/modules/$MODULE_NAME"