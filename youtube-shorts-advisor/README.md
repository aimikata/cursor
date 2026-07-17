# YouTube Shorts 具体改善アドバイザー

「冒頭を改善してください」ではなく、

> 現在の冒頭「…」を「…」に変更してください。日本語意味は「…」。なぜなら…。

まで出すための診断ツールです。

対象:

- **Time Streets**（最優先・今いちばん動いている）
- **I Entered the Story**
- **INSIGHT MANGA / Five Boys and Me**
- **I Love Ninja**（ID未確定）

参考: [アドネス「YouTubeショートアルゴリズム完全解説」](https://addness.co.jp/media/youtube-short-algorithms/)  
※記事の数値は運用事例の参考値であり、YouTube公式の合格基準ではありません。

## まず読むもの

1. [gas/GAS取得項目チェック.md](./gas/GAS取得項目チェック.md) … **今のGASで足りるか / V2.1差分**
2. [SHEET_MULTI_CHANNEL.md](./SHEET_MULTI_CHANNEL.md) … シートにTime Streets等を追加する手順
3. [EXECUTION_PLAN.md](./EXECUTION_PLAN.md) … 意図の実行方法
4. [DATA_ACQUISITION.md](./DATA_ACQUISITION.md) … データ取得の埋め方
5. [schema/metrics_columns.md](./schema/metrics_columns.md) … シート必須列

## 使い方

```bash
cd youtube-shorts-advisor
pip install -r requirements.txt

# 登録チャンネル確認（priority=1 が Time Streets）
python3 scripts/generate_daily_report.py --list-channels

# 最優先チャンネル（Time Streets）でレポート
python3 scripts/generate_daily_report.py --focus-active

# スプレッドシート『日次分析』CSV
python3 scripts/generate_daily_report.py --sheet-csv /path/to/daily.csv --focus-active

# 自分のCSV
python3 scripts/generate_daily_report.py --csv data/your_metrics.csv --out reports
```

出力例: `reports/YYYYMMDD_<channel>_<video>.md`

## 診断の見方

レポートには必ず次を含めます。

- **アクション区分**: 次の新作 / 同一動画の1点変更再投稿
- **診断**: 現状値・目安・差・主因1つ
- **変更前 / 変更後**（英語＋日本語意味）
- **映像変更**
- **理由**（記事事例・公式の観点）
- **成功判定**

## データが無いと何が起きるか

平均視聴率だけあっても、視聴を選んだ割合が無いと「冒頭か中盤か」が切れません。  
まずは Studio から必須列を埋めてください。API自動化は認証後に段階導入します。
