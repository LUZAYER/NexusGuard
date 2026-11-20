#!/usr/bin/env bash
# ==============================================================================
# NEXUSGUARD: Autonomous Financial Crime Intelligence & AML Defense Platform
# Target Event: CloudCamp Bangladesh — AI Builders Congress 2026 (Fintech Track)
# Operations Up Script (Starts Backend & Frontend)
# ==============================================================================

set -e

# Project root directory
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

RUN_DIR="$ROOT_DIR/.run"
mkdir -p "$RUN_DIR"

BACKEND_PID_FILE="$RUN_DIR/backend.pid"
FRONTEND_PID_FILE="$RUN_DIR/frontend.pid"
FRONTEND_PORT_FILE="$RUN_DIR/frontend.port"
BACKEND_PORT_FILE="$RUN_DIR/backend.port"
BACKEND_LOG="$RUN_DIR/backend.log"
FRONTEND_LOG="$RUN_DIR/frontend.log"

# Colors
BOLD="\033[1m"
GREEN="\033[0;32m"
CYAN="\033[0;36m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
PURPLE="\033[0;35m"
NC="\033[0m" # No Color

print_banner() {
  echo -e "${CYAN}${BOLD}"
  cat << 'BANNER_EOF'
  _   _ _______  ___   _ ____   ____ _   _    _    ____  ____  
 | \ | | ____\ \/ / | | / ___| / ___| | | |  / \  |  _ \|  _ \ 
 |  \| |  _|  \  /| | | \___ \| |  _| | | | / _ \ | |_) | | | |
 | |\  | |___ /  \| |_| |___) | |_| | |_| |/ ___ \|  _ <| |_| |
 |_| \_|_____/_/\_\\___/|____/ \____|\___//_/   \_\_| \_\____/ 
BANNER_EOF
  echo -e "${PURPLE}   Autonomous Financial Crime Intelligence & Real-Time AML Defense Platform${NC}"
  echo -e "${BOLD}   CloudCamp Bangladesh — AI Builders Congress 2026 • Fintech Track${NC}"
  echo -e "${YELLOW}   Philosophy: ML Assesses. Graphs Connect. AI Investigates. Humans Decide.${NC}\n"
}

# Determine available ports
detect_ports() {
  BACKEND_PORT="${BACKEND_PORT:-8000}"
  
  # Check if frontend port was manually specified
  if [ -n "$FRONTEND_PORT" ]; then
    FE_PORT="$FRONTEND_PORT"
  elif [ -n "$PORT" ]; then
    FE_PORT="$PORT"
  else
    # Auto-detect: Test if 3000 can be bound, else fallback to 3001
    if python3 -c "import socket; s = socket.socket(); s.bind(('127.0.0.1', 3000)); s.close()" 2>/dev/null; then
      FE_PORT=3000
    else
      FE_PORT=3001
    fi
  fi

  echo "$FE_PORT" > "$FRONTEND_PORT_FILE"
  echo "$BACKEND_PORT" > "$BACKEND_PORT_FILE"
}

cleanup_existing() {
  echo -e "${YELLOW}[*] Preparing ports (Backend: $BACKEND_PORT, Frontend: $FE_PORT)...${NC}"
  
  if [ -f "$BACKEND_PID_FILE" ]; then
    PID=$(cat "$BACKEND_PID_FILE" 2>/dev/null || true)
    if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
      kill "$PID" 2>/dev/null || true
    fi
    rm -f "$BACKEND_PID_FILE"
  fi

  if [ -f "$FRONTEND_PID_FILE" ]; then
    PID=$(cat "$FRONTEND_PID_FILE" 2>/dev/null || true)
    if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
      kill "$PID" 2>/dev/null || true
    fi
    rm -f "$FRONTEND_PID_FILE"
  fi

  fuser -k "${BACKEND_PORT}/tcp" 2>/dev/null || true
  fuser -k "${FE_PORT}/tcp" 2>/dev/null || true
  sleep 1
}

check_prerequisites() {
  echo -e "${CYAN}[*] Verifying runtime prerequisites...${NC}"

  # 1. Environment file
  if [ ! -f "$ROOT_DIR/.env" ]; then
    if [ -f "$ROOT_DIR/.env.example" ]; then
      cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
    else
      touch "$ROOT_DIR/.env"
    fi
  fi

  # 2. Python environment
  if [ -f "$ROOT_DIR/.venv/bin/python" ]; then
    PYTHON_BIN="$ROOT_DIR/.venv/bin/python"
  elif [ -f "/home/luzayer/AI/SentinelFlow/.venv/bin/python" ]; then
    PYTHON_BIN="/home/luzayer/AI/SentinelFlow/.venv/bin/python"
  else
    PYTHON_BIN="python3"
  fi
  echo -e "${GREEN}[✓] Python runtime:${NC} $($PYTHON_BIN --version 2>&1)"

  # 3. Node.js & npm
  if command -v node >/dev/null 2>&1; then
    echo -e "${GREEN}[✓] Node.js runtime:${NC} $(node --version)"
  else
    echo -e "${RED}[✗] Node.js is required but not installed.${NC}"
    exit 1
  fi
}

