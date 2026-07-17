"""CLI: CSVから日次レポートを生成する。"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from .loaders import ROOT, load_metrics_csv
from .report import render_report, write_report


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="YouTube Shorts の数値から、変更前→変更後まで具体化した日次レポートを生成します。"
    )
    parser.add_argument(
        "--csv",
        type=Path,
        default=ROOT / "data" / "sample_metrics.csv",
        help="メトリクスCSVパス",
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
        "--stdout",
        action="store_true",
        help="ファイルではなく標準出力に出す",
    )
    args = parser.parse_args(argv)

    if not args.csv.exists():
        print(f"CSVが見つかりません: {args.csv}", file=sys.stderr)
        return 1

    rows = load_metrics_csv(args.csv)
    if args.video_id:
        rows = [r for r in rows if r.video_id == args.video_id]
        if not rows:
            print(f"video_id が見つかりません: {args.video_id}", file=sys.stderr)
            return 1

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
