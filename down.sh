#!/usr/bin/env bash
# ==============================================================================
# NEXUSGUARD: Autonomous Financial Crime Intelligence & AML Defense Platform
# Operations Down Script (Gracefully stops Backend & Frontend)
# ==============================================================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

RUN_DIR="$ROOT_DIR/.run"
BACKEND_PID_FILE="$RUN_DIR/backend.pid"
FRONTEND_PID_FILE="$RUN_DIR/frontend.pid"
FRONTEND_PORT_FILE="$RUN_DIR/frontend.port"
BACKEND_PORT_FILE="$RUN_DIR/backend.port"

BOLD="\033[1m"
GREEN="\033[0;32m"
CYAN="\033[0;36m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m"

echo -e "${YELLOW}${BOLD}[*] Initiating NEXUSGUARD shutdown sequence...${NC}"

FE_PORT="3001"
if [ -f "$FRONTEND_PORT_FILE" ]; then
  FE_PORT=$(cat "$FRONTEND_PORT_FILE" 2>/dev/null || echo "3001")
fi

BE_PORT="8000"
if [ -f "$BACKEND_PORT_FILE" ]; then
  BE_PORT=$(cat "$BACKEND_PORT_FILE" 2>/dev/null || echo "8000")
fi

# 1. Stop Backend
if [ -f "$BACKEND_PID_FILE" ]; then
  BACKEND_PID=$(cat "$BACKEND_PID_FILE" 2>/dev/null || true)
  if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo -e "${CYAN}[*] Stopping Backend service (PID: $BACKEND_PID)...${NC}"
    kill "$BACKEND_PID" 2>/dev/null || true
    
    for i in {1..5}; do
      if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
        break
      fi
      sleep 1
    done
    
    if kill -0 "$BACKEND_PID" 2>/dev/null; then
      kill -9 "$BACKEND_PID" 2>/dev/null || true
    fi
    echo -e "${GREEN}[✓] Backend stopped.${NC}"
  fi
  rm -f "$BACKEND_PID_FILE"
fi

# 2. Stop Frontend
if [ -f "$FRONTEND_PID_FILE" ]; then
  FRONTEND_PID=$(cat "$FRONTEND_PID_FILE" 2>/dev/null || true)
  if [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    echo -e "${CYAN}[*] Stopping Frontend service (PID: $FRONTEND_PID)...${NC}"
    kill "$FRONTEND_PID" 2>/dev/null || true
    
    for i in {1..5}; do
      if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
        break
      fi
      sleep 1
    done

    if kill -0 "$FRONTEND_PID" 2>/dev/null; then
      kill -9 "$FRONTEND_PID" 2>/dev/null || true
    fi
    echo -e "${GREEN}[✓] Frontend stopped.${NC}"
  fi
  rm -f "$FRONTEND_PID_FILE"
fi

# 3. Clean up ports
echo -e "${CYAN}[*] Ensuring ports $BE_PORT and $FE_PORT are released...${NC}"
fuser -k "${BE_PORT}/tcp" 2>/dev/null || true
fuser -k "${FE_PORT}/tcp" 2>/dev/null || true

rm -f "$FRONTEND_PORT_FILE" "$BACKEND_PORT_FILE"

echo -e "\n${BOLD}${GREEN}[✓] NEXUSGUARD platform has been completely stopped.${NC}\n"
