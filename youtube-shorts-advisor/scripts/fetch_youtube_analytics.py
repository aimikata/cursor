#!/usr/bin/env python3
"""YouTube Analytics API 取得スケルトン。

この環境には OAuth 認証情報が無いため、実行には事前セットアップが必要です。
取得できない「視聴を選んだ割合」は CSV の手動列として残してください。

セットアップ概要:
1. Google Cloud で YouTube Analytics API / Data API を有効化
2. OAuth クライアント JSON を GOOGLE_CLIENT_SECRETS に配置
3. 初回実行でブラウザ認証（または既に取得済みトークンを利用）
4. 出力CSVを data/ に保存し、chose_to_watch_pct を Studio から追記
"""

from __future__ import annotations

import argparse
import csv
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main() -> int:
    parser = argparse.ArgumentParser(description="Fetch YouTube analytics into CSV (skeleton).")
    parser.add_argument("--channel-id", required=True, help="YouTube channel ID (UC...)")
    parser.add_argument(
        "--out",
        type=Path,
        default=ROOT / "data" / "api_metrics.csv",
        help="Output CSV path",
    )
    parser.add_argument(
        "--start-date",
        default="2026-01-01",
        help="Analytics start date YYYY-MM-DD",
    )
    parser.add_argument(
        "--end-date",
        default="2026-07-16",
        help="Analytics end date YYYY-MM-DD",
    )
    args = parser.parse_args()

    if not os.environ.get("GOOGLE_CLIENT_SECRETS") and not (
        ROOT / "secrets" / "client_secrets.json"
    ).exists():
        print(
            "認証ファイルがありません。\n"
            "DATA_ACQUISITION.md の手順Bを完了するか、当面は Studio 手動CSVを使ってください。\n"
            f"手動テンプレ: {ROOT / 'schema' / 'metrics_template.csv'}",
            file=sys.stderr,
        )
        return 2

    try:
        from googleapiclient.discovery import build  # type: ignore
        from google_auth_oauthlib.flow import InstalledAppFlow  # type: ignore
    except ImportError:
        print(
            "google-api-python-client / google-auth-oauthlib が未インストールです。\n"
            "pip install -r requirements-api.txt",
            file=sys.stderr,
        )
        return 2

    # ここから先は認証情報が揃った環境でのみ実装を有効化する。
    # いまは「何を取るか」を固定し、未認証では落とす。
    _ = build
    _ = InstalledAppFlow

    fields = [
        "channel_id",
        "video_id",
        "title",
        "duration_sec",
        "views",
        "avg_view_duration_sec",
        "avg_view_pct",
        "likes",
        "comments",
        "shares",
        "subscribers_net",
        "chose_to_watch_pct",  # Studio手動
        "swiped_away_pct",  # Studio手動
        "shorts_feed_impressions",
        "retention_max_drop_sec",
        "current_hook_text",
        "current_hook_ja",
        "published_at",
        "notes",
    ]

    args.out.parent.mkdir(parents=True, exist_ok=True)
    with args.out.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerow(
            {
                "channel_id": args.channel_id,
                "notes": (
                    f"API取得スケルトン。期間 {args.start_date}〜{args.end_date}。"
                    "chose_to_watch_pct は Studio から追記すること。"
                ),
            }
        )

    print(
        "スケルトンCSVを書きました。"
        f" OAuth実装を有効化したうえで再実行し、Studio指標を追記してください: {args.out}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
