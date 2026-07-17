"""チャンネル登録・最稼働チャンネル判定。"""

from __future__ import annotations

from typing import Any, Optional

from .loaders import load_yaml


def load_registry() -> dict[str, Any]:
    return load_yaml("channel_registry.yaml")


def list_registry_channels() -> list[dict[str, Any]]:
    data = load_registry()
    return list(data.get("channels") or [])


def resolve_channel_id(
    *,
    channel_id: Optional[str] = None,
    display_name: Optional[str] = None,
    youtube_channel_id: Optional[str] = None,
) -> Optional[str]:
    """各種表記から診断用 channel_id を返す。"""
    channels = list_registry_channels()
    if channel_id:
        # 完全一致を最優先（alias より先）
        for ch in channels:
            if ch["channel_id"] == channel_id:
                return ch["channel_id"]
        for ch in channels:
            if channel_id in (ch.get("aliases") or []):
                return ch["channel_id"]

    if youtube_channel_id:
        # 同一YT IDが複数ある場合は priority が小さい方
        matches = [
            ch for ch in channels if ch.get("youtube_channel_id") == youtube_channel_id
        ]
        if matches:
            matches.sort(key=lambda c: c.get("priority", 99))
            return matches[0]["channel_id"]

    if display_name:
        lowered = display_name.strip().lower()
        for ch in channels:
            if ch["display_name"].lower() == lowered:
                return ch["channel_id"]
            if lowered.replace(" ", "_") == ch["channel_id"]:
                return ch["channel_id"]
        if lowered in {"insight manga", "insight_manga"}:
            return "insight_manga"

    return channel_id


def most_active_channel_id() -> str:
    """設定上の最優先（今いちばん動かすべき）チャンネル。"""
    channels = sorted(list_registry_channels(), key=lambda c: c.get("priority", 99))
    return channels[0]["channel_id"]


def sheet_youtube_ids_to_enable() -> list[str]:
    data = load_registry()
    return list(data.get("sheet_channels_to_enable") or [])


def advice_channel_config(channel_id: str, channels_cfg: dict[str, Any]) -> dict[str, Any]:
    """inherits_advice_from を解決して診断用設定を返す。"""
    base = dict(channels_cfg.get(channel_id) or {})
    parent_key = base.get("inherits_advice_from")
    if parent_key and parent_key in channels_cfg:
        parent = dict(channels_cfg[parent_key])
        # 子の上書きを優先
        merged = {**parent, **{k: v for k, v in base.items() if v is not None}}
        # hook等は子にあれば子を使う
        for key in ("hook_patterns", "cta_patterns", "title_patterns", "structure_rules", "targets"):
            if key in base and base[key]:
                merged[key] = base[key]
        return merged
    return base
