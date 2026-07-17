"""数値から主原因を1つ選び、変更前→変更後まで生成する。"""

from __future__ import annotations

from typing import Any, Optional

from .loaders import load_advice_templates, load_benchmarks, load_channels
from .models import ActionMode, Band, Diagnosis, DiagnosisType, VideoMetrics


def classify_band(value: Optional[float], bands: dict[str, Any]) -> Band:
    if value is None:
        return Band.UNKNOWN
    if value < bands["improving"]["min"]:
        return Band.DANGER
    if value < bands["pass"]["min"]:
        return Band.IMPROVING
    if value < bands["strong"]["min"]:
        return Band.PASS
    return Band.STRONG


def _gap(current: Optional[float], target: Optional[float]) -> Optional[float]:
    if current is None or target is None:
        return None
    return current - target


def _duration_context(metrics: VideoMetrics) -> Optional[str]:
    if metrics.duration_sec is None or metrics.avg_view_pct is None:
        return None
    avg_sec = metrics.avg_view_duration_sec
    if avg_sec is None:
        avg_sec = metrics.duration_sec * (metrics.avg_view_pct / 100.0)
    return (
        f"動画尺 {metrics.duration_sec:.0f}秒 × 平均視聴率 {metrics.avg_view_pct:.1f}% "
        f"≒ 平均視聴時間 {avg_sec:.1f}秒。"
        "同じ視聴率でも尺が違うと意味が変わるため、セットで判断する。"
    )


def _pick_hook_rewrite(channel: dict[str, Any], metrics: VideoMetrics) -> tuple[str, str, str]:
    hooks = channel.get("hook_patterns", {})
    bad = hooks.get("bad_examples") or []
    good = hooks.get("good_examples") or []

    before = metrics.current_hook_text or (bad[0]["text"] if bad else "(冒頭文未入力)")
    before_ja = metrics.current_hook_ja or (bad[0].get("ja") if bad else "")
    after = good[0]["text"] if good else "Put the decisive moment in the first second."
    after_ja = good[0].get("ja", "") if good else ""

    # 入力された冒頭が悪い例に近い場合はそのペアを使う
    if metrics.current_hook_text and bad and good:
        lowered = metrics.current_hook_text.lower().strip()
        best_i = None
        best_score = 0
        for i, example in enumerate(bad):
            ex = example["text"].lower().strip()
            score = 0
            if lowered == ex:
                score = 100
            elif len(lowered) >= 12 and (ex[:24] in lowered or lowered[:24] in ex):
                score = 80
            else:
                # キーワード重なり（today/i entered だけの誤爆を避ける）
                tokens = [t for t in lowered.replace(",", " ").split() if len(t) > 3]
                score = sum(1 for t in tokens if t in ex)
            if score > best_score:
                best_score = score
                best_i = i
        if best_i is not None and best_score >= 2:
            before = bad[best_i]["text"]
            before_ja = bad[best_i].get("ja", before_ja)
            pair = good[min(best_i, len(good) - 1)]
            after = pair["text"]
            after_ja = pair.get("ja", "")

    if before_ja:
        before_display = f"{before}\n\n日本語意味：\n{before_ja}"
    else:
        before_display = before
    return before_display, after, after_ja


def _decide_action(
    diagnosis_type: DiagnosisType,
    templates: dict[str, Any],
    metrics: VideoMetrics,
    target_chose: float,
) -> ActionMode:
    tmpl = templates["diagnosis_types"].get(diagnosis_type.value, {})
    preferred = tmpl.get("preferred_action", "next_video")
    # 視聴選択率が危険帯（50%未満）またはターゲットより15pt以上低い場合は再投稿検証を優先
    if diagnosis_type == DiagnosisType.WEAK_HOOK and metrics.chose_to_watch_pct is not None:
        if metrics.chose_to_watch_pct < 50 or (target_chose - metrics.chose_to_watch_pct) >= 15:
            return ActionMode.REPOST_AB
    return ActionMode.REPOST_AB if preferred == "repost_ab" else ActionMode.NEXT_VIDEO


