# 第16章：プロジェクト3：データベースアプリを作る（確認用日本語訳）

> **注意：** これは確認用の日本語訳です。最終出版は英語版です。
> ストーリーの流れと内容の正確性を確認するために使用してください。

## 📖 章の概要

**章タイトル：** プロジェクト3：データベースアプリを作る  
**ページ数：** 24-26ページ（視覚学習に最適化）  
**学習目標：**
- データベースの設計方法を学ぶ
- **CRUD操作**（Create、Read、Update、Delete）を実装する方法を学ぶ
- データベースの**セキュリティ**を考慮する方法を学ぶ
- データベース操作の**テスト**を書く方法を学ぶ

---

## 🎬 ストーリー構造

### **オープニングシーン（ページ1-2）：何を作る？**

**【マンガパート】**

**設定：** アレックスのアパート。第14章でToDoアプリ、第15章でAPI連携アプリを作った後、データを永続的に保存するアプリを作りたいと思っている。

**マンガシーン1（ページ1）：**
- **パネル1：** アレックスが「ToDoアプリやAPI連携アプリは完成したけど、**データを永続的に保存**したいな。JSONファイルだと、データが増えると管理が大変…。」
- **アレックス（思考）：** 「データベースを使えば、**データを永続的に保存**できるって聞いた。でも、**データベースって何？どうやって使うの？**」

**パネル2：** デイビッドがビデオ通話で現れる。
- **デイビッド：** 「それ、**データベースアプリ**を作ってみよう。データベースは、**データを永続的に保存**するための仕組み。SQLiteという軽量なデータベースを使えば、簡単にデータベースアプリを作れるよ。Cursorの**Chat**や**Composer**を使って、データベースアプリを作れるよ。」
- **アレックス：** 「データベースアプリって、どうやって作るんですか？**データベースって何？どうやって使うの？**」

**パネル3：** デイビッドが「**ステップバイステップ**で一緒に作っていこう」と提案する。
- **デイビッド：** 「まず、**データベースとは何か**を理解して、その後、Cursorの**Chat**や**Composer**を使って、**ステップバイステップ**でデータベースアプリを作っていこう。**CRUD操作**や**セキュリティ**、**テスト**も一緒に学んでいくよ。」

**【インフォグラフィックパート】**

**ページ1-2、下部：**
- **この章で作るもの：** データベースアプリ（ユーザー情報を管理するアプリ）
- **この章で学ぶこと：** データベースとは何か、データベースの設計方法、**CRUD操作**（Create、Read、Update、Delete）の実装、データベースの**セキュリティ**、データベース操作の**テスト**
- **使うもの：** Cursorの**Chat**（`⌘+L`／`Ctrl+L`）、**Composer**（`⌘+I`／`Ctrl+I`）、Pythonの`sqlite3`ライブラリ、SQLiteデータベース
- **流れ：** 16.1でデータベースの設計 → 16.2でCRUD操作を実装 → 16.3でセキュリティを考慮 → 16.4でデータベース操作のテストを書く

---

### **セクション16.1：データベースの設計（ページ3-8）**

**【マンガパート】**

**マンガシーン2（ページ3）：**
- **パネル1：** デイビッドが「まず、**データベースとは何か**を理解しよう」と説明する。
- **デイビッド：** 「データベースは、**データを永続的に保存**するための仕組み。JSONファイルだと、データが増えると管理が大変だけど、データベースを使えば、**効率的にデータを管理**できるんだ。」

**パネル2：** アレックスが「**データベースって何？どうやって使うの？**」と聞く。
- **デイビッド：** 「データベースは、**テーブル**という構造でデータを保存する。例えば、ユーザー情報を管理するアプリなら、`users`テーブルに`id`、`name`、`email`などの**カラム**を作る。SQLiteという軽量なデータベースを使えば、簡単にデータベースアプリを作れるよ。Cursorの**Chat**や**Composer**に『ユーザー情報を管理するデータベースアプリを作ってください』って指示すれば、データベースアプリを作ってくれるよ。」

**パネル3：** アレックスが「`daily_log`で実際に、データベースアプリを作ってみたい」と身を乗り出す。
- **デイビッド：** 「じゃあ、Cursorの**Chat**で『ユーザー情報を管理するデータベースアプリを作りたいです。SQLiteを使います。プロジェクトの構造を提案してください』って聞いてみよう。その後、**Composer**でデータベースアプリを作成する流れを体験してみて。」

