"""設定・CSVの読み込み。"""

from __future__ import annotations

import csv
from pathlib import Path
from typing import Any, Optional

import yaml

from .models import VideoMetrics

ROOT = Path(__file__).resolve().parents[1]
CONFIG_DIR = ROOT / "config"


def load_yaml(name: str) -> dict[str, Any]:
    path = CONFIG_DIR / name
    with path.open(encoding="utf-8") as f:
        data = yaml.safe_load(f)
    return data or {}


def load_benchmarks() -> dict[str, Any]:
    return load_yaml("benchmarks.yaml")


def load_channels() -> dict[str, Any]:
    return load_yaml("channels.yaml")["channels"]


def load_advice_templates() -> dict[str, Any]:
    return load_yaml("advice_templates.yaml")


def _to_float(value: Any) -> Optional[float]:
    if value is None:
        return None
    text = str(value).strip()
    if text == "" or text.lower() in {"na", "n/a", "-", "none", "null"}:
        return None
    text = text.replace("%", "").replace(",", "")
    return float(text)


def _to_str(value: Any) -> Optional[str]:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


FIELD_MAP = {
    "channel_id": "channel_id",
    "video_id": "video_id",
    "title": "title",
    "duration_sec": "duration_sec",
    "chose_to_watch_pct": "chose_to_watch_pct",
    "swiped_away_pct": "swiped_away_pct",
    "avg_view_duration_sec": "avg_view_duration_sec",
    "avg_view_pct": "avg_view_pct",
    "likes": "likes",
    "comments": "comments",
    "shares": "shares",
    "views": "views",
    "shorts_feed_impressions": "shorts_feed_impressions",
    "subscribers_net": "subscribers_net",
    "retention_max_drop_sec": "retention_max_drop_sec",
    "current_hook_text": "current_hook_text",
    "current_hook_ja": "current_hook_ja",
    "published_at": "published_at",
    "notes": "notes",
    # 日本語ヘッダー別名
    "チャンネルID": "channel_id",
    "動画ID": "video_id",
    "タイトル": "title",
    "動画尺": "duration_sec",
    "視聴を選んだ割合": "chose_to_watch_pct",
    "スワイプされた割合": "swiped_away_pct",
    "平均視聴時間": "avg_view_duration_sec",
    "平均視聴率": "avg_view_pct",
    "いいね数": "likes",
    "コメント数": "comments",
    "シェア数": "shares",
    "再生数": "views",
    "Shortsフィード表示数": "shorts_feed_impressions",
    "登録者増減": "subscribers_net",
    "維持率の最大下落秒数": "retention_max_drop_sec",
    "現在の冒頭文": "current_hook_text",
    "現在の冒頭文_日本語": "current_hook_ja",
    "公開日": "published_at",
    "メモ": "notes",
}


def row_to_metrics(row: dict[str, Any]) -> VideoMetrics:
    normalized: dict[str, Any] = {}
    for key, value in row.items():
        if key is None:
            continue
        mapped = FIELD_MAP.get(str(key).strip())
        if mapped:
            normalized[mapped] = value

    float_fields = [
        "duration_sec",
        "chose_to_watch_pct",
        "swiped_away_pct",
        "avg_view_duration_sec",
        "avg_view_pct",
        "likes",
        "comments",
        "shares",
        "views",
        "shorts_feed_impressions",
        "subscribers_net",
        "retention_max_drop_sec",
    ]
    kwargs: dict[str, Any] = {
        "channel_id": _to_str(normalized.get("channel_id")) or "",
        "video_id": _to_str(normalized.get("video_id")) or "",
        "title": _to_str(normalized.get("title")) or "",
        "current_hook_text": _to_str(normalized.get("current_hook_text")),
        "current_hook_ja": _to_str(normalized.get("current_hook_ja")),
        "published_at": _to_str(normalized.get("published_at")),
        "notes": _to_str(normalized.get("notes")),
    }
    for name in float_fields:
        kwargs[name] = _to_float(normalized.get(name))

    # 視聴選択率が無くスワイプ率だけある場合は補完
    if kwargs["chose_to_watch_pct"] is None and kwargs["swiped_away_pct"] is not None:
        kwargs["chose_to_watch_pct"] = 100.0 - kwargs["swiped_away_pct"]
    if kwargs["swiped_away_pct"] is None and kwargs["chose_to_watch_pct"] is not None:
        kwargs["swiped_away_pct"] = 100.0 - kwargs["chose_to_watch_pct"]

    return VideoMetrics(**kwargs)


def load_metrics_csv(path: Path | str) -> list[VideoMetrics]:
    path = Path(path)
    with path.open(encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        return [row_to_metrics(row) for row in reader]
