"""共通データモデル。"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class Band(str, Enum):
    DANGER = "危険"
    IMPROVING = "改善途中"
    PASS = "合格目安"
    STRONG = "強い"
    UNKNOWN = "不明"


class DiagnosisType(str, Enum):
    WEAK_HOOK = "weak_hook"
    MID_DROP = "mid_drop"
    WEAK_DEMAND = "weak_demand"
    WEAK_ENGAGEMENT = "weak_engagement"
    HEALTHY = "healthy"
    INSUFFICIENT_DATA = "insufficient_data"


class ActionMode(str, Enum):
    NEXT_VIDEO = "next_video"
    REPOST_AB = "repost_ab"


@dataclass
class VideoMetrics:
    channel_id: str
    video_id: str
    title: str
    duration_sec: Optional[float] = None
    chose_to_watch_pct: Optional[float] = None
    swiped_away_pct: Optional[float] = None
    avg_view_duration_sec: Optional[float] = None
    avg_view_pct: Optional[float] = None
    likes: Optional[float] = None
    comments: Optional[float] = None
    shares: Optional[float] = None
    views: Optional[float] = None
    shorts_feed_impressions: Optional[float] = None
    subscribers_net: Optional[float] = None
    retention_max_drop_sec: Optional[float] = None
    current_hook_text: Optional[str] = None
    current_hook_ja: Optional[str] = None
    published_at: Optional[str] = None
    notes: Optional[str] = None

    def engagement_rate_pct(self) -> Optional[float]:
        """(いいね+コメント+シェア) / 再生数 * 100。再生数が無い場合はNone。"""
        if self.views is None or self.views <= 0:
            return None
        likes = self.likes or 0
        comments = self.comments or 0
        shares = self.shares or 0
        return (likes + comments + shares) / self.views * 100

    def expected_avg_watch_sec_at(self, pct: float) -> Optional[float]:
        if self.duration_sec is None:
            return None
        return self.duration_sec * (pct / 100.0)

    def missing_required_fields(self) -> list[str]:
        required = {
            "duration_sec": self.duration_sec,
            "chose_to_watch_pct": self.chose_to_watch_pct,
            "avg_view_pct": self.avg_view_pct,
        }
        return [k for k, v in required.items() if v is None]


@dataclass
class Diagnosis:
    diagnosis_type: DiagnosisType
    label: str
    focus: str
    primary_metric: str
    current_value: Optional[float]
    target_value: Optional[float]
    gap_points: Optional[float]
    action_mode: ActionMode
    change_before: str
    change_after: str
    change_after_ja: str
    visual_changes: list[str] = field(default_factory=list)
    reasons: list[str] = field(default_factory=list)
    success_criteria: list[str] = field(default_factory=list)
    missing_fields: list[str] = field(default_factory=list)
    band_summary: dict[str, str] = field(default_factory=dict)
    duration_context: Optional[str] = None
