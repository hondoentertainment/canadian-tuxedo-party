#!/usr/bin/env python3
"""Smoke-test production pages and APIs."""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request

BASE = os.environ.get("SITE_URL", "https://canadian-tuxedo-party.vercel.app")

PAGES = [
    "/",
    "/gallery.html",
    "/vote.html",
    "/ice-breaker.html",
    "/name-that-canadian.html",
    "/poll.html",
    "/host.html",
    "/qr.html",
    "/manifest.json",
    "/assets/poster.png",
    "/assets/poster.webp",
    "/assets/poster-hero.jpg",
    "/assets/app-icon.png",
]

APIS = ["/api/status", "/api/vote", "/api/photos"]


def fetch(url: str, **kwargs) -> tuple[int, bytes]:
    req = urllib.request.Request(url, **kwargs)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status, resp.read()
    except urllib.error.HTTPError as exc:
        return exc.code, exc.read()


def main() -> int:
    failed = 0

    for path in PAGES:
        status, _ = fetch(f"{BASE}{path}")
        ok = status == 200
        print(f"{'OK' if ok else 'FAIL'} {status} {path}")
        if not ok:
            failed += 1

    for path in APIS:
        status, body = fetch(f"{BASE}{path}")
        ok = status == 200
        print(f"{'OK' if ok else 'FAIL'} {status} {path} {body[:120]!r}")
        if not ok:
            failed += 1

    status, body = fetch(
        f"{BASE}/api/poll",
        data=json.dumps({"dates": ["smoke-test"], "name": "Smoke Test"}).encode(),
        method="POST",
        headers={"Content-Type": "application/json"},
    )
    ok = status == 200 and json.loads(body).get("ok")
    print(f"{'OK' if ok else 'FAIL'} {status} POST /api/poll")
    if not ok:
        failed += 1

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
