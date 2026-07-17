# YouTube Shorts 具体改善アドバイザー

共通の診断ツールです。チャンネル別GASは `channel/` 配下に置きます。

## いちばん見る場所

| 用途 | パス |
| --- | --- |
| Time Streets GAS | `../channel/Time Streets/gas/TimeStreets_YouTubeDashboard_V2.1.gs` |
| チャンネル一覧 | `../channel/README.md` |

## 使い方

```bash
cd youtube/production/shorts-advisor
pip install -r requirements.txt
python3 scripts/generate_daily_report.py --focus-active
```