def diagnose_video(metrics: VideoMetrics) -> Diagnosis:
    channels = load_channels()
    benchmarks = load_benchmarks()
    templates = load_advice_templates()
    bands = benchmarks["shared_bands"]

    channel = channels.get(metrics.channel_id)
    if channel is None:
        return Diagnosis(
            diagnosis_type=DiagnosisType.INSUFFICIENT_DATA,
            label="チャンネル未登録",
            focus="config/channels.yaml にチャンネル定義を追加してください。",
            primary_metric="channel_id",
            current_value=None,
            target_value=None,
            gap_points=None,
            action_mode=ActionMode.NEXT_VIDEO,
            change_before="-",
            change_after="-",
            change_after_ja="",
            reasons=[f"未知の channel_id: {metrics.channel_id}"],
            missing_fields=metrics.missing_required_fields(),
        )

    missing = metrics.missing_required_fields()
    targets = channel["targets"]
    engagement = metrics.engagement_rate_pct()

    band_summary = {
        "視聴を選んだ割合": classify_band(metrics.chose_to_watch_pct, bands["chose_to_watch_pct"]).value,
        "平均視聴率": classify_band(metrics.avg_view_pct, bands["avg_view_pct"]).value,
        "エンゲージメント率": classify_band(engagement, bands["engagement_rate_pct"]).value,
    }

    # 最低限の切り分けに必要な数値が無い場合
    if "chose_to_watch_pct" in missing and "avg_view_pct" in missing:
        return Diagnosis(
            diagnosis_type=DiagnosisType.INSUFFICIENT_DATA,
            label="診断に必要な数値が不足",
            focus="視聴を選んだ割合と平均視聴率が無いと、冒頭か中盤かを切り分けられない。",
            primary_metric="chose_to_watch_pct / avg_view_pct",
            current_value=None,
            target_value=None,
            gap_points=None,
            action_mode=ActionMode.NEXT_VIDEO,
            change_before="-",
            change_after="-",
            change_after_ja="",
            reasons=[
                "不足している数値を列挙するだけでは改善できない。",
                "まずは YouTube Studio から必須項目を埋める。",
            ],
            missing_fields=missing,
            band_summary=band_summary,
            duration_context=_duration_context(metrics),
            success_criteria=["必須項目をシートに入力し、再診断する"],
        )

    target_chose = float(targets["chose_to_watch_pct"])
    target_retention = float(targets["avg_view_pct"])
    target_eng = float(targets["engagement_rate_pct"])
    min_retention = float(targets.get("avg_view_pct_min", target_retention))

    chose = metrics.chose_to_watch_pct
    retention = metrics.avg_view_pct
    views = metrics.views

    # --- 優先順位どおりに主原因を1つ選ぶ ---
    if chose is not None and chose < target_chose:
        return _build_weak_hook(
            metrics, channel, templates, band_summary, target_chose, missing
        )

    if retention is not None and retention < min_retention:
        return _build_mid_drop(
            metrics, channel, templates, band_summary, target_retention, missing
        )

    # 維持は合格だが再生が弱い
    views_weak = views is not None and views < 1000
    if retention is not None and retention >= min_retention and views_weak:
        return _build_weak_demand(
            metrics, channel, templates, band_summary, target_retention, missing
        )

    if (
        engagement is not None
        and engagement < target_eng
        and views is not None
        and views >= 1000
        and (retention is None or retention >= min_retention)
    ):
        return _build_weak_engagement(
            metrics, channel, templates, band_summary, target_eng, missing
        )

    # データが部分的でも、取れた数値の中で最も確度の高い原因を返す
    if chose is None and retention is not None and retention < min_retention:
        return _build_mid_drop(
            metrics, channel, templates, band_summary, target_retention, missing
        )
    if retention is None and chose is not None and chose < target_chose:
        return _build_weak_hook(
            metrics, channel, templates, band_summary, target_chose, missing
        )

    return Diagnosis(
        diagnosis_type=DiagnosisType.HEALTHY,
        label="主要指標は目安をクリア",
        focus="同じ型を繰り返し、傾向確認を続ける。",
        primary_metric="総合",
        current_value=retention,
        target_value=target_retention,
        gap_points=_gap(retention, target_retention),
        action_mode=ActionMode.NEXT_VIDEO,
        change_before=metrics.current_hook_text or "(現行維持)",
        change_after="現行の冒頭型・中盤テンポを次の新作でも再現する",
        change_after_ja="勝ちパターンを崩さず横展開する",
        visual_changes=channel.get("structure_rules", []),
        reasons=[
            f"視聴を選んだ割合: {chose}% / 目安 {target_chose}%以上"
            if chose is not None
            else "視聴を選んだ割合: 未取得",
            f"平均視聴率: {retention}% / 目安 {min_retention}%以上"
            if retention is not None
            else "平均視聴率: 未取得",
            f"エンゲージメント率: {engagement:.2f}% / 目安 {target_eng}%以上"
            if engagement is not None
            else "エンゲージメント率: 再生数不足で未算出",
        ],
        success_criteria=[
            "次の新作でも同型を維持し、視聴選択率・平均視聴率が目安以上であること",
        ],
        missing_fields=missing,
        band_summary=band_summary,
        duration_context=_duration_context(metrics),
    )


