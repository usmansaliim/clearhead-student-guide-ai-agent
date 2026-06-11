import threading
import time
import json
import os
from datetime import datetime

CACHE_DIR = os.path.join(os.path.dirname(__file__), "cache")
os.makedirs(CACHE_DIR, exist_ok=True)

class BackgroundRefresher:
    """
    Runs background jobs to keep community knowledge fresh.
    Every 6 hours, refreshes the most common topic caches.
    """
    def __init__(self):
        self.running = False
        self.thread = None
        self.refresh_interval = 6 * 60 * 60  # 6 hours in seconds
        self.common_topics = [
            "gpa recovery probation",
            "attendance xf grade",
            "internship career",
            "mental health stress",
            "summer semester strategy",
            "first semester survival",
            "seecs student life",
            "hostel life nust",
        ]

    def _refresh_job(self):
        """Background job that refreshes caches."""
        from realtime.community_fetcher import get_community_advice
        while self.running:
            print(f"[ClearHead] Background refresh started at {datetime.now().strftime('%H:%M')}")
            for topic in self.common_topics:
                try:
                    get_community_advice(topic)
                    time.sleep(2)  # Don't hammer APIs
                except Exception as e:
                    print(f"[ClearHead] Refresh error for '{topic}': {e}")

            # Save last refresh time
            with open(os.path.join(CACHE_DIR, "last_refresh.json"), "w") as f:
                json.dump({"last_refresh": datetime.now().isoformat()}, f)

            print(f"[ClearHead] Background refresh complete.")
            time.sleep(self.refresh_interval)

    def start(self):
        if not self.running:
            self.running = True
            self.thread = threading.Thread(target=self._refresh_job, daemon=True)
            self.thread.start()
            print("[ClearHead] Background knowledge refresher started.")

    def stop(self):
        self.running = False

# Global instance
refresher = BackgroundRefresher()