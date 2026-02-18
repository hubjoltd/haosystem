#!/bin/bash
set -e

echo "Starting Spring Boot backend on port 8080..."
cd /home/runner/workspace/backend
java -jar target/erp-backend-1.0.0.jar --server.port=8080 &
BACKEND_PID=$!

echo "Waiting for backend to be ready..."
for i in $(seq 1 60); do
  if curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
    echo "Backend is ready!"
    break
  fi
  sleep 2
done

echo "Starting Angular frontend on port 5000..."
cd /home/runner/workspace/frontend
npx ng serve --host 0.0.0.0 --port 5000 --configuration development --proxy-config proxy.conf.json --live-reload false --hmr false

wait $BACKEND_PID
