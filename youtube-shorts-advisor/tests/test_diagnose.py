from __future__ import annotations

import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.diagnose import diagnose_video  # noqa: E402
from src.loaders import load_metrics_csv  # noqa: E402
from src.models import ActionMode, DiagnosisType  # noqa: E402
from src.report import render_report  # noqa: E402


class DiagnoseTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.rows = {m.video_id: m for m in load_metrics_csv(ROOT / "data" / "sample_metrics.csv")}

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


if __name__ == "__main__":
    unittest.main()
