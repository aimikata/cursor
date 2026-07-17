from __future__ import annotations

import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.diagnose import diagnose_video  # noqa: E402
from src.loaders import load_metrics_csv  # noqa: E402
from src.models import ActionMode, DiagnosisType  # noqa: E402
from src.registry import most_active_channel_id  # noqa: E402
from src.report import render_report  # noqa: E402
from src.sheet_import import import_daily_analysis_csv, pick_focus_channel  # noqa: E402


class DiagnoseTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.rows = {m.video_id: m for m in load_metrics_csv(ROOT / "data" / "sample_metrics.csv")}
        cls.time_streets = {
            m.video_id: m
            for m in load_metrics_csv(ROOT / "data" / "time_streets_public_snapshot.csv")
        }

    def test_weak_hook_prefers_repost_when_danger(self) -> None:
        d = diagnose_video(self.rows["demo_edo_kitchen"])
        self.assertEqual(d.diagnosis_type, DiagnosisType.WEAK_HOOK)
        self.assertEqual(d.action_mode, ActionMode.REPOST_AB)
        self.assertIn("Last Meal", d.change_after)

    def test_mid_drop_when_hook_ok(self) -> None:
        d = diagnose_video(self.rows["demo_troy_gate"])
        self.assertEqual(d.diagnosis_type, DiagnosisType.MID_DROP)
        self.assertEqual(d.action_mode, ActionMode.NEXT_VIDEO)
        self.assertIn("24", d.change_after)

    def test_insight_manga_hook(self) -> None:
        d = diagnose_video(self.rows["demo_money_habits"])
        self.assertEqual(d.diagnosis_type, DiagnosisType.WEAK_HOOK)
        self.assertIn("Lost a House", d.change_after)

    def test_weak_engagement(self) -> None:
        d = diagnose_video(self.rows["demo_rich_look"])
        self.assertEqual(d.diagnosis_type, DiagnosisType.WEAK_ENGAGEMENT)
        self.assertIn("saving money", d.change_after.lower())

    def test_report_contains_required_sections(self) -> None:
        text = render_report(self.rows["demo_edo_kitchen"])
        for heading in ["## 診断", "## 変更前", "## 変更後", "## 理由", "## 成功判定", "## アクション区分"]:
            self.assertIn(heading, text)

    def test_most_active_is_time_streets(self) -> None:
        self.assertEqual(most_active_channel_id(), "time_streets")

    def test_time_streets_title_advice_without_studio_metrics(self) -> None:
        d = diagnose_video(self.time_streets["HcStkV6tuXI"])
        self.assertEqual(d.diagnosis_type, DiagnosisType.WEAK_DEMAND)
        self.assertIn("Okinawa", d.change_after)
        self.assertIn("One Day", d.change_after)

    def test_pick_focus_prefers_registry_when_missing_from_sheet(self) -> None:
        focus = pick_focus_channel(list(self.rows.values()))
        self.assertEqual(focus, "time_streets")


if __name__ == "__main__":
    unittest.main()