**【インフォグラフィックパート】**

**ページ3-4：**
- **データベースとは何か：**
  1. **データベース**：データを永続的に保存するための仕組み
  2. **テーブル**：データを保存する構造（例：`users`テーブル）
  3. **カラム**：テーブルの列（例：`id`、`name`、`email`）
  4. **レコード**：テーブルの行（例：1人のユーザー情報）

- **データベースを使うメリット：**
  - **データを永続的に保存**できる
  - **効率的にデータを管理**できる
  - **複雑な検索**ができる
  - **データの整合性**を保てる

**ページ5-6：**
- **実践：Chatでデータベースアプリの計画を相談する（ページ5-6）**

**【マンガパート】**

**マンガシーン3（ページ5）：**
- **パネル1：** アレックスがCursorの**Chat**（`⌘+L`／`Ctrl+L`）を開き、**「ユーザー情報を管理するデータベースアプリを作りたいです。SQLiteを使います。プロジェクトの構造を提案してください」**と入力する。
- **アレックス（入力）：** 「ユーザー情報を管理するデータベースアプリを作りたいです。SQLiteを使います。プロジェクトの構造を提案してください」

**パネル2：** Cursorがプロジェクトの構造を提案する。
- **Cursor（応答）：** 「ユーザー情報を管理するデータベースアプリのプロジェクト構造を提案します：
  ```
  user_db_app/
  ├── user_db.py      # メインのコード
  ├── database.db     # SQLiteデータベースファイル
  └── test_user_db.py # テストコード
  ```
  
  `user_db.py`には以下の機能を実装します：
  - `create_user(name, email)`：ユーザーを作成する
  - `get_user(user_id)`：ユーザーを取得する
  - `update_user(user_id, name, email)`：ユーザーを更新する
  - `delete_user(user_id)`：ユーザーを削除する
  - `list_users()`：ユーザーの一覧を取得する
  ```」

**パネル3：** アレックスが「プロジェクトの構造が提案されたけど、**データベースって何？どうやって使うの？**」と困る。
- **デイビッド：** 「大丈夫。Cursorの**Composer**で『`user_db_app`フォルダを作成して、`user_db.py`ファイルを作成してください。SQLiteを使って、ユーザー情報を管理するデータベースアプリを作成してください。`users`テーブルに`id`、`name`、`email`カラムを作成してください』って指示すれば、データベースアプリを作成してくれるよ。」

**【インフォグラフィックパート】**

**ページ5-6：**
- **Chatでデータベースアプリの計画を相談する手順：**
  1. **Chatを開く：** Chat（`⌘+L`／`Ctrl+L`）を開く
  2. **質問を入力：** **「ユーザー情報を管理するデータベースアプリを作りたいです。SQLiteを使います。プロジェクトの構造を提案してください」**と入力する
  3. **Sendボタンをクリック：** **Send**ボタンをクリックする
  4. **Cursorの提案を確認：** Cursorがプロジェクトの構造を提案する。**必ず目で確認**して、**どんな構造か**を理解する

**ページ7-8：**
- **実践：Composerでデータベースアプリを作成する（ページ7-8）**

**【マンガパート】**

**マンガシーン4（ページ7）：**
- **パネル1：** アレックスがCursorの**Composer**（`⌘+I`／`Ctrl+I`）を開き、**「`user_db_app`フォルダを作成して、`user_db.py`ファイルを作成してください。SQLiteを使って、ユーザー情報を管理するデータベースアプリを作成してください。`users`テーブルに`id`、`name`、`email`カラムを作成してください」**と指示する。
- **アレックス（入力）：** 「`user_db_app`フォルダを作成して、`user_db.py`ファイルを作成してください。SQLiteを使って、ユーザー情報を管理するデータベースアプリを作成してください。`users`テーブルに`id`、`name`、`email`カラムを作成してください」

**パネル2：** Composerがデータベースアプリを作成する。
- **Composer（提案）：** `user_db_app`フォルダを作成し、`user_db.py`ファイルを作成する：
  ```python
  # user_db.py - ユーザー情報を管理するデータベースアプリ
  import sqlite3
  import os
  
  DB_FILE = "database.db"
  
  def init_db():
      """データベースを初期化する"""
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      cursor.execute("""
          CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              email TEXT NOT NULL UNIQUE
          )
      """)
      conn.commit()
      conn.close()
  
  def create_user(name, email):
      """ユーザーを作成する"""
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      cursor.execute("INSERT INTO users (name, email) VALUES (?, ?)", (name, email))
      conn.commit()
      user_id = cursor.lastrowid
      conn.close()
      print(f"ユーザーを作成しました: ID {user_id}, {name}, {email}")
      return user_id
  
  def get_user(user_id):
      """ユーザーを取得する"""
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
      user = cursor.fetchone()
      conn.close()
      if user:
          return {"id": user[0], "name": user[1], "email": user[2]}
      return None
  
  def update_user(user_id, name, email):
      """ユーザーを更新する"""
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      cursor.execute("UPDATE users SET name = ?, email = ? WHERE id = ?", (name, email, user_id))
      conn.commit()
      conn.close()
      print(f"ユーザーを更新しました: ID {user_id}")
  
  def delete_user(user_id):
      """ユーザーを削除する"""
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
      conn.commit()
      conn.close()
      print(f"ユーザーを削除しました: ID {user_id}")
  
  def list_users():
      """ユーザーの一覧を取得する"""
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      cursor.execute("SELECT * FROM users")
      users = cursor.fetchall()
      conn.close()
      return [{"id": u[0], "name": u[1], "email": u[2]} for u in users]
  
  def main():
      """メイン処理"""
      import sys
      init_db()
      if len(sys.argv) < 2:
          print("Usage: python user_db.py [create|get|update|delete|list] [args...]")
          return
      command = sys.argv[1]
      if command == "create":
          if len(sys.argv) < 4:
              print("Usage: python user_db.py create \"名前\" \"メールアドレス\"")
              return
          create_user(sys.argv[2], sys.argv[3])
      elif command == "get":
          if len(sys.argv) < 3:
              print("Usage: python user_db.py get [user_id]")
              return
          user = get_user(int(sys.argv[2]))
          if user:
              print(f"ID: {user['id']}, 名前: {user['name']}, メール: {user['email']}")
          else:
              print("ユーザーが見つかりませんでした")
      elif command == "update":
          if len(sys.argv) < 5:
              print("Usage: python user_db.py update [user_id] \"名前\" \"メールアドレス\"")
              return
          update_user(int(sys.argv[2]), sys.argv[3], sys.argv[4])
      elif command == "delete":
          if len(sys.argv) < 3:
              print("Usage: python user_db.py delete [user_id]")
              return
          delete_user(int(sys.argv[2]))
      elif command == "list":
          users = list_users()
          if users:
              for user in users:
                  print(f"ID: {user['id']}, 名前: {user['name']}, メール: {user['email']}")
          else:
              print("ユーザーがありません")
      else:
          print(f"Unknown command: {command}")
  
  if __name__ == "__main__":
      main()
  ```

**パネル3：** アレックスが「生成されたコードを確認したい」と言う。
- **デイビッド：** 「Composerパネルに表示されたコードを**必ず目で確認**して、**どんな機能が実装されているか**を理解しよう。その後、**Accept**ボタンをクリックして、データベースアプリを作成するよ。」

**【インフォグラフィックパート】**

**ページ7-8：**
- **Composerでデータベースアプリを作成する手順：**
  1. **Composerを開く：** Composer（`⌘+I`／`Ctrl+I`）を開く
  2. **指示を入力：** **「`user_db_app`フォルダを作成して、`user_db.py`ファイルを作成してください。SQLiteを使って、ユーザー情報を管理するデータベースアプリを作成してください。`users`テーブルに`id`、`name`、`email`カラムを作成してください」**と指示する
  3. **Generateボタンをクリック：** **Generate**ボタンをクリックする
  4. **生成されたコードを確認：** Composerパネルに表示されたコードを**必ず目で確認**する。**どんな機能が実装されているか**を理解する
  5. **Acceptボタンをクリック：** **Accept**ボタンをクリックして、データベースアプリを作成する

---

### **セクション16.2：CRUD操作を実装する（ページ9-14）**

**【マンガパート】**

**マンガシーン5（ページ9）：**
- **パネル1：** デイビッドが「じゃあ、**CRUD操作**を実装しよう」と説明する。
- **デイビッド：** 「CRUD操作は、**Create（作成）**、**Read（読み取り）**、**Update（更新）**、**Delete（削除）**の4つの操作。データベースアプリでは、この4つの操作を実装する必要があるよ。」

**パネル2：** アレックスが「**CRUD操作**って、どうやって実装すればいいんですか？」と聞く。
- **デイビッド：** 「Cursorの**Chat**や**Composer**に『`user_db.py`に、CRUD操作を実装してください。`create_user()`、`get_user()`、`update_user()`、`delete_user()`、`list_users()`関数を作成してください』って指示すれば、CRUD操作を実装してくれるよ。」

**パネル3：** アレックスが「`user_db_app`で実際に、CRUD操作を実装してみたい」と身を乗り出す。
- **デイビッド：** 「じゃあ、Cursorの**Chat**で『`user_db.py`に、CRUD操作を実装してください』って聞いてみよう。その後、**Composer**でCRUD操作を実装する流れを体験してみて。」

**【インフォグラフィックパート】**

**ページ9-10：**
- **CRUD操作とは：**
  1. **Create（作成）**：データを作成する（例：`create_user()`）
  2. **Read（読み取り）**：データを読み取る（例：`get_user()`、`list_users()`）
  3. **Update（更新）**：データを更新する（例：`update_user()`）
  4. **Delete（削除）**：データを削除する（例：`delete_user()`）

**ページ11-12：**
- **実践：ChatでCRUD操作の実装を相談する（ページ11-12）**

**【マンガパート】**

**マンガシーン6（ページ11）：**
- **パネル1：** アレックスがCursorの**Chat**（`⌘+L`／`Ctrl+L`）を開き、**「`user_db.py`に、CRUD操作を実装してください。`create_user()`、`get_user()`、`update_user()`、`delete_user()`、`list_users()`関数を作成してください」**と入力する。
- **アレックス（入力）：** 「`user_db.py`に、CRUD操作を実装してください。`create_user()`、`get_user()`、`update_user()`、`delete_user()`、`list_users()`関数を作成してください」

**パネル2：** CursorがCRUD操作の実装を提案する。
- **Cursor（応答）：** 「`user_db.py`に以下のCRUD操作を実装します：
  ```python
  def create_user(name, email):
      """ユーザーを作成する"""
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      cursor.execute("INSERT INTO users (name, email) VALUES (?, ?)", (name, email))
      conn.commit()
      user_id = cursor.lastrowid
      conn.close()
      return user_id
  
  def get_user(user_id):
      """ユーザーを取得する"""
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
      user = cursor.fetchone()
      conn.close()
      return user
  
  def update_user(user_id, name, email):
      """ユーザーを更新する"""
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      cursor.execute("UPDATE users SET name = ?, email = ? WHERE id = ?", (user_id, name, email))
      conn.commit()
      conn.close()
  
  def delete_user(user_id):
      """ユーザーを削除する"""
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
      conn.commit()
      conn.close()
  
  def list_users():
      """ユーザーの一覧を取得する"""
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      cursor.execute("SELECT * FROM users")
      users = cursor.fetchall()
      conn.close()
      return users
  ```」

**パネル3：** アレックスが「CRUD操作が実装されたけど、**どんな操作を実装しているか**がわからない…」と困る。
- **デイビッド：** 「大丈夫。Cursorの**Chat**に**『このCRUD操作は、どんな操作を実装していますか？』**って聞けば、わかりやすく説明してくれるよ。」

**【インフォグラフィックパート】**

**ページ11-12：**
- **ChatでCRUD操作の実装を相談する手順：**
  1. **Chatを開く：** Chat（`⌘+L`／`Ctrl+L`）を開く
  2. **質問を入力：** **「`user_db.py`に、CRUD操作を実装してください。`create_user()`、`get_user()`、`update_user()`、`delete_user()`、`list_users()`関数を作成してください」**と入力する
  3. **Sendボタンをクリック：** **Send**ボタンをクリックする
  4. **Cursorの提案を確認：** CursorがCRUD操作の実装を提案する。**必ず目で確認**して、**どんな操作を実装しているか**を理解する

**ページ13-14：**
- **実践：ComposerでCRUD操作を実装する（ページ13-14）**

**【マンガパート】**

**マンガシーン7（ページ13）：**
- **パネル1：** アレックスがCursorの**Composer**（`⌘+I`／`Ctrl+I`）を開き、**「`user_db.py`に、CRUD操作を実装してください。`create_user()`、`get_user()`、`update_user()`、`delete_user()`、`list_users()`関数を作成してください」**と指示する。
- **アレックス（入力）：** 「`user_db.py`に、CRUD操作を実装してください。`create_user()`、`get_user()`、`update_user()`、`delete_user()`、`list_users()`関数を作成してください」

**パネル2：** ComposerがCRUD操作を実装する。
- **Composer（提案）：** `user_db.py`に以下のCRUD操作を実装する：
  ```python
  def create_user(name, email):
      """ユーザーを作成する"""
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      cursor.execute("INSERT INTO users (name, email) VALUES (?, ?)", (name, email))
      conn.commit()
      user_id = cursor.lastrowid
      conn.close()
      return user_id
  
  def get_user(user_id):
      """ユーザーを取得する"""
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
      user = cursor.fetchone()
      conn.close()
      return user
  
  def update_user(user_id, name, email):
      """ユーザーを更新する"""
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      cursor.execute("UPDATE users SET name = ?, email = ? WHERE id = ?", (user_id, name, email))
      conn.commit()
      conn.close()
  
  def delete_user(user_id):
      """ユーザーを削除する"""
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
      conn.commit()
      conn.close()
  
  def list_users():
      """ユーザーの一覧を取得する"""
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      cursor.execute("SELECT * FROM users")
      users = cursor.fetchall()
      conn.close()
      return users
  ```

**パネル3：** アレックスが「生成されたコードを確認したい」と言う。
- **デイビッド：** 「Composerパネルに表示されたコードを**必ず目で確認**して、**どんな操作を実装しているか**を理解しよう。その後、**Accept**ボタンをクリックして、CRUD操作を実装するよ。」

**【インフォグラフィックパート】**

**ページ13-14：**
- **ComposerでCRUD操作を実装する手順：**
  1. **Composerを開く：** Composer（`⌘+I`／`Ctrl+I`）を開く
  2. **指示を入力：** **「`user_db.py`に、CRUD操作を実装してください。`create_user()`、`get_user()`、`update_user()`、`delete_user()`、`list_users()`関数を作成してください」**と指示する
  3. **Generateボタンをクリック：** **Generate**ボタンをクリックする
  4. **生成されたコードを確認：** Composerパネルに表示されたコードを**必ず目で確認**する。**どんな操作を実装しているか**を理解する
  5. **Acceptボタンをクリック：** **Accept**ボタンをクリックして、CRUD操作を実装する

---

### **セクション16.3：セキュリティを考慮する（ページ15-18）**

**【マンガパート】**

**マンガシーン8（ページ15）：**
- **パネル1：** デイビッドが「データベースアプリでは、**セキュリティ**が大事だよ」と説明する。
- **デイビッド：** 「データベースアプリでは、**SQLインジェクション**という攻撃を防ぐ必要がある。SQLインジェクションは、**悪意のあるSQLコード**を注入して、データベースを操作する攻撃。**パラメータ化クエリ**を使えば、SQLインジェクションを防げるよ。」

**パネル2：** アレックスが「**セキュリティ**って、どうやって考慮すればいいんですか？」と聞く。
- **デイビッド：** 「(1) **パラメータ化クエリ**を使う（SQLインジェクションを防ぐため）、(2) **入力検証**を行う（不正な入力を防ぐため）、(3) **エラーメッセージを公開しない**（情報漏洩を防ぐため）、って感じだよ。Cursorの**Chat**や**Composer**に『`user_db.py`に、セキュリティ対策を追加してください。パラメータ化クエリを使う、入力検証を行う、など』って指示すれば、セキュリティ対策を追加してくれるよ。」

**パネル3：** アレックスが「`user_db_app`で実際に、セキュリティ対策を追加してみたい」と身を乗り出す。
- **デイビッド：** 「じゃあ、Cursorの**Chat**で『`user_db.py`に、セキュリティ対策を追加してください。パラメータ化クエリを使う、入力検証を行う、など』って聞いてみよう。その後、**Composer**でセキュリティ対策を追加する流れを体験してみて。」

**【インフォグラフィックパート】**

**ページ15-16：**
- **データベースのセキュリティ対策：**
  1. **パラメータ化クエリ**：SQLインジェクションを防ぐ（例：`cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))`）
  2. **入力検証**：不正な入力を防ぐ（例：メールアドレスの形式を確認する）
  3. **エラーメッセージを公開しない**：情報漏洩を防ぐ（例：詳細なエラーメッセージを表示しない）

**ページ17-18：**
- **実践：Chatでセキュリティ対策を相談する（ページ17-18）**

**【マンガパート】**

**マンガシーン9（ページ17）：**
- **パネル1：** アレックスがCursorの**Chat**（`⌘+L`／`Ctrl+L`）を開き、**「`user_db.py`に、セキュリティ対策を追加してください。パラメータ化クエリを使う、入力検証を行う、など」**と入力する。
- **アレックス（入力）：** 「`user_db.py`に、セキュリティ対策を追加してください。パラメータ化クエリを使う、入力検証を行う、など」

**パネル2：** Cursorがセキュリティ対策の提案を表示する。
- **Cursor（応答）：** 「`user_db.py`に以下のセキュリティ対策を追加します：
  ```python
  import re
  
  def validate_email(email):
      """メールアドレスの形式を確認する"""
      pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
      return re.match(pattern, email) is not None
  
  def create_user(name, email):
      """ユーザーを作成する"""
      # 入力検証
      if not name or len(name.strip()) == 0:
          raise ValueError("名前が空です")
      if not validate_email(email):
          raise ValueError("メールアドレスの形式が正しくありません")
      
      # パラメータ化クエリを使用
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      try:
          cursor.execute("INSERT INTO users (name, email) VALUES (?, ?)", (name, email))
          conn.commit()
          user_id = cursor.lastrowid
          return user_id
      except sqlite3.IntegrityError:
          raise ValueError("メールアドレスが既に登録されています")
      finally:
          conn.close()
  ```」

**パネル3：** アレックスが「セキュリティ対策が追加されたけど、**どんな対策を追加しているか**がわからない…」と困る。
- **デイビッド：** 「大丈夫。Cursorの**Chat**に**『このセキュリティ対策は、どんな対策を追加していますか？』**って聞けば、わかりやすく説明してくれるよ。」

**【インフォグラフィックパート】**

**ページ17-18：**
- **Chatでセキュリティ対策を相談する手順：**
  1. **Chatを開く：** Chat（`⌘+L`／`Ctrl+L`）を開く
  2. **質問を入力：** **「`user_db.py`に、セキュリティ対策を追加してください。パラメータ化クエリを使う、入力検証を行う、など」**と入力する
  3. **Sendボタンをクリック：** **Send**ボタンをクリックする
  4. **Cursorの提案を確認：** Cursorがセキュリティ対策の提案を表示する。**必ず目で確認**して、**どんな対策を追加しているか**を理解する

---

### **セクション16.4：データベース操作のテストを書く（ページ19-24）**

**【マンガパート】**

**マンガシーン10（ページ19）：**
- **パネル1：** デイビッドが「じゃあ、データベース操作の**テスト**を書いてみよう」と説明する。
- **デイビッド：** 「データベース操作のテストを書いておくと、**データベースの構造が変更されたときに、コードが壊れていないか確認**できる。Cursorの**Chat**や**Composer**に『`test_user_db.py`を作成して、`user_db.py`のデータベース操作をテストしてください』って指示すれば、テストコードを生成してくれるよ。」

**パネル2：** アレックスが「データベース操作のテストって、どうやって書くんですか？」と聞く。
- **デイビッド：** 「データベース操作のテストでは、**テスト用のデータベース**を使う。テスト用のデータベースを使えば、**実際のデータベースを汚さずに**テストできる。Cursorが生成してくれるから、**テストの結果を理解**すればいいよ。」

**パネル3：** アレックスが「`user_db_app`で実際に、データベース操作のテストを書いてみたい」と身を乗り出す。
- **デイビッド：** 「じゃあ、Cursorの**Chat**で『`test_user_db.py`を作成して、`user_db.py`のデータベース操作をテストしてください。`pytest`を使って、`create_user()`、`get_user()`、`update_user()`、`delete_user()`、`list_users()`の各関数をテストしてください。テスト用のデータベースを使ってください』って聞いてみよう。その後、**Composer**でテストファイルを作成する流れを体験してみて。」

**【インフォグラフィックパート】**

**ページ19-20：**
- **データベース操作のテストを書く手順：**
  1. **Chatで質問：** Chat（`⌘+L`／`Ctrl+L`）を開き、**「`test_user_db.py`を作成して、`user_db.py`のデータベース操作をテストしてください。`pytest`を使って、`create_user()`、`get_user()`、`update_user()`、`delete_user()`、`list_users()`の各関数をテストしてください。テスト用のデータベースを使ってください」**と質問する
  2. **Cursorの提案を確認：** Cursorがテストコードの提案を表示する。**必ず目で確認**して、**どんなことをテストしているか**を理解する
  3. **Composerで生成：** Composer（`⌘+I`／`Ctrl+I`）を開き、**「`test_user_db.py`を作成して、`user_db.py`のデータベース操作をテストしてください」**と指示する
  4. **テストを実行：** ターミナルで`pytest test_user_db.py`を実行する

**ページ21-22：**
- **テスト用のデータベースを使ったテストの例：**
  ```python
  import pytest
  import sqlite3
  import os
  from user_db import create_user, get_user, update_user, delete_user, list_users
  
  TEST_DB = "test_database.db"
  
  @pytest.fixture
  def setup_db():
      """テスト用のデータベースをセットアップする"""
      # テスト用のデータベースを作成
      conn = sqlite3.connect(TEST_DB)
      cursor = conn.cursor()
      cursor.execute("""
          CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              email TEXT NOT NULL UNIQUE
          )
      """)
      conn.commit()
      conn.close()
      yield
      # テスト後にデータベースを削除
      if os.path.exists(TEST_DB):
          os.remove(TEST_DB)
  
  def test_create_user(setup_db):
      """ユーザー作成のテスト"""
      user_id = create_user("テストユーザー", "test@example.com")
      assert user_id is not None
  
  def test_get_user(setup_db):
      """ユーザー取得のテスト"""
      user_id = create_user("テストユーザー", "test@example.com")
      user = get_user(user_id)
      assert user["name"] == "テストユーザー"
      assert user["email"] == "test@example.com"
  ```

**ページ23-24：**
- **完成したデータベースアプリの使い方：**
  ```bash
  # ユーザーを作成
  python user_db.py create "山田太郎" "yamada@example.com"
  
  # ユーザーを取得
  python user_db.py get 1
  
  # ユーザーを更新
  python user_db.py update 1 "山田花子" "hanako@example.com"
  
  # ユーザーを削除
  python user_db.py delete 1
  
  # ユーザーの一覧を表示
  python user_db.py list
  ```

---

## 📝 章のまとめ（ページ25-26）

**【マンガパート】**

**マンガシーン11（ページ25）：**
- **パネル1：** デイビッドが「この章では、(1) データベースの設計方法を学んだ、(2) **CRUD操作**（Create、Read、Update、Delete）を実装する方法を学んだ、(3) データベースの**セキュリティ**を考慮する方法を学んだ、(4) データベース操作の**テスト**を書く方法を学んだ、ってところだね。」
- **アレックス：** 「データベースアプリが完成しました！**CRUD操作**や**セキュリティ対策**、**テスト**も追加できました。」

**パネル2：** アレックスが「でも、**データベースって何？どうやって使うの？**って最初はわからなかった…」と振り返る。
- **デイビッド：** 「大丈夫。**ステップバイステップ**で一緒にやっていけば、**データベースとは何か**、**どうやって使うか**がわかるようになるよ。**CRUD操作**や**セキュリティ対策**、**テスト**も一緒に学んでいけば、**実用的なデータベースアプリ**を作れるようになるよ。」

**パネル3：** アレックスが「次は、どんなことを学ぶんですか？」と聞く。
- **デイビッド：** 「次は、**チーム開発**について学ぼう。複数人でプロジェクトを開発する方法を学ぼう。」

**【インフォグラフィックパート】**

**ページ25-26：**
- **この章で学んだこと：**
  - ✅ データベースの設計方法を学んだ
  - ✅ **CRUD操作**（Create、Read、Update、Delete）を実装する方法を学んだ
  - ✅ データベースの**セキュリティ**を考慮する方法を学んだ
  - ✅ データベース操作の**テスト**を書く方法を学んだ

- **CRUD操作：**
  1. **Create（作成）**：`create_user()` - ユーザーを作成する
  2. **Read（読み取り）**：`get_user()`、`list_users()` - ユーザーを取得する
  3. **Update（更新）**：`update_user()` - ユーザーを更新する
  4. **Delete（削除）**：`delete_user()` - ユーザーを削除する

- **データベースのセキュリティ対策：**
  1. **パラメータ化クエリ**：SQLインジェクションを防ぐ
  2. **入力検証**：不正な入力を防ぐ
  3. **エラーメッセージを公開しない**：情報漏洩を防ぐ

- **次の章：** 第17章以降「チーム開発」

---

**確認完了日：** 2025-01-21
