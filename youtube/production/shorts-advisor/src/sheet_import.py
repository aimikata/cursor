"""Googleスプレッドシート（日次分析タブ）CSVの取り込み。"""

from __future__ import annotations

import csv
from collections import defaultdict
from pathlib import Path
from typing import Optional

from .models import VideoMetrics
from .registry import most_active_channel_id, resolve_channel_id


def _f(value: object) -> Optional[float]:
    if value is None:
        return None
    text = str(value).strip().replace("%", "").replace(",", "")
    if text == "" or text.lower() in {"na", "n/a", "-", "none", "null"}:
        return None
    try:
        return float(text)
    except ValueError:
        return None


def import_daily_analysis_csv(path: Path | str) -> list[VideoMetrics]:
    """gid=605949338『日次分析』形式を VideoMetrics に変換。

    同一動画は最新の取得日だけ残す。
    """
    path = Path(path)
    with path.open(encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))

    latest: dict[str, dict] = {}
    for row in rows:
        video_id = (row.get("動画ID") or "").strip()
        if not video_id:
            continue
        fetch_date = row.get("取得日") or ""
        prev = latest.get(video_id)
        if prev is None or fetch_date >= (prev.get("取得日") or ""):
            latest[video_id] = row

    metrics_list: list[VideoMetrics] = []
    for video_id, row in latest.items():
        display = row.get("チャンネル名")
        yt_id = row.get("チャンネルID")
        channel_id = (
            resolve_channel_id(display_name=display, youtube_channel_id=yt_id)
            or "unknown"
        )
        avg_dur = _f(row.get("平均視聴時間_秒"))
        avg_pct = _f(row.get("平均視聴率_%"))
        # 0は「未取得/トークン失効」の可能性が高いので診断上は欠損扱いにする
        if avg_dur == 0:
            avg_dur = None
        if avg_pct == 0:
            avg_pct = None

        chose = _f(row.get("視聴を選んだ割合_%"))
        swipe = _f(row.get("スワイプされた割合_%"))
        hook = (row.get("現在の冒頭文") or "").strip() or None

        metrics_list.append(
            VideoMetrics(
                channel_id=channel_id,
                video_id=video_id,
                title=(row.get("動画タイトル") or "").strip(),
                duration_sec=_f(row.get("動画尺_秒")),
                chose_to_watch_pct=chose,
                swiped_away_pct=swipe,
                avg_view_duration_sec=avg_dur,
                avg_view_pct=avg_pct,
                likes=_f(row.get("累計高評価数")),
                comments=_f(row.get("累計コメント数")),
                shares=_f(row.get("期間内シェア数")),
                views=_f(row.get("累計再生数")),
                shorts_feed_impressions=_f(row.get("Shortsフィード経由再生数")),
                subscribers_net=_f(row.get("登録者増減")),
                retention_max_drop_sec=_f(row.get("維持率の最大下落秒数")),
                published_at=(row.get("投稿日") or None),
                notes=(row.get("自動判定") or None),
                current_hook_text=hook or (row.get("動画タイトル") or None),
            )
        )
    return metrics_list


def rank_channels_by_recent_views(metrics: list[VideoMetrics]) -> list[tuple[str, float, int]]:
    """channel_id, 合計再生, 本数。"""
    totals: dict[str, float] = defaultdict(float)
    counts: dict[str, int] = defaultdict(int)
    for m in metrics:
        totals[m.channel_id] += m.views or 0
        counts[m.channel_id] += 1
    ranked = sorted(totals.items(), key=lambda x: -x[1])
    return [(cid, views, counts[cid]) for cid, views in ranked]


def pick_focus_channel(metrics: list[VideoMetrics]) -> str:
    """シート内に複数あれば再生合計が最大のものを優先。

    シートに無い最優先チャンネル（Time Streets）は registry の priority を返す。
    """
    if not metrics:
        return most_active_channel_id()
    ranked = rank_channels_by_recent_views(metrics)
    sheet_top = ranked[0][0] if ranked else None
    preferred = most_active_channel_id()
    # シートに preferred のデータがまだ無いなら、運用上は preferred をフォーカス
    present = {m.channel_id for m in metrics}
    if preferred not in present:
        return preferred
    return sheet_top or preferred
