#!/usr/bin/env python3
"""Create or reuse a Panta account and store a test key locally.

The password and returned credentials stay in this process. Only the API key is
written to the git-ignored .env.local file used by the Oddsroom server.
"""

from __future__ import annotations

import getpass
import json
import os
from pathlib import Path
import sys
import urllib.error
import urllib.request


API_ROOT = "https://live-api.panta.market/api/v1"
PROJECT_ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = PROJECT_ROOT / ".env.local"


def post(path: str, payload: dict[str, object], token: str | None = None) -> dict[str, object]:
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    request = urllib.request.Request(
        f"{API_ROOT}{path}",
        data=json.dumps(payload).encode(),
        headers=headers,
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        # Do not echo upstream bodies/messages: authentication errors can contain secrets.
        raise RuntimeError(f"Panta returned HTTP {error.code}") from None


def write_env(secret: str) -> None:
    existing = []
    if ENV_FILE.exists():
        existing = [
            line
            for line in ENV_FILE.read_text().splitlines()
            if not line.startswith(("PANTA_API_KEY=", "PANTA_API_BASE_URL="))
        ]
    content = [
        *existing,
        f"PANTA_API_BASE_URL={API_ROOT}",
        f"PANTA_API_KEY={secret}",
    ]
    old_umask = os.umask(0o077)
    try:
        ENV_FILE.write_text("\n".join(filter(None, content)) + "\n")
        ENV_FILE.chmod(0o600)
    finally:
        os.umask(old_umask)


def main() -> int:
    print("Panta credential setup for Oddsroom")
    email = input("Email: ").strip()
    password = getpass.getpass("Password (input hidden): ")
    existing = input("Use an existing Panta account? [y/N]: ").strip().lower() == "y"

    if existing:
        session = post("/auth/token/", {"email": email, "password": password})
    else:
        name = input("Display name [Oddsroom]: ").strip() or "Oddsroom"
        session = post(
            "/auth/register/",
            {"email": email, "password": password, "name": name},
        )

    access = session.get("access")
    if not isinstance(access, str) or not access:
        raise RuntimeError("Panta did not return an access token")

    answer = input("Create a test API key and save it to .env.local? [Y/n]: ").strip().lower()
    if answer not in {"", "y"}:
        print("Stopped before API key creation.")
        return 0

    key = post(
        "/account/keys/",
        {"env": "test", "name": "oddsroom-local", "revokeOthers": False},
        token=access,
    )
    secret = key.get("secret")
    if not isinstance(secret, str) or not secret.startswith("pk_test_"):
        raise RuntimeError("Panta did not return a test API key")

    write_env(secret)
    print(f"Saved the test key to {ENV_FILE} with owner-only permissions.")
    print("Restart the Oddsroom development server to load it.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (RuntimeError, urllib.error.URLError) as error:
        print(f"Setup failed: {error}", file=sys.stderr)
        raise SystemExit(1)
