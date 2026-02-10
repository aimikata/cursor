# Day4申込 整形・条件付き書式 手順

## 1. 変更内容のまとめ

| 項目 | 内容 |
|------|------|
| **条件付き書式** | 決済日（I列）が空 → 薄いピンク、決済日あり → 白 |
| **D列 選択日程** | **関数で表示**。J列の生データを参照して整形 |
| **J列 選択日程(生)** | GAS が書き出す元データ（追加・更新のたびに自動反映） |

※整形シートは廃止。Day4申込シート内で完結します。

---

## 2. 列構成

| 列 | 内容 | 入力方法 |
|----|------|----------|
| A | 日時 | GAS |
| B | 名前 | GAS |
| C | メール | GAS |
| **D** | **選択日程** | **式**（J列を整形） |
| E | 目標 | GAS |
| F | 週時間 | GAS |
| G | メッセージ | GAS |
| H | 決済状態 | 式 |
| I | 決済日 | 式 |
| **J** | **選択日程(生)** | **GAS** |

---

## 3. 既存データの移行（初回のみ）

すでに D列 に「Wed Feb 25 2026...」形式のデータがある場合：

1. **J列** に D列 の値をコピー（D列全体をコピー → J列に貼り付け）
2. **D列** をクリアする
3. 次の「4. 式の設定」を行う

---

## 4. 式の設定

### D列2行目（選択日程の整形表示）

組み込み関数のみ使用（カスタム関数不要）:

```
=MAP(J2:J,LAMBDA(j,IF(j="","",IF(REGEXMATCH(j,"^\d{4}/\d"),j,TEXT(DATE(VALUE(REGEXEXTRACT(j,"(\d{4})")),SWITCH(REGEXEXTRACT(j,"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"),"Jan",1,"Feb",2,"Mar",3,"Apr",4,"May",5,"Jun",6,"Jul",7,"Aug",8,"Sep",9,"Oct",10,"Nov",11,"Dec",12,1),VALUE(REGEXEXTRACT(j,"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{1,2}) "))),"yyyy/mm/dd")&IF(REGEXMATCH(j,"\)\s*\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}\s*$")," "&REGEXREPLACE(j,".*\)\s*(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*$","$1-$2"),"")))))
```

※時間は「日本標準時)」の直後の「20:00 - 21:00」を取得。「00:00:00」と混同しないよう修正済み。

**MAP が使えない場合**は、D2 に以下を入れ、下へオートフィル:
```
=IF(J2="","",IF(REGEXMATCH(J2,"^\d{4}/\d"),J2,TEXT(DATE(VALUE(REGEXEXTRACT(J2,"(\d{4})")),SWITCH(REGEXEXTRACT(J2,"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"),"Jan",1,"Feb",2,"Mar",3,"Apr",4,"May",5,"Jun",6,"Jul",7,"Aug",8,"Sep",9,"Oct",10,"Nov",11,"Dec",12,1),VALUE(REGEXEXTRACT(J2,"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{1,2}) "))),"yyyy/mm/dd")&IF(REGEXMATCH(J2,"\)\s*\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}\s*$")," "&REGEXREPLACE(J2,".*\)\s*(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*$","$1-$2"),"")))
```

### H列2行目（決済状態）

```
=ARRAYFORMULA(IF(C2:C="","",IF(IFERROR(VLOOKUP(C2:C,{決済確認シート!B:B,決済確認シート!A:A},2,FALSE),"")<>"","決済済","決済待ち")))
```

### I列2行目（決済日）

```
=ARRAYFORMULA(IF(C2:C="","",IFERROR(VLOOKUP(C2:C,{決済確認シート!B:B,決済確認シート!A:A},2,FALSE),"")))
```

---

## 5. 条件付き書式の設定（GASで実行）

1. GAS エディタで `setupDay4ConditionalFormat` を選択して実行
2. 決済日（I列）が空の行が薄いピンク（#FFE4E1）になります

---

## 6. 新規申込の動き

- GAS が **J列** に生データを書き出します
- **D列** の式が J列 を参照し、自動で整形表示されます
- **定期実行や手動更新は不要**です

---

## 7. 関数一覧

| 関数名 | 用途 |
|--------|------|
| `setupDay4ConditionalFormat` | 条件付き書式を設定（決済日なし=薄いピンク） |
