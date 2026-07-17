# データ取得方針（未完了だった部分の実装）

ChatGPT相談で止まっていた「データ取得」を、現実的な順で埋めます。

## 結論

1. **今すぐ回す**: YouTube Studio から手入力／コピペで CSV を埋める（本リポジトリの主経路）
2. **次に自動化**: YouTube Analytics API で取れる指標だけ自動取得
3. **Studio専用指標**: 「視聴を選んだ割合（Stayed to watch / How many chose to view）」は Studio UI 依存が強く、API未対応の可能性があるため、当面は手動列として残す

## なぜ API だけにしないか

| 指標 | Studio | Analytics API | 備考 |
| --- | --- | --- | --- |
| 再生数 `views` | ○ | ○ | Shortsは再生定義が2025年以降更新。`engagedViews` も併記推奨 |
| 平均視聴時間 | ○ | ○ `averageViewDuration` | |
| 平均視聴率 | ○ | ○ `averageViewPercentage` | |
| いいね / コメント / シェア | ○ | ○ | |
| 登録者増減 | ○ | ○ | |
| Shortsフィード表示 | ○ | △ | トラフィックソース次元で近似できる場合あり |
| **視聴を選んだ割合** | ○ | ✕〜△ | 診断の最重要。当面は手動必須 |
| 維持率グラフの崖（秒） | ○ | △ `audienceRetention` | 取得できれば `retention_max_drop_sec` に自動計算可 |

診断の切り分けに必須な「視聴を選んだ割合」が API で欠けると、ChatGPT相談時と同じく **データ取得が完了しない** 状態になります。  
そのため、自動化は「取れるものを取る」＋「取れない列は Studio 入力」のハイブリッドにします。

## 手順A: 今日から使う手動取得（推奨）

1. YouTube Studio → アナリティクス → コンテンツ → Shorts
2. 対象動画を開く
3. リーチタブで「視聴を選んだ割合」「Shortsフィード表示」を記録
4. エンゲージメントタブで「平均視聴時間」「平均視聴率」「維持率グラフ」を記録
5. 維持率グラフで最も落ちた秒数を `retention_max_drop_sec` に記入
6. `schema/metrics_template.csv` またはスプレッドシートに貼る
7. 冒頭テロップ／ナレーション原文を `current_hook_text` に入れる
8. レポート生成:

```bash
cd youtube-shorts-advisor
pip install -r requirements.txt
python scripts/generate_daily_report.py --csv data/your_metrics.csv
```

## 手順B: 将来の API 自動取得（設計済み・認証待ち）

必要なもの:

- Google Cloud プロジェクト
- YouTube Analytics API / YouTube Data API 有効化
- OAuth（チャンネル所有者）で `yt-analytics.readonly` / `youtube.readonly`
- チャンネルID（INSIGHT MANGA / I Entered the Story）

取得予定フィールド:

- video_id, title, duration_sec
- views, engagedViews
- averageViewDuration → avg_view_duration_sec
- averageViewPercentage → avg_view_pct
- likes, comments, shares
- subscribersGained - subscribersLost → subscribers_net

手動のまま残すフィールド:

- chose_to_watch_pct
- swiped_away_pct（または 100 − chose）
- retention_max_drop_sec（API retention が取れるまで）
- current_hook_text / current_hook_ja

`scripts/fetch_youtube_analytics.py` は認証情報がある環境で有効化します。  
この Cloud Agent 環境には YouTube OAuth が無いため、ここではスケルトンと手順のみ置きます。

## スプレッドシート運用

推奨タブ構成:

1. `metrics_raw` … 上記必須列
2. `daily_report` … 生成Markdownを貼る、またはGASで書き出し
3. `ab_tests` … 同一動画の A（元）/ B（1点変更）を並べて比較

日次レポートでは:

- 不足数値を列挙するだけにしない
- **取得できた数値の中から最も確度の高い原因を1つ選ぶ**
- 変更前 → 変更後まで書く
- 「次の新作」か「再投稿検証」かを明示する
