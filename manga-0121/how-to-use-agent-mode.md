# CursorでAgentモードを開く方法

## 🎯 基本的な開き方

### **方法1：ComposerからAgentモードに切り替える（推奨）**

1. **Composerを開く**
   - ショートカット：`⌘+I`（Mac）または `Ctrl+I`（Windows）
   - または、メニューから「**View**」→「**Command Palette**」→「**Cursor: Open Composer**」を選択

2. **モード選択で「Agent」を選ぶ**
   - Composerパネルの**上部**に「**Normal**」と「**Agent**」のボタンが表示されます
   - **「Agent」**をクリックして選択

3. **Agentモードに切り替わる**
   - Agentモードになると、**思考プロセスを表示するセクション**が追加されます
   - 入力欄はNormalモードと同じように使えます

### **方法2：Agent一覧から直接選択**

1. **Agent一覧を開く**
   - ショートカット：`⌘+Shift+A`（Mac）または `Ctrl+Shift+A`（Windows）
   - または、メニューから「**View**」→「**Command Palette**」→「**Cursor: Show Agents**」を選択

2. **Agentを選択**
   - 一覧から「**Character Creator**」などのAgentを選択
   - 選択すると、そのAgent専用のモードが開きます

---

## 📝 具体的な手順（スクリーンショット付き説明）

### **ステップ1：Composerを開く**

**Macの場合：**
- `⌘+I` を押す

**Windowsの場合：**
- `Ctrl+I` を押す

**または：**
- メニュー「**View**」→「**Command Palette**」（`⌘+Shift+P` / `Ctrl+Shift+P`）
- 「**Cursor: Open Composer**」と入力してEnter

### **ステップ2：モード選択で「Agent」を選ぶ**

Composerパネルが開いたら：

1. **パネルの上部**を見る
2. 「**Normal**」と「**Agent**」の2つのボタンがある
3. **「Agent」**をクリック

**視覚的な確認：**
- Normalモード：シンプルな入力欄のみ
- Agentモード：入力欄の上に「**Agent Mode**」と表示され、思考プロセスを表示するセクションが追加される

### **ステップ3：Agentに指示を出す**

Agentモードになったら、入力欄に指示を書きます：

**例：**
```
アレックスがコワーキングスペースで学習しているシーンのプロンプトを作成して
```

または：

```
Create a prompt for Alex learning at a co-working space
```

### **ステップ4：実行を確認**

- **Generate**ボタンをクリック（または`Enter`キー）
- Agentが思考プロセスを表示しながら作業を進めます
- ターミナルでコマンドが実行される場合もあります

---

## 🎨 Character Creator Agentを使う場合

### **専用Agentを使う手順**

1. **Agent一覧を開く**
   - `⌘+Shift+A`（Mac）または `Ctrl+Shift+A`（Windows）
   - または、Composerで「**@Character Creator**」と入力

2. **Character Creatorを選択**
   - 一覧から「**Character Creator**」を選択
   - または、Composerの入力欄で「**@Character Creator**」と入力してから指示を書く

3. **指示を出す**
   ```
   @Character Creator アレックスがコワーキングスペースで学習しているシーンのプロンプトを作成して
   ```

---

## 🔍 確認ポイント

### **Agentモードになっているか確認する方法**

1. **パネルの上部**に「**Agent Mode**」と表示されている
2. **思考プロセス**を表示するセクションがある
3. ターミナルでコマンドが自動実行される（必要な場合）

### **NormalモードとAgentモードの違い**

| 項目 | Normalモード | Agentモード |
|------|-------------|------------|
| **思考プロセス** | 表示されない | 表示される |
| **コマンド実行** | 手動 | 自動（必要な場合） |
| **複数ステップ** | 1つずつ | まとめて実行 |
| **向いている作業** | コード生成・修正 | バグ修正＋テスト、複数ステップの作業 |

---

## 💡 よくある質問

### **Q: Agentモードが表示されない**
- **A:** Cursorのバージョンを確認してください。Agent機能は最新版で利用可能です。
- または、Composerを一度閉じて再度開いてみてください。

### **Q: Character Creator Agentが見つからない**
- **A:** `.cursor/agents/character-creator.md`ファイルが正しく作成されているか確認してください。
- Cursorを再起動すると認識される場合があります。

### **Q: Agentがうまく動かない**
- **A:** 指示をより具体的に書いてみてください。
- 例：「プロンプトを作成して」→「アレックスがコワーキングスペースで学習しているシーンの画像生成用プロンプトを、英語と日本語の両方で作成して」

---

## 📚 参考資料

- **Chapter 8**: Agent機能の詳細な説明
- **`.cursor/agents/character-creator.md`**: Character Creator Agentの設定ファイル
- **`character-creation-prompts.md`**: 既存のプロンプト集

---

**作成日：** 2025-01-21