def _build_weak_hook(
    metrics: VideoMetrics,
    channel: dict[str, Any],
    templates: dict[str, Any],
    band_summary: dict[str, str],
    target_chose: float,
    missing: list[str],
) -> Diagnosis:
    tmpl = templates["diagnosis_types"]["weak_hook"]
    before, after, after_ja = _pick_hook_rewrite(channel, metrics)
    action = _decide_action(DiagnosisType.WEAK_HOOK, templates, metrics, target_chose)
    gap = _gap(metrics.chose_to_watch_pct, target_chose)

    visual = [
        "現在：場所説明・自己紹介から入っている可能性が高い",
        "変更後：1秒目に事件の核心（鍋・刀・門・緊張した手など）を出す",
        "1秒目から湯気・動き・音を入れる（無音・フェードイン削除）",
        "自己紹介は4秒以降へ移動",
    ]
    why = []
    goods = channel.get("hook_patterns", {}).get("good_examples") or []
    if goods and goods[0].get("why"):
        why.extend(goods[0]["why"])
    why.extend(
        [
            f"視聴を選んだ割合が目安（{target_chose}%以上）を下回っているため、最優先は冒頭",
            tmpl["article_evidence"].strip().replace("\n", ""),
            tmpl["official_note"].strip().replace("\n", ""),
        ]
    )

    success = [
        f"視聴を選んだ割合: {metrics.chose_to_watch_pct}% → {target_chose}%以上",
        "平均視聴率: 現状維持以上",
        "Shortsフィード表示数: 前回比増加",
    ]
    if action == ActionMode.REPOST_AB:
        success.append("同一内容で冒頭だけ変更した再投稿として比較する")

    return Diagnosis(
        diagnosis_type=DiagnosisType.WEAK_HOOK,
        label=tmpl["label"],
        focus=tmpl["focus"],
        primary_metric="視聴を選んだ割合",
        current_value=metrics.chose_to_watch_pct,
        target_value=target_chose,
        gap_points=gap,
        action_mode=action,
        change_before=before,
        change_after=after,
        change_after_ja=after_ja,
        visual_changes=visual + tmpl.get("change_checklist", []),
        reasons=why,
        success_criteria=success,
        missing_fields=missing,
        band_summary=band_summary,
        duration_context=_duration_context(metrics),
    )


def _build_mid_drop(
    metrics: VideoMetrics,
    channel: dict[str, Any],
    templates: dict[str, Any],
    band_summary: dict[str, str],
    target_retention: float,
    missing: list[str],
) -> Diagnosis:
    tmpl = templates["diagnosis_types"]["mid_drop"]
    drop_sec = metrics.retention_max_drop_sec
    if drop_sec is not None:
        before = (
            f"{drop_sec:.0f}秒付近で維持率が最大下落。"
            "背景説明・人物説明が続いている区間を疑う。"
        )
        after = (
            f"{drop_sec:.0f}秒地点の説明を短縮し、"
            f"その直前に「でも、ここにはある決まりがあった」など新しい危機・予告を入れる。"
        )
        after_ja = f"{drop_sec:.0f}秒で離脱が起きているので、説明を切って次の情報予告に切り替える"
    else:
        before = "\n".join(tmpl["structure_before"])
        after = "\n".join(tmpl["structure_after"])
        after_ja = "中盤の背景説明を短縮し、20秒前後に新しい危機を置く"

    action = ActionMode.NEXT_VIDEO
    # 平均視聴率が危険帯なら再編集価値あり
    if metrics.avg_view_pct is not None and metrics.avg_view_pct < 50:
        action = ActionMode.REPOST_AB

    return Diagnosis(
        diagnosis_type=DiagnosisType.MID_DROP,
        label=tmpl["label"],
        focus=tmpl["focus"],
        primary_metric="平均視聴率",
        current_value=metrics.avg_view_pct,
        target_value=target_retention,
        gap_points=_gap(metrics.avg_view_pct, target_retention),
        action_mode=action,
        change_before=before,
        change_after=after,
        change_after_ja=after_ja,
        visual_changes=[
            "テンポを良くする、ではなく秒数指定で切る",
            "18〜26秒の背景説明を8秒に短縮する（該当する場合）",
            "20秒地点に新しい情報・危機を置く",
            *channel.get("structure_rules", []),
        ],
        reasons=[
            "視聴を選んだ割合は目安以上なので、入口より中盤が主因候補",
            tmpl["article_evidence"].strip().replace("\n", ""),
        ],
        success_criteria=[
            f"平均視聴率: {metrics.avg_view_pct}% → {target_retention}%以上"
            if metrics.avg_view_pct is not None
            else f"平均視聴率: {target_retention}%以上",
            "視聴を選んだ割合: 現状維持以上",
            "維持率グラフの最大下落が浅くなること",
        ],
        missing_fields=missing,
        band_summary=band_summary,
        duration_context=_duration_context(metrics),
    )


