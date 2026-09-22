#!/usr/bin/env bash
# Chạy một lệnh với máy chủ phát triển đang lên, rồi dọn sạch.
#
# Vì sao cần: một phép đo đòi máy chủ mà không có cách tự dựng nó thì không
# phải một phép đo — nó là một điều kiện ngầm, và lượt nghiệm thu đầu tiên đã
# bị chặn đúng vì thế. Bọc điều kiện vào chính lệnh đo thì lệnh ấy chạy được ở
# bất cứ đâu, hoặc nói rõ vì sao không.
#
# Dùng: scripts/with-dev-server.sh <lệnh> [tham số...]
# Biến: PORT (mặc định 3002) · DEV_SERVER_TIMEOUT_S (mặc định 180)
set -uo pipefail

PORT="${PORT:-3002}"
BASE_URL="http://localhost:${PORT}"
TIMEOUT="${DEV_SERVER_TIMEOUT_S:-180}"
LOG="$(mktemp -t dev-server.XXXXXX.log)"
STARTED_BY_US=0

cleanup() {
  if [ "$STARTED_BY_US" = "1" ] && [ -n "${SERVER_PID:-}" ]; then
    # Hạ cả cây tiến trình: next dev đẻ con, giết mỗi cha thì cổng vẫn bị giữ.
    kill -- "-${SERVER_PID}" 2>/dev/null || kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  rm -f "$LOG"
}
trap cleanup EXIT INT TERM

ready() { curl -fsS -o /dev/null --max-time 2 "${BASE_URL}/api/health" 2>/dev/null || curl -fsS -o /dev/null --max-time 2 "$BASE_URL" 2>/dev/null; }

if ready; then
  echo "with-dev-server: đã có máy chủ tại ${BASE_URL} — dùng lại, không dựng thêm." >&2
else
  echo "with-dev-server: dựng máy chủ tại ${BASE_URL} (nhật ký: $LOG)" >&2
  # Cùng cờ với dev_server.start của hồ sơ nghiệm thu.
  set -m
  PORT="$PORT" \
  NEXT_PUBLIC_MAIC_EDITOR_ENABLED=true \
  NEXT_PUBLIC_PI_CHAT_ENABLED=true \
  NEXT_PUBLIC_COURSEWARE_REFERENCE_ENABLED=true \
  NEXT_PUBLIC_PERSISTENCE=1 \
    pnpm dev >"$LOG" 2>&1 &
  SERVER_PID=$!
  set +m
  STARTED_BY_US=1

  waited=0
  until ready; do
    if ! kill -0 "$SERVER_PID" 2>/dev/null; then
      echo "with-dev-server: máy chủ chết khi khởi động. Hai mươi dòng cuối:" >&2
      tail -20 "$LOG" >&2
      exit 2
    fi
    if [ "$waited" -ge "$TIMEOUT" ]; then
      echo "with-dev-server: máy chủ không lên sau ${TIMEOUT}s. Hai mươi dòng cuối:" >&2
      tail -20 "$LOG" >&2
      exit 2
    fi
    sleep 2
    waited=$((waited + 2))
  done
  echo "with-dev-server: máy chủ sẵn sàng sau ${waited}s." >&2
fi

OPENMAIC_BASE_URL="$BASE_URL" "$@"