start_backend() {
  echo -e "${CYAN}[*] Starting NEXUSGUARD FastAPI Backend on port ${BACKEND_PORT}...${NC}"
  cd "$ROOT_DIR"
  
  setsid "$PYTHON_BIN" -m uvicorn backend.main:app --host 0.0.0.0 --port "$BACKEND_PORT" > "$BACKEND_LOG" 2>&1 &
  BACKEND_PID=$!
  disown $BACKEND_PID 2>/dev/null || true
  echo "$BACKEND_PID" > "$BACKEND_PID_FILE"
  echo -e "${GREEN}[✓] Backend launched (PID: $BACKEND_PID). Waiting for health check...${NC}"

  MAX_TRIES=20
  TRIES=0
  BACKEND_READY=false

  while [ $TRIES -lt $MAX_TRIES ]; do
    if curl -s "http://127.0.0.1:${BACKEND_PORT}/docs" >/dev/null 2>&1 || curl -s "http://127.0.0.1:${BACKEND_PORT}/api/v1/system/health" >/dev/null 2>&1; then
      BACKEND_READY=true
      break
    fi
    if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
      echo -e "${RED}[✗] Backend process exited unexpectedly. Log snippet:${NC}"
      tail -n 20 "$BACKEND_LOG"
      exit 1
    fi
    sleep 1
    TRIES=$((TRIES + 1))
  done

  if [ "$BACKEND_READY" = true ]; then
    echo -e "${GREEN}[✓] FastAPI Backend is healthy on http://localhost:${BACKEND_PORT}${NC}"
  else
    echo -e "${YELLOW}[!] Backend started (check logs at $BACKEND_LOG)${NC}"
  fi
}

start_frontend() {
  echo -e "${CYAN}[*] Starting NEXUSGUARD Next.js Frontend on port ${FE_PORT}...${NC}"
  cd "$ROOT_DIR/frontend"

  if [ -d "$ROOT_DIR/frontend/.next" ] && [ "$1" != "--dev" ]; then
    echo -e "${PURPLE}[*] Running optimized production server (next start -p $FE_PORT)...${NC}"
    setsid node "$ROOT_DIR/frontend/node_modules/.bin/next" start -p "$FE_PORT" > "$FRONTEND_LOG" 2>&1 &
  else
    echo -e "${PURPLE}[*] Running development server (next dev -p $FE_PORT)...${NC}"
    setsid node "$ROOT_DIR/frontend/node_modules/.bin/next" dev -p "$FE_PORT" > "$FRONTEND_LOG" 2>&1 &
  fi

  FRONTEND_PID=$!
  disown $FRONTEND_PID 2>/dev/null || true
  echo "$FRONTEND_PID" > "$FRONTEND_PID_FILE"
  echo -e "${GREEN}[✓] Frontend launched (PID: $FRONTEND_PID). Waiting for ready state...${NC}"

  MAX_TRIES=30
  TRIES=0
  FRONTEND_READY=false

  while [ $TRIES -lt $MAX_TRIES ]; do
    if curl -s "http://127.0.0.1:${FE_PORT}" >/dev/null 2>&1; then
      FRONTEND_READY=true
      break
    fi
    if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
      echo -e "${RED}[✗] Frontend process exited unexpectedly. Log snippet:${NC}"
      tail -n 20 "$FRONTEND_LOG"
      exit 1
    fi
    sleep 1
    TRIES=$((TRIES + 1))
  done

  if [ "$FRONTEND_READY" = true ]; then
    echo -e "${GREEN}[✓] Next.js Frontend is live on http://localhost:${FE_PORT}${NC}"
  else
    echo -e "${YELLOW}[!] Frontend started (check logs at $FRONTEND_LOG)${NC}"
  fi
}

print_summary() {
  echo -e "\n${BOLD}${GREEN}========================================================================${NC}"
  echo -e "${BOLD}${GREEN}      🎉 NEXUSGUARD PLATFORM IS FULLY OPERATIONAL AND READY!          ${NC}"
  echo -e "${BOLD}${GREEN}========================================================================${NC}\n"

  echo -e "${BOLD}🌐 ACCESS URLS:${NC}"
  echo -e "   ${CYAN}• 3D Interactive Landing Page:${NC}   http://localhost:${FE_PORT}"
  echo -e "   ${CYAN}• Executive SOC Dashboard:${NC}       http://localhost:${FE_PORT}/dashboard"
  echo -e "   ${CYAN}• Congress Form Assistant (110pts):${NC}http://localhost:${FE_PORT}/docs/submission-form"
  echo -e "   ${CYAN}• Live System Whitepaper /docs:${NC}   http://localhost:${FE_PORT}/docs"
  echo -e "   ${CYAN}• Real-Time Transaction Radar:${NC}    http://localhost:${FE_PORT}/monitoring/transactions"
  echo -e "   ${CYAN}• Behavioral Biometrics (ATO):${NC}    http://localhost:${FE_PORT}/monitoring/walletguard"
  echo -e "   ${CYAN}• Graph Mule Syndicate Forensics:${NC} http://localhost:${FE_PORT}/intelligence/network"
  echo -e "   ${CYAN}• No-Code Rule Engine (Shadow):${NC}   http://localhost:${FE_PORT}/governance"
  echo -e "   ${CYAN}• Autonomous AI Cases & SAR Gen:${NC}  http://localhost:${FE_PORT}/investigations/cases"
  echo -e "   ${CYAN}• Backend OpenAPI Swagger Docs:${NC}    http://localhost:${BACKEND_PORT}/docs"

  echo -e "\n${BOLD}📁 OPERATIONS & LOGS:${NC}"
  echo -e "   • Backend Log:   ${PURPLE}tail -f $BACKEND_LOG${NC}"
  echo -e "   • Frontend Log:  ${PURPLE}tail -f $FRONTEND_LOG${NC}"
  echo -e "   • Stop Platform: ${YELLOW}./down.sh${NC}\n"
}

# Main execution
print_banner
detect_ports
cleanup_existing
check_prerequisites
start_backend
start_frontend "$@"
print_summary
