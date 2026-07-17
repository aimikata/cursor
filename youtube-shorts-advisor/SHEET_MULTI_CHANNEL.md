# スプレッドシートを多チャンネル対応にする手順

対象シート:  
https://docs.google.com/spreadsheets/d/13wV69dPLjvjp_1Bx4ZyCyF8FytI6BohsHCQ84qv1UsU/edit

## 現状（2026-07-17確認）

| チャンネル | YouTube ID | シート自動取得 | 公開Shortsの勢い |
| --- | --- | --- | --- |
| **Time Streets** | `UCkD8_KvuA5egxWtW2vDmuKQ` | **なし** | **最大**（1.3千 / 1.2千再生など） |
| I Entered the Story | `UC6eXFB1x8324KleWR7B5RcQ` | あり（唯一） | 数百再生で停滞気味 |
| Five Boys and Me / INSIGHT系 | `UCWJqUpEo71A5yYS5PathY5g` | なし | ほぼ未稼働 |
| I Love Ninja | 未確定 | なし | 未確認 |

また、`ChatGPT入力用` タブの対象名は「INSIGHT MANGA」ですが、中身は **I Entered the Story** のデータです（誤ラベル）。

ログには `Token has been expired or revoked` が出ています。  
**先に OAuth を再認証しないと、どのチャンネルを追加しても平均視聴率が0のまま**になります。

## 今やる順番

### 1. OAuth再認証（必須）

Apps Script / スプレッドシート連携で使っている Google アカウントの YouTube Analytics 認可をやり直す。  
`ログ` タブで `invalid_grant` が消えるまで確認。

### 2. 取得対象チャンネルに Time Streets を追加（最優先）

`runDailyYouTubeDashboard` が参照しているチャンネル一覧（配列や設定シート）へ、次を追加する。

```text
UCkD8_KvuA5egxWtW2vDmuKQ  // Time Streets
UC6eXFB1x8324KleWR7B5RcQ  // I Entered the Story（既存）
UCWJqUpEo71A5yYS5PathY5g  // Five Boys and Me / INSIGHT系
```

追加後、手動で `runDailyYouTubeDashboard` を1回実行し、

- `動画一覧` / `日次分析` に Time Streets の行が出る
- `改善メモ` / `ChatGPT入力用` のチャンネル名が実データと一致する

を確認する。

### 3. ChatGPT入力用の対象名バグを直す

対象列が常に `INSIGHT MANGA` になっているので、実チャンネル名を入れる。

- Time Streets のデータなら `Time Streets`
- I Entered のデータなら `I Entered the Story`
- INSIGHT/Five Boys のデータならその名前

### 4. 診断必須列を足す

今の日次分析には **視聴を選んだ割合** と **動画尺** がありません。  
列を追加するか、Studioから別タブへ追記してください。無いと「冒頭か中盤か」を切れません。

推奨追加列:

- `動画尺_秒`
- `視聴を選んだ割合_%`
- `スワイプされた割合_%`
- `維持率の最大下落秒数`
- `現在の冒頭文`

### 5. このリポジトリでレポート生成

シートの `日次分析` をCSVダウンロードして:

```bash
cd youtube-shorts-advisor
python3 scripts/generate_daily_report.py --sheet-csv /path/to/日次分析.csv --focus-active
```

`--focus-active` は、シートに未収録でも **Time Streets を最優先**で見ます。  
Time Streets の公開再生スナップショットだけで先に試す場合:

```bash
python3 scripts/generate_daily_report.py --csv data/time_streets_public_snapshot.csv --video-id HcStkV6tuXI
```
