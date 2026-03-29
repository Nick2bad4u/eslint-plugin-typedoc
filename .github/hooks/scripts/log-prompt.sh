#!/bin/bash
set -euo pipefail

INPUT="$(cat)"

if [[ -z "${INPUT//[[:space:]]/}" ]]; then
    echo "Failure: No input provided via stdin." >&2
    exit 1
fi

if ! command -v jq > /dev/null 2>&1; then
    echo "Failure: jq is required for log-prompt.sh." >&2
    exit 1
fi

resolve_timestamp_ms() {
    local raw_timestamp="$1"

    if [[ -z "$raw_timestamp" ]]; then
        date +%s%3N
        return 0
    fi

    if [[ "$raw_timestamp" =~ ^[0-9]+$ ]]; then
        printf '%s\n' "$raw_timestamp"
        return 0
    fi

    local parsed_timestamp
    parsed_timestamp="$(date -u -d "$raw_timestamp" +%s%3N 2> /dev/null || true)"

    if [[ -z "$parsed_timestamp" ]]; then
        echo "Failure: Unsupported timestamp format in hook payload: $raw_timestamp" >&2
        return 1
    fi

    printf '%s\n' "$parsed_timestamp"
}

RAW_TIMESTAMP="$(echo "$INPUT" | jq -r '.timestamp // empty')"
TIMESTAMP_MS="$(resolve_timestamp_ms "$RAW_TIMESTAMP")"
PROMPT="$(echo "$INPUT" | jq -r '.prompt // empty')"
HOOK_EVENT_NAME="$(echo "$INPUT" | jq -r '.hook_event_name // empty')"
SESSION_ID="$(echo "$INPUT" | jq -r '.session_id // empty')"
TRANSCRIPT_PATH="$(echo "$INPUT" | jq -r '.transcript_path // empty')"

if [[ -z "$PROMPT" ]]; then
    echo "Failure: Expected the hook payload to include a non-empty prompt." >&2
    exit 1
fi

REDACTED_PROMPT="$(printf '%s' "$PROMPT" | sed -E 's/ghp_[A-Za-z0-9]{20,}/[REDACTED_TOKEN]/g')"
HOSTNAME_VALUE="$(hostname 2> /dev/null || true)"
USERNAME_VALUE="${USER:-${USERNAME:-}}"
TIMESTAMP_ISO="$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")"

LOG_DIR=".github/hooks/logs"
mkdir -p "$LOG_DIR"
chmod 700 "$LOG_DIR"

jq -cn \
    --arg sessionid "$SESSION_ID" \
    --arg timestamp "$TIMESTAMP_ISO" \
    --argjson timestampms "$TIMESTAMP_MS" \
    --arg username "$USERNAME_VALUE" \
    --arg hostname "$HOSTNAME_VALUE" \
    --arg shellversion "$BASH_VERSION" \
    --arg event "userPromptSubmitted" \
    --arg hookeventname "$HOOK_EVENT_NAME" \
    --arg transcript "$TRANSCRIPT_PATH" \
    --arg prompt "$REDACTED_PROMPT" \
    '{
            sessionid: $sessionid,
            timestamp: $timestamp,
            timestampms: $timestampms,
            username: $username,
            hostname: $hostname,
            shellversion: $shellversion,
            event: $event,
            hookeventname: $hookeventname,
            transcript: $transcript,
      prompt: $prompt,
    }' \
    >> "$LOG_DIR/audit.jsonl"

echo "Prompt log: Success"
exit 0
