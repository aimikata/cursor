# YouTube Shorts 具体改善アドバイザー

「冒頭を改善してください」ではなく、

> 現在の冒頭「…」を「…」に変更してください。日本語意味は「…」。なぜなら…。

まで出すための診断ツールです。

対象:

- **INSIGHT MANGA**（ストーリー・教育・感情ドラマ）
- **I Entered the Story**（歴史没入・Vlog・ストーリー）

参考: [アドネス「YouTubeショートアルゴリズム完全解説」](https://addness.co.jp/media/youtube-short-algorithms/)  
※記事の数値は運用事例の参考値であり、YouTube公式の合格基準ではありません。

## まず読むもの

1. [EXECUTION_PLAN.md](./EXECUTION_PLAN.md) … 意図の実行方法
2. [DATA_ACQUISITION.md](./DATA_ACQUISITION.md) … 未完了だったデータ取得の埋め方
3. [schema/metrics_columns.md](./schema/metrics_columns.md) … シート必須列

## 使い方

```bash
cd youtube-shorts-advisor
pip install -r requirements.txt

# サンプルでレポート生成
python scripts/generate_daily_report.py

# 自分のCSV
python scripts/generate_daily_report.py --csv data/your_metrics.csv --out reports
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
