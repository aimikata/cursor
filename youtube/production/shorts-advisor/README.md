# YouTube Shorts 具体改善アドバイザー

共通の診断ツールです。チャンネル別のGASは `channel/` 配下に置きます。

## いちばん見る場所

| 用途 | パス |
| --- | --- |
| Time Streets GAS | `../channel/Time Streets/gas/TimeStreets_YouTubeDashboard_V2.1.gs` |
| チャンネル一覧 | `../channel/README.md` |
| この診断ツール | このフォルダ |

## 使い方

```bash
cd youtube/production/shorts-advisor
pip install -r requirements.txt
python3 scripts/generate_daily_report.py --focus-active
```

詳細は `EXECUTION_PLAN.md` / `SHEET_MULTI_CHANNEL.md` / `gas` はチャンネル側を参照。
