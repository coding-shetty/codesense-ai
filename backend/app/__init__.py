# Initialize backend package modules cleanly
from app.db.base import init_db

try:
    print("[CodeSense Core] Launching sqlite engine table initializations...")
    init_db()
except Exception as e:
    print(f"[CodeSense DB Warning] Automatic lifecycle migration skip parameter hit: {e}")