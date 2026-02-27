"""
FlashGap AI — Greenfield / IPFS Logging

Uploads JSON execution proofs to BNB Greenfield (or falls back to
local file logging for hackathon demos).
"""

import json
import os
import datetime
import requests

from config import GREENFIELD_RPC, GREENFIELD_BUCKET

LOG_DIR = os.path.join(os.path.dirname(__file__), "logs")
os.makedirs(LOG_DIR, exist_ok=True)


def upload_log(log_data: dict) -> str:
    """
    Attempt to upload a JSON execution log to BNB Greenfield.
    Falls back to local file storage if Greenfield is unreachable.
    Returns the storage reference (URL or local path).
    """
    timestamp = datetime.datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"flashgap_{timestamp}.json"
    payload = json.dumps(log_data, indent=2)

    # ── Try Greenfield upload ───────────────────────────
    try:
        # NOTE: In production, this would use the Greenfield SDK with proper
        # authentication. For the hackathon MVP, we simulate the upload.
        url = f"{GREENFIELD_RPC}/greenfield/storage/v1/{GREENFIELD_BUCKET}/{filename}"
        print(f"   📤 Uploading log to Greenfield: {url}")

        # Simulated upload — replace with actual Greenfield SDK call
        # resp = requests.put(url, data=payload, headers={"Content-Type": "application/json"})
        # if resp.status_code in (200, 201):
        #     print(f"   ✅ Greenfield upload OK: {resp.json()}")
        #     return url

        # Fallback: save locally
        raise ConnectionError("Greenfield SDK not configured — using local fallback")

    except Exception as e:
        print(f"   ⚠️  Greenfield unavailable ({e}), saving locally.")
        local_path = os.path.join(LOG_DIR, filename)
        with open(local_path, "w") as f:
            f.write(payload)
        print(f"   💾 Saved to {local_path}")
        return local_path


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
