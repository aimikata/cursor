"""日次レポート（Markdown）生成。"""

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

from .diagnose import diagnose_video
from .loaders import load_channels
from .models import ActionMode, Diagnosis, VideoMetrics


def action_label(mode: ActionMode) -> str:
    if mode == ActionMode.REPOST_AB:
        return "この動画を1点だけ変更して再投稿してください（検証）"
    return "次の新作で試してください（傾向確認）"


def render_report(metrics: VideoMetrics, diagnosis: Diagnosis | None = None) -> str:
    diagnosis = diagnosis or diagnose_video(metrics)
    channels = load_channels()
    channel = channels.get(metrics.channel_id, {})
    channel_name = channel.get("display_name", metrics.channel_id)
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    gap_text = (
        f"{diagnosis.gap_points:+.1f}ポイント"
        if diagnosis.gap_points is not None
        else "算出不可"
    )
    current_text = (
        f"{diagnosis.current_value}"
        if diagnosis.current_value is not None
        else "未取得"
    )
    target_text = (
        f"{diagnosis.target_value}"
        if diagnosis.target_value is not None
        else "—"
    )

    eng = metrics.engagement_rate_pct()
    eng_text = f"{eng:.2f}%" if eng is not None else "未算出"

    lines = [
        f"# 日次ショート改善レポート — {channel_name}",
        "",
        f"- 生成: {now}",
        f"- 動画ID: `{metrics.video_id}`",
        f"- タイトル: {metrics.title or '(無題)'}",
        f"- 公開日: {metrics.published_at or '未入力'}",
        "",
        "## アクション区分",
        "",
        f"**{action_label(diagnosis.action_mode)}**",
        "",
        "| 区分 | 目的 |",
        "| --- | --- |",
        "| 同じ動画の一部分だけ変更して再投稿 | 原因を確かめる |",
        "| 別動画で同じ型を繰り返す | チャンネル全体の傾向を確認する |",
        "",
        "## 診断",
        "",
        f"- 主因: **{diagnosis.label}**（`{diagnosis.diagnosis_type.value}`）",
        f"- 指標: {diagnosis.primary_metric}",
        f"- 現状値: {current_text}",
        f"- 目安: {target_text}",
        f"- 差: {gap_text}",
        f"- 方針: {diagnosis.focus}",
        "",
        "### バンド判定（参考値）",
        "",
    ]

    for key, value in diagnosis.band_summary.items():
        lines.append(f"- {key}: {value}")

    lines.extend(
        [
            "",
            "### 取得数値",
            "",
            f"- 動画尺: {metrics.duration_sec if metrics.duration_sec is not None else '未取得'} 秒",
            f"- 視聴を選んだ割合: {metrics.chose_to_watch_pct if metrics.chose_to_watch_pct is not None else '未取得'}%",
            f"- スワイプされた割合: {metrics.swiped_away_pct if metrics.swiped_away_pct is not None else '未取得'}%",
            f"- 平均視聴時間: {metrics.avg_view_duration_sec if metrics.avg_view_duration_sec is not None else '未取得'} 秒",
            f"- 平均視聴率: {metrics.avg_view_pct if metrics.avg_view_pct is not None else '未取得'}%",
            f"- 再生数: {metrics.views if metrics.views is not None else '未取得'}",
            f"- いいね: {metrics.likes if metrics.likes is not None else '未取得'}",
            f"- コメント: {metrics.comments if metrics.comments is not None else '未取得'}",
            f"- シェア: {metrics.shares if metrics.shares is not None else '未取得'}",
            f"- エンゲージメント率: {eng_text}",
            f"- Shortsフィード表示数: {metrics.shorts_feed_impressions if metrics.shorts_feed_impressions is not None else '未取得'}",
            f"- 登録者増減: {metrics.subscribers_net if metrics.subscribers_net is not None else '未取得'}",
            f"- 維持率の最大下落秒数: {metrics.retention_max_drop_sec if metrics.retention_max_drop_sec is not None else '未取得'}",
            "",
        ]
    )

    if diagnosis.duration_context:
        lines.extend(["### 尺と視聴時間のセット判断", "", diagnosis.duration_context, ""])

    if diagnosis.missing_fields:
        lines.extend(
            [
                "### 不足数値",
                "",
                "不足があっても、取得できた数値から最も確度の高い原因を1つ選んでいます。",
                "",
                *[f"- `{field}`" for field in diagnosis.missing_fields],
                "",
            ]
        )

    lines.extend(
        [
            "## 変更前",
            "",
            "```text",
            diagnosis.change_before,
            "```",
            "",
            "## 変更後",
            "",
            "```text",
            diagnosis.change_after,
            "```",
            "",
        ]
    )
    if diagnosis.change_after_ja:
        lines.extend([f"日本語意味：{diagnosis.change_after_ja}", ""])

    if diagnosis.visual_changes:
        lines.extend(["## 映像・構成変更", ""])
        lines.extend([f"- {item}" for item in diagnosis.visual_changes])
        lines.append("")

    if diagnosis.reasons:
        lines.extend(["## 理由", ""])
        lines.extend([f"- {item}" for item in diagnosis.reasons])
        lines.append("")

    if diagnosis.success_criteria:
        lines.extend(["## 成功判定", "", "次回（または再投稿）で以下になれば改善成功とします。", ""])
        lines.extend([f"- {item}" for item in diagnosis.success_criteria])
        lines.append("")

    lines.extend(
        [
            "---",
            "",
            "注: 表中の合格目安は運用事例の参考値であり、YouTube公式の合格基準ではありません。",
            "公式が重視するのは「見ようと選ばれたか」「どれだけ見続けられたか」「視聴後に満足したか」です。",
            "",
        ]
    )
    return "\n".join(lines)


def write_report(metrics: VideoMetrics, out_dir: Path | str) -> Path:
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    diagnosis = diagnose_video(metrics)
    content = render_report(metrics, diagnosis)
    safe_id = metrics.video_id or "unknown"
    date = datetime.now(timezone.utc).strftime("%Y%m%d")
    path = out_dir / f"{date}_{metrics.channel_id}_{safe_id}.md"
    path.write_text(content, encoding="utf-8")
    return path
