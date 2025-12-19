#!/bin/bash
set -e

echo "=== Starting build process ==="

cd frontend
echo "Installing frontend dependencies..."
npm install

echo "Building Angular frontend..."
npm run build

echo "Finding Angular output..."
STATIC_DIR="../backend/src/main/resources/static"
mkdir -p "$STATIC_DIR"

if [ -f "dist/frontend/browser/index.html" ]; then
    echo "Found files in dist/frontend/browser/"
    cp -r dist/frontend/browser/* "$STATIC_DIR/"
elif [ -f "dist/frontend/index.html" ]; then
    echo "Found files in dist/frontend/"
    cp -r dist/frontend/* "$STATIC_DIR/"
else
    echo "ERROR: Could not find index.html in Angular output"
    echo "Contents of dist/frontend/:"
    ls -la dist/frontend/ 2>/dev/null || echo "dist/frontend/ does not exist"
    ls -la dist/frontend/browser/ 2>/dev/null || echo "dist/frontend/browser/ does not exist"
    exit 1
fi

echo "Static files copied to backend:"
ls -la "$STATIC_DIR/"

cd ../backend
echo "Building Spring Boot backend..."
mvn clean package -DskipTests

echo "=== Build complete ==="
