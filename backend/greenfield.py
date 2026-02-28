"""
FlashGap AI — Execution Logging

Saves JSON execution proofs to local files.
Falls back gracefully — never blocks the main agent loop.
"""

import json
import os
import datetime

LOG_DIR = os.path.join(os.path.dirname(__file__), "logs")
os.makedirs(LOG_DIR, exist_ok=True)


def upload_log(log_data: dict) -> str:
    """
    Save a JSON execution log to local storage.
    Returns the file path.
    """
    timestamp = datetime.datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"flashgap_{timestamp}.json"
    payload = json.dumps(log_data, indent=2, default=str)

    try:
        local_path = os.path.join(LOG_DIR, filename)
        with open(local_path, "w") as f:
            f.write(payload)
        return local_path
    except Exception as e:
        print(f"   ⚠️  Log save failed: {e}")
        return "save_failed"


def get_recent_logs(limit: int = 20) -> list[dict]:
    """Read recent execution logs from local storage."""
    logs = []
    if not os.path.exists(LOG_DIR):
        return logs

    files = sorted(os.listdir(LOG_DIR), reverse=True)[:limit]
    for fname in files:
        try:
            with open(os.path.join(LOG_DIR, fname)) as f:
                logs.append(json.load(f))
        except Exception:
            continue
    return logs

def get_total_logs_count() -> int:
    """Return the total number of logs stored."""
    if not os.path.exists(LOG_DIR):
        return 0
    return len(os.listdir(LOG_DIR))