def _build_weak_demand(
    metrics: VideoMetrics,
    channel: dict[str, Any],
    templates: dict[str, Any],
    band_summary: dict[str, str],
    target_retention: float,
    missing: list[str],
) -> Diagnosis:
    tmpl = templates["diagnosis_types"]["weak_demand"]
    titles = channel.get("title_patterns", {})
    weak = titles.get("weak", metrics.title or "(弱いタイトル)")
    strong = titles.get("strong", "人物 + 危機 + 結末 が一瞬で分かるタイトル")
    strong_ja = titles.get("strong_ja", "")
    why = titles.get("why", "場所説明より、人物・危機・結末が同時に伝わる入口の方が需要に刺さりやすい")

    return Diagnosis(
        diagnosis_type=DiagnosisType.WEAK_DEMAND,
        label=tmpl["label"],
        focus=tmpl["focus"],
        primary_metric="再生数 / テーマ入口",
        current_value=metrics.views,
        target_value=None,
        gap_points=None,
        action_mode=ActionMode.NEXT_VIDEO,
        change_before=weak if not metrics.title else metrics.title,
        change_after=strong,
        change_after_ja=strong_ja,
        visual_changes=[
            "編集よりタイトル・冒頭約束・テーマ需要を見直す",
            *[f"確認順: {item}" for item in tmpl.get("check_order", [])],
        ],
        reasons=[
            f"平均視聴率は {metrics.avg_view_pct}% で目安前後のため、編集より入口を優先",
            why,
            tmpl["article_evidence"].strip().replace("\n", ""),
        ],
        success_criteria=[
            "次の新作でタイトルに人物・危機・結末を含める",
            "視聴を選んだ割合とShortsフィード表示数が前回比で改善",
        ],
        missing_fields=missing,
        band_summary=band_summary,
        duration_context=_duration_context(metrics),
    )


def _build_weak_engagement(
    metrics: VideoMetrics,
    channel: dict[str, Any],
    templates: dict[str, Any],
    band_summary: dict[str, str],
    target_eng: float,
    missing: list[str],
) -> Diagnosis:
    tmpl = templates["diagnosis_types"]["weak_engagement"]
    ctas = channel.get("cta_patterns", {})
    # チャンネルに合うCTAを1つ選ぶ
    if "history" in ctas:
        cta = ctas["history"]
    elif "money_family" in ctas:
        cta = ctas["money_family"]
    else:
        cta = next(iter(ctas.values()))

    engagement = metrics.engagement_rate_pct()
    return Diagnosis(
        diagnosis_type=DiagnosisType.WEAK_ENGAGEMENT,
        label=tmpl["label"],
        focus=tmpl["focus"],
        primary_metric="エンゲージメント率",
        current_value=engagement,
        target_value=target_eng,
        gap_points=_gap(engagement, target_eng),
        action_mode=ActionMode.NEXT_VIDEO,
        change_before="CTAを入れましょう（抽象） / または CTAなし",
        change_after=cta["text"],
        change_after_ja=cta.get("ja", ""),
        visual_changes=[
            "末尾2秒に答えやすい二択・問いをテロップとナレーションで重ねる",
            "結論を言い切ったあとの余白は切る",
        ],
        reasons=[
            "再生はあるが能動的反応が薄い＝見て終わり",
            tmpl["article_evidence"].strip().replace("\n", ""),
        ],
        success_criteria=[
            f"エンゲージメント率: {engagement:.2f}% → {target_eng}%以上"
            if engagement is not None
            else f"エンゲージメント率: {target_eng}%以上",
            "コメント数が前回比で増加",
        ],
        missing_fields=missing,
        band_summary=band_summary,
        duration_context=_duration_context(metrics),
    )
