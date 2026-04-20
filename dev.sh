#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/invoice-backend"
FRONTEND_DIR="$ROOT_DIR/invoice-frontend"
RUN_DIR="$ROOT_DIR/.run"

BACKEND_PID_FILE="$RUN_DIR/backend.pid"
FRONTEND_PID_FILE="$RUN_DIR/frontend.pid"
BACKEND_LOG="$RUN_DIR/backend.log"
FRONTEND_LOG="$RUN_DIR/frontend.log"

mkdir -p "$RUN_DIR"

is_running() {
  local pid_file="$1"
  if [[ -f "$pid_file" ]]; then
    local pid
    pid="$(cat "$pid_file")"
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      return 0
    fi
  fi
  return 1
}

wait_for_port() {
  local port="$1"
  local name="$2"
  local retries=25

  for _ in $(seq 1 "$retries"); do
    if (echo > "/dev/tcp/127.0.0.1/$port") >/dev/null 2>&1; then
      echo "$name is up on port $port"
      return 0
    fi
    sleep 1
  done

  echo "Warning: $name did not open port $port yet. Check logs."
  return 1
}

start_backend() {
  if is_running "$BACKEND_PID_FILE"; then
    echo "Backend already running (PID $(cat "$BACKEND_PID_FILE"))."
    return 0
  fi

  echo "Starting backend..."
  (
    cd "$BACKEND_DIR"
    ./mvnw spring-boot:run
  ) >"$BACKEND_LOG" 2>&1 &

  echo "$!" > "$BACKEND_PID_FILE"
  wait_for_port 8080 "Backend" || true
}

start_frontend() {
  if is_running "$FRONTEND_PID_FILE"; then
    echo "Frontend already running (PID $(cat "$FRONTEND_PID_FILE"))."
    return 0
  fi

  echo "Starting frontend..."
  (
    cd "$FRONTEND_DIR"
    npm run dev -- --host
  ) >"$FRONTEND_LOG" 2>&1 &

  echo "$!" > "$FRONTEND_PID_FILE"
  wait_for_port 5173 "Frontend" || true
}

stop_process() {
  local pid_file="$1"
  local name="$2"

  if is_running "$pid_file"; then
    local pid
    pid="$(cat "$pid_file")"
    echo "Stopping $name (PID $pid)..."
    kill "$pid" 2>/dev/null || true
    sleep 1
    if kill -0 "$pid" 2>/dev/null; then
      kill -9 "$pid" 2>/dev/null || true
    fi
  else
    echo "$name is not running."
  fi

  rm -f "$pid_file"
}

show_status() {
  if is_running "$BACKEND_PID_FILE"; then
    echo "Backend: running (PID $(cat "$BACKEND_PID_FILE"))"
  else
    echo "Backend: stopped"
  fi

  if is_running "$FRONTEND_PID_FILE"; then
    echo "Frontend: running (PID $(cat "$FRONTEND_PID_FILE"))"
  else
    echo "Frontend: stopped"
  fi

  echo "Logs:"
  echo "  Backend  -> $BACKEND_LOG"
  echo "  Frontend -> $FRONTEND_LOG"
}

show_logs() {
  echo "===== Backend (last 40 lines) ====="
  if [[ -f "$BACKEND_LOG" ]]; then
    tail -n 40 "$BACKEND_LOG"
  else
    echo "No backend log yet."
  fi

  echo
  echo "===== Frontend (last 40 lines) ====="
  if [[ -f "$FRONTEND_LOG" ]]; then
    tail -n 40 "$FRONTEND_LOG"
  else
    echo "No frontend log yet."
  fi
}

usage() {
  cat <<EOF
Usage: ./dev.sh <command>

Commands:
  start    Start backend and frontend
  stop     Stop backend and frontend
  restart  Restart backend and frontend
  status   Show running status
  logs     Show recent logs
EOF
}

cmd="${1:-start}"

case "$cmd" in
  start)
    start_backend
    start_frontend
    echo
    echo "App URLs:"
    echo "  Frontend: http://localhost:5173"
    echo "  Backend : http://localhost:8080"
    ;;
  stop)
    stop_process "$BACKEND_PID_FILE" "Backend"
    stop_process "$FRONTEND_PID_FILE" "Frontend"
    ;;
  restart)
    stop_process "$BACKEND_PID_FILE" "Backend"
    stop_process "$FRONTEND_PID_FILE" "Frontend"
    start_backend
    start_frontend
    echo
    echo "App URLs:"
    echo "  Frontend: http://localhost:5173"
    echo "  Backend : http://localhost:8080"
    ;;
  status)
    show_status
    ;;
  logs)
    show_logs
    ;;
  *)
    usage
    exit 1
    ;;
esac
