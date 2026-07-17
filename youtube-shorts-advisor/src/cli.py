"""CLI: CSV / シート日次分析から日次レポートを生成する。"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from .loaders import ROOT, load_metrics_csv
from .registry import list_registry_channels, most_active_channel_id
from .report import render_report, write_report
from .sheet_import import import_daily_analysis_csv, pick_focus_channel, rank_channels_by_recent_views


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="YouTube Shorts の数値から、変更前→変更後まで具体化した日次レポートを生成します。"
    )
    parser.add_argument(
        "--csv",
        type=Path,
        default=None,
        help="メトリクスCSVパス（advisor形式）",
    )
    parser.add_argument(
        "--sheet-csv",
        type=Path,
        default=None,
        help="スプレッドシート『日次分析』を書き出したCSV",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=ROOT / "reports",
        help="レポート出力ディレクトリ",
    )
    parser.add_argument(
        "--video-id",
        type=str,
        default=None,
        help="特定動画だけ生成",
    )
    parser.add_argument(
        "--channel",
        type=str,
        default=None,
        help="channel_id で絞り込み（例: time_streets）",
    )
    parser.add_argument(
        "--focus-active",
        action="store_true",
        help="今最も動かすチャンネル（Time Streets優先）に絞る",
    )
    parser.add_argument(
        "--list-channels",
        action="store_true",
        help="登録チャンネル一覧を表示",
    )
    parser.add_argument(
        "--stdout",
        action="store_true",
        help="ファイルではなく標準出力に出す",
    )
    args = parser.parse_args(argv)

    if args.list_channels:
        for ch in sorted(list_registry_channels(), key=lambda c: c.get("priority", 99)):
            print(
                f"{ch.get('priority')}. {ch['channel_id']} | {ch['display_name']} | "
                f"YT={ch.get('youtube_channel_id')} | sheet={ch.get('in_sheet_analytics')}"
            )
        print(f"focus_default={most_active_channel_id()}")
        return 0

    if args.sheet_csv:
        if not args.sheet_csv.exists():
            print(f"シートCSVが見つかりません: {args.sheet_csv}", file=sys.stderr)
            return 1
        rows = import_daily_analysis_csv(args.sheet_csv)
    else:
        csv_path = args.csv or (ROOT / "data" / "sample_metrics.csv")
        if not csv_path.exists():
            print(f"CSVが見つかりません: {csv_path}", file=sys.stderr)
            return 1
        rows = load_metrics_csv(csv_path)

    if args.focus_active:
        focus = pick_focus_channel(rows)
        present = {m.channel_id for m in rows}
        if focus not in present:
            print(
                f"最優先チャンネル `{focus}` が入力データにありません。"
                " SHEET_MULTI_CHANNEL.md に従ってシートへ追加するか、"
                " data/time_streets_public_snapshot.csv を使ってください。",
                file=sys.stderr,
            )
            # Time Streets公開スナップショットへフォールバック
            fallback = ROOT / "data" / "time_streets_public_snapshot.csv"
            if focus == "time_streets" and fallback.exists():
                print(f"fallback: {fallback}", file=sys.stderr)
                rows = load_metrics_csv(fallback)
            else:
                return 2
        else:
            rows = [r for r in rows if r.channel_id == focus]
        print(f"focus_channel={focus}", file=sys.stderr)

    if args.channel:
        rows = [r for r in rows if r.channel_id == args.channel]

    if args.video_id:
        rows = [r for r in rows if r.video_id == args.video_id]
        if not rows:
            print(f"video_id が見つかりません: {args.video_id}", file=sys.stderr)
            return 1

    if not rows:
        print("対象行がありません。", file=sys.stderr)
        return 1

    ranked = rank_channels_by_recent_views(rows)
    if ranked:
        print("channel_rank_by_views:", file=sys.stderr)
        for cid, views, count in ranked:
            print(f"  {cid}: views_sum={views:.0f} videos={count}", file=sys.stderr)

    for metrics in rows:
        if args.stdout:
            print(render_report(metrics))
            print("\n" + "=" * 60 + "\n")
        else:
            path = write_report(metrics, args.out)
            print(f"wrote {path}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
