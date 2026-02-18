#!/bin/bash
set -e

echo "=== Starting build process ==="

WORKSPACE="/home/runner/workspace"

echo "Installing frontend dependencies..."
cd "$WORKSPACE/frontend"
npm install

echo "Building Angular frontend..."
npx ng build --configuration production

echo "Finding Angular output..."
STATIC_DIR="$WORKSPACE/backend/src/main/resources/static"
rm -rf "$STATIC_DIR"
mkdir -p "$STATIC_DIR"

BUILD_DIR="$WORKSPACE/frontend/dist/frontend/browser"
if [ ! -f "$BUILD_DIR/index.html" ]; then
    BUILD_DIR="$WORKSPACE/frontend/dist/frontend"
fi

if [ -f "$BUILD_DIR/index.html" ]; then
    echo "Found build output in $BUILD_DIR"
    cp -r "$BUILD_DIR"/* "$STATIC_DIR/"
else
    echo "ERROR: Angular build output not found"
    echo "Searching for index.html..."
    find "$WORKSPACE/frontend/dist" -name "index.html" 2>/dev/null || echo "No index.html found"
    exit 1
fi

echo "Static files copied to backend:"
ls -la "$STATIC_DIR/"

cd "$WORKSPACE/backend"
echo "Building Spring Boot backend..."
mvn clean package -DskipTests

echo "=== Build complete ==="
