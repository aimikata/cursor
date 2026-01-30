# Chapter 16: Project 3 — Building a Database App

## 📖 Chapter Overview

**Chapter Title:** Project 3 — Building a Database App  
**Page Count:** 24-26 pages (optimized for visual learning)  
**Learning Objectives:**
- Learn how to design databases
- Learn how to implement **CRUD operations** (Create, Read, Update, Delete)
- Learn how to consider database **security**
- Learn how to write **tests** for database operations

---

## 🎬 Story Structure

### **Opening Scene (Pages 1-2): What to Build?**

**【Manga Part】**

**Setting:** Alex's apartment. After building a ToDo app in Chapter 14 and an API integration app in Chapter 15, Alex wants to build an app that persistently saves data.

**Manga Scene 1 (Page 1):**
- **Panel 1:** Alex says: "The ToDo app and API integration app are complete, but I want to **persistently save data**. With JSON files, managing data becomes difficult as it grows..."
- **Alex (thinking):** "I heard that using a database lets you **persistently save data**. But **what is a database? How do I use it?**"

**Panel 2:** David appears via video call.
- **David:** "Let's build a **database app**. A database is a mechanism to **persistently save data**. Using SQLite, a lightweight database, makes it easy to build database apps. You can build database apps using Cursor's **Chat** and **Composer**."
- **Alex:** "How do I build a database app? **What is a database? How do I use it?**"

**Panel 3:** David suggests: "Let's build it **step by step** together."
- **David:** "First, understand **what a database is**, then use Cursor's **Chat** and **Composer** to build a database app **step by step**. We'll learn **CRUD operations**, **security**, and **tests** together too."

**【Infographic Part】**

**Pages 1-2, bottom:**
- **What we'll build in this chapter:** Database app (app that manages user information)
- **What we'll learn in this chapter:** What a database is, how to design databases, how to implement **CRUD operations** (Create, Read, Update, Delete), database **security**, **tests** for database operations
- **What to use:** Cursor's **Chat** (`⌘+L` / `Ctrl+L`), **Composer** (`⌘+I` / `Ctrl+I`), Python's `sqlite3` library, SQLite database
- **Flow:** Design database in 16.1 → Implement CRUD operations in 16.2 → Consider security in 16.3 → Write tests for database operations in 16.4

---

### **Section 16.1: Database Design (Pages 3-8)**

**【Manga Part】**

**Manga Scene 2 (Page 3):**
- **Panel 1:** David explains: "First, let's understand **what a database is**."
- **David:** "A database is a mechanism to **persistently save data**. With JSON files, managing data becomes difficult as it grows, but using a database lets you **manage data efficiently**."

**Panel 2:** Alex asks: "**What is a database? How do I use it?**"
- **David:** "A database saves data in a structure called **tables**. For example, for an app that manages user information, create **columns** like `id`, `name`, `email` in a `users` table. Using SQLite, a lightweight database, makes it easy to build database apps. Ask Cursor's **Chat** or **Composer** to 'create a database app that manages user information' and it will create a database app."

**Panel 3:** Alex leans forward: "I want to actually build a database app in `daily_log`."
- **David:** "Let's ask Cursor's **Chat** 'I want to build a database app that manages user information. Use SQLite. Please suggest a project structure'. Then experience the flow of creating a database app with **Composer**."

**【Infographic Part】**

**Pages 3-4:**
- **What is a database:**
  1. **Database**: Mechanism to persistently save data
  2. **Table**: Structure to save data (e.g., `users` table)
  3. **Column**: Table columns (e.g., `id`, `name`, `email`)
  4. **Record**: Table rows (e.g., one user's information)

- **Benefits of using databases:**
  - **Can persistently save data**
  - **Can manage data efficiently**
  - **Can perform complex searches**
  - **Can maintain data integrity**

**Pages 5-6:**
- **Practice: Consult about database app plan in Chat (Pages 5-6)**

**【Manga Part】**

**Manga Scene 3 (Page 5):**
- **Panel 1:** Alex opens Cursor's **Chat** (`⌘+L` / `Ctrl+L`) and types **"I want to build a database app that manages user information. Use SQLite. Please suggest a project structure"**.
- **Alex (input):** "I want to build a database app that manages user information. Use SQLite. Please suggest a project structure"

**Panel 2:** Cursor suggests a project structure.
- **Cursor (response):** "I'll suggest a project structure for a database app that manages user information:
  ```
  user_db_app/
  ├── user_db.py      # Main code
  ├── database.db     # SQLite database file
  └── test_user_db.py # Test code
  ```
  
  `user_db.py` will implement the following features:
  - `create_user(name, email)`: Create a user
  - `get_user(user_id)`: Get a user
  - `update_user(user_id, name, email)`: Update a user
  - `delete_user(user_id)`: Delete a user
  - `list_users()`: List users
  ```"

**Panel 3:** Alex is worried: "A project structure was suggested, but I don't understand **what is a database? How do I use it?**..."
- **David:** "It's okay. Instruct Cursor's **Composer** 'Create a `user_db_app` folder and create a `user_db.py` file. Use SQLite to create a database app that manages user information. Create `id`, `name`, `email` columns in a `users` table' and it will create a database app."

**【Infographic Part】**

**Pages 5-6:**
- **Steps to consult about database app plan in Chat:**
  1. **Open Chat:** Open Chat (`⌘+L` / `Ctrl+L`)
  2. **Enter question:** Type **"I want to build a database app that manages user information. Use SQLite. Please suggest a project structure"**
  3. **Click Send button:** Click the **Send** button
  4. **Check Cursor's suggestion:** Cursor suggests a project structure. **Always check with your eyes** and understand **what the structure is**

**Pages 7-8:**
- **Practice: Create database app with Composer (Pages 7-8)**

**【Manga Part】**

**Manga Scene 4 (Page 7):**
- **Panel 1:** Alex opens Cursor's **Composer** (`⌘+I` / `Ctrl+I`) and instructs **"Create a `user_db_app` folder and create a `user_db.py` file. Use SQLite to create a database app that manages user information. Create `id`, `name`, `email` columns in a `users` table"**.
- **Alex (input):** "Create a `user_db_app` folder and create a `user_db.py` file. Use SQLite to create a database app that manages user information. Create `id`, `name`, `email` columns in a `users` table"

**Panel 2:** Composer creates a database app.
- **Composer (suggestion):** Creates a `user_db_app` folder and creates a `user_db.py` file:
  ```python
  # user_db.py - Database app that manages user information
  import sqlite3
  import os
  
  DB_FILE = "database.db"
  
  def init_db():
      """Initialize database"""
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
      """Create a user"""
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      cursor.execute("INSERT INTO users (name, email) VALUES (?, ?)", (name, email))
      conn.commit()
      user_id = cursor.lastrowid
      conn.close()
      print(f"User created: ID {user_id}, {name}, {email}")
      return user_id
  
  def get_user(user_id):
      """Get a user"""
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
      user = cursor.fetchone()
      conn.close()
      if user:
          return {"id": user[0], "name": user[1], "email": user[2]}
      return None
  
  def update_user(user_id, name, email):
      """Update a user"""
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      cursor.execute("UPDATE users SET name = ?, email = ? WHERE id = ?", (name, email, user_id))
      conn.commit()
      conn.close()
      print(f"User updated: ID {user_id}")
  
  def delete_user(user_id):
      """Delete a user"""
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
      conn.commit()
      conn.close()
      print(f"User deleted: ID {user_id}")
  
  def list_users():
      """List users"""
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      cursor.execute("SELECT * FROM users")
      users = cursor.fetchall()
      conn.close()
      return [{"id": u[0], "name": u[1], "email": u[2]} for u in users]
  
  def main():
      """Main processing"""
      import sys
      init_db()
      if len(sys.argv) < 2:
          print("Usage: python user_db.py [create|get|update|delete|list] [args...]")
          return
      command = sys.argv[1]
      if command == "create":
          if len(sys.argv) < 4:
              print("Usage: python user_db.py create \"name\" \"email\"")
              return
          create_user(sys.argv[2], sys.argv[3])
      elif command == "get":
          if len(sys.argv) < 3:
              print("Usage: python user_db.py get [user_id]")
              return
          user = get_user(int(sys.argv[2]))
          if user:
              print(f"ID: {user['id']}, Name: {user['name']}, Email: {user['email']}")
          else:
              print("User not found")
      elif command == "update":
          if len(sys.argv) < 5:
              print("Usage: python user_db.py update [user_id] \"name\" \"email\"")
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
                  print(f"ID: {user['id']}, Name: {user['name']}, Email: {user['email']}")
          else:
              print("No users")
      else:
          print(f"Unknown command: {command}")
  
  if __name__ == "__main__":
      main()
  ```

**Panel 3:** Alex says: "I want to check the generated code."
- **David:** "**Always check with your eyes** the code displayed in the Composer panel and understand **what features are implemented**. Then click the **Accept** button to create the database app."

**【Infographic Part】**

**Pages 7-8:**
- **Steps to create database app with Composer:**
  1. **Open Composer:** Open Composer (`⌘+I` / `Ctrl+I`)
  2. **Enter instruction:** Instruct **"Create a `user_db_app` folder and create a `user_db.py` file. Use SQLite to create a database app that manages user information. Create `id`, `name`, `email` columns in a `users` table"**
  3. **Click Generate button:** Click the **Generate** button
  4. **Check generated code:** **Always check with your eyes** the code displayed in the Composer panel. Understand **what features are implemented**
  5. **Click Accept button:** Click the **Accept** button to create the database app

---

### **Section 16.2: Implementing CRUD Operations (Pages 9-14)**

**【Manga Part】**

**Manga Scene 5 (Page 9):**
- **Panel 1:** David explains: "Let's implement **CRUD operations**."
- **David:** "CRUD operations are four operations: **Create**, **Read**, **Update**, **Delete**. Database apps need to implement these four operations."

**Panel 2:** Alex asks: "How do I implement **CRUD operations**?"
- **David:** "Ask Cursor's **Chat** or **Composer** 'Implement CRUD operations in `user_db.py`. Create `create_user()`, `get_user()`, `update_user()`, `delete_user()`, `list_users()` functions' and it will implement CRUD operations."

**Panel 3:** Alex leans forward: "I want to actually implement CRUD operations in `user_db_app`."
- **David:** "Let's ask Cursor's **Chat** 'Implement CRUD operations in `user_db.py`'. Then experience the flow of implementing CRUD operations with **Composer**."

**【Infographic Part】**

**Pages 9-10:**
- **What are CRUD operations:**
  1. **Create**: Create data (e.g., `create_user()`)
  2. **Read**: Read data (e.g., `get_user()`, `list_users()`)
  3. **Update**: Update data (e.g., `update_user()`)
  4. **Delete**: Delete data (e.g., `delete_user()`)

**Pages 11-12:**
- **Practice: Consult about CRUD operation implementation in Chat (Pages 11-12)**

**【Manga Part】**

**Manga Scene 6 (Page 11):**
- **Panel 1:** Alex opens Cursor's **Chat** (`⌘+L` / `Ctrl+L`) and types **"Implement CRUD operations in `user_db.py`. Create `create_user()`, `get_user()`, `update_user()`, `delete_user()`, `list_users()` functions"**.
- **Alex (input):** "Implement CRUD operations in `user_db.py`. Create `create_user()`, `get_user()`, `update_user()`, `delete_user()`, `list_users()` functions"

**Panel 2:** Cursor suggests CRUD operation implementations.
- **Cursor (response):** "I'll implement the following CRUD operations in `user_db.py`:
  ```python
  def create_user(name, email):
      """Create a user"""
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      cursor.execute("INSERT INTO users (name, email) VALUES (?, ?)", (name, email))
      conn.commit()
      user_id = cursor.lastrowid
      conn.close()
      return user_id
  
  def get_user(user_id):
      """Get a user"""
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
      user = cursor.fetchone()
      conn.close()
      return user
  
  def update_user(user_id, name, email):
      """Update a user"""
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      cursor.execute("UPDATE users SET name = ?, email = ? WHERE id = ?", (user_id, name, email))
      conn.commit()
      conn.close()
  
  def delete_user(user_id):
      """Delete a user"""
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
      conn.commit()
      conn.close()
  
  def list_users():
      """List users"""
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      cursor.execute("SELECT * FROM users")
      users = cursor.fetchall()
      conn.close()
      return users
  ```"

**Panel 3:** Alex is worried: "CRUD operations were implemented, but I don't understand **what operations are implemented**..."
- **David:** "It's okay. Ask Cursor's **Chat** **'What operations do these CRUD operations implement?'** and it will explain clearly."

**【Infographic Part】**

**Pages 11-12:**
- **Steps to consult about CRUD operation implementation in Chat:**
  1. **Open Chat:** Open Chat (`⌘+L` / `Ctrl+L`)
  2. **Enter question:** Type **"Implement CRUD operations in `user_db.py`. Create `create_user()`, `get_user()`, `update_user()`, `delete_user()`, `list_users()` functions"**
  3. **Click Send button:** Click the **Send** button
  4. **Check Cursor's suggestion:** Cursor suggests CRUD operation implementations. **Always check with your eyes** and understand **what operations are implemented**

**Pages 13-14:**
- **Practice: Implement CRUD operations with Composer (Pages 13-14)**

**【Manga Part】**

**Manga Scene 7 (Page 13):**
- **Panel 1:** Alex opens Cursor's **Composer** (`⌘+I` / `Ctrl+I`) and instructs **"Implement CRUD operations in `user_db.py`. Create `create_user()`, `get_user()`, `update_user()`, `delete_user()`, `list_users()` functions"**.
- **Alex (input):** "Implement CRUD operations in `user_db.py`. Create `create_user()`, `get_user()`, `update_user()`, `delete_user()`, `list_users()` functions"

**Panel 2:** Composer implements CRUD operations.
- **Composer (suggestion):** Implements the following CRUD operations in `user_db.py`:
  ```python
  def create_user(name, email):
      """Create a user"""
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      cursor.execute("INSERT INTO users (name, email) VALUES (?, ?)", (name, email))
      conn.commit()
      user_id = cursor.lastrowid
      conn.close()
      return user_id
  
  def get_user(user_id):
      """Get a user"""
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
      user = cursor.fetchone()
      conn.close()
      return user
  
  def update_user(user_id, name, email):
      """Update a user"""
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      cursor.execute("UPDATE users SET name = ?, email = ? WHERE id = ?", (user_id, name, email))
      conn.commit()
      conn.close()
  
  def delete_user(user_id):
      """Delete a user"""
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
      conn.commit()
      conn.close()
  
  def list_users():
      """List users"""
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      cursor.execute("SELECT * FROM users")
      users = cursor.fetchall()
      conn.close()
      return users
  ```

**Panel 3:** Alex says: "I want to check the generated code."
- **David:** "**Always check with your eyes** the code displayed in the Composer panel and understand **what operations are implemented**. Then click the **Accept** button to implement CRUD operations."

**【Infographic Part】**

**Pages 13-14:**
- **Steps to implement CRUD operations with Composer:**
  1. **Open Composer:** Open Composer (`⌘+I` / `Ctrl+I`)
  2. **Enter instruction:** Instruct **"Implement CRUD operations in `user_db.py`. Create `create_user()`, `get_user()`, `update_user()`, `delete_user()`, `list_users()` functions"**
  3. **Click Generate button:** Click the **Generate** button
  4. **Check generated code:** **Always check with your eyes** the code displayed in the Composer panel. Understand **what operations are implemented**
  5. **Click Accept button:** Click the **Accept** button to implement CRUD operations

---

### **Section 16.3: Considering Security (Pages 15-18)**

**【Manga Part】**

**Manga Scene 8 (Page 15):**
- **Panel 1:** David explains: "In database apps, **security** is important."
- **David:** "In database apps, you need to prevent **SQL injection** attacks. SQL injection is an attack that injects **malicious SQL code** to manipulate the database. Using **parameterized queries** prevents SQL injection."

**Panel 2:** Alex asks: "How do I consider **security**?"
- **David:** "(1) Use **parameterized queries** (to prevent SQL injection), (2) **validate input** (to prevent invalid input), (3) **don't expose error messages** (to prevent information leakage). Ask Cursor's **Chat** or **Composer** 'Add security measures to `user_db.py`. Use parameterized queries, validate input, etc.' and it will add security measures."

**Panel 3:** Alex leans forward: "I want to actually add security measures in `user_db_app`."
- **David:** "Let's ask Cursor's **Chat** 'Add security measures to `user_db.py`. Use parameterized queries, validate input, etc.'. Then experience the flow of adding security measures with **Composer**."

**【Infographic Part】**

**Pages 15-16:**
- **Database security measures:**
  1. **Parameterized queries**: Prevent SQL injection (e.g., `cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))`)
  2. **Input validation**: Prevent invalid input (e.g., check email format)
  3. **Don't expose error messages**: Prevent information leakage (e.g., don't display detailed error messages)

**Pages 17-18:**
- **Practice: Consult about security measures in Chat (Pages 17-18)**

**【Manga Part】**

**Manga Scene 9 (Page 17):**
- **Panel 1:** Alex opens Cursor's **Chat** (`⌘+L` / `Ctrl+L`) and types **"Add security measures to `user_db.py`. Use parameterized queries, validate input, etc."**.
- **Alex (input):** "Add security measures to `user_db.py`. Use parameterized queries, validate input, etc."

**Panel 2:** Cursor displays security measure suggestions.
- **Cursor (response):** "I'll add the following security measures to `user_db.py`:
  ```python
  import re
  
  def validate_email(email):
      """Validate email format"""
      pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
      return re.match(pattern, email) is not None
  
  def create_user(name, email):
      """Create a user"""
      # Input validation
      if not name or len(name.strip()) == 0:
          raise ValueError("Name is empty")
      if not validate_email(email):
          raise ValueError("Email format is invalid")
      
      # Use parameterized queries
      conn = sqlite3.connect(DB_FILE)
      cursor = conn.cursor()
      try:
          cursor.execute("INSERT INTO users (name, email) VALUES (?, ?)", (name, email))
          conn.commit()
          user_id = cursor.lastrowid
          return user_id
      except sqlite3.IntegrityError:
          raise ValueError("Email already registered")
      finally:
          conn.close()
  ```"

**Panel 3:** Alex is worried: "Security measures were added, but I don't understand **what measures were added**..."
- **David:** "It's okay. Ask Cursor's **Chat** **'What security measures were added?'** and it will explain clearly."

**【Infographic Part】**

**Pages 17-18:**
- **Steps to consult about security measures in Chat:**
  1. **Open Chat:** Open Chat (`⌘+L` / `Ctrl+L`)
  2. **Enter question:** Type **"Add security measures to `user_db.py`. Use parameterized queries, validate input, etc."**
  3. **Click Send button:** Click the **Send** button
  4. **Check Cursor's suggestion:** Cursor displays security measure suggestions. **Always check with your eyes** and understand **what measures were added**

---

### **Section 16.4: Writing Tests for Database Operations (Pages 19-24)**

**【Manga Part】**

**Manga Scene 10 (Page 19):**
- **Panel 1:** David explains: "Let's write **tests** for database operations."
- **David:** "Writing tests for database operations lets you **verify that code isn't broken when database structure changes**. Ask Cursor's **Chat** or **Composer** to 'create `test_user_db.py` and test database operations in `user_db.py`' and it will generate test code."

**Panel 2:** Alex asks: "How do I write tests for database operations?"
- **David:** "For database operation tests, use **test databases**. Using test databases lets you **test without polluting the actual database**. Cursor generates them, so you just need to **understand test results**."

**Panel 3:** Alex leans forward: "I want to actually write tests for database operations in `user_db_app`."
- **David:** "Let's ask Cursor's **Chat** 'create `test_user_db.py` and test database operations in `user_db.py`. Use `pytest` to test each function: `create_user()`, `get_user()`, `update_user()`, `delete_user()`, `list_users()`. Use a test database'. Then experience the flow of creating test files with **Composer**."

**【Infographic Part】**

**Pages 19-20:**
- **Steps to write tests for database operations:**
  1. **Ask in Chat:** Open Chat (`⌘+L` / `Ctrl+L`) and ask **"Create `test_user_db.py` and test database operations in `user_db.py`. Use `pytest` to test each function: `create_user()`, `get_user()`, `update_user()`, `delete_user()`, `list_users()`. Use a test database"**
  2. **Check Cursor's suggestion:** Cursor displays test code suggestions. **Always check with your eyes** and understand **what they test**
  3. **Generate with Composer:** Open Composer (`⌘+I` / `Ctrl+I`) and instruct **"Create `test_user_db.py` and test database operations in `user_db.py`"**
  4. **Run tests:** Run `pytest test_user_db.py` in the terminal

**Pages 21-22:**
- **Example of tests using test database:**
  ```python
  import pytest
  import sqlite3
  import os
  from user_db import create_user, get_user, update_user, delete_user, list_users
  
  TEST_DB = "test_database.db"
  
  @pytest.fixture
  def setup_db():
      """Set up test database"""
      # Create test database
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
      # Delete database after tests
      if os.path.exists(TEST_DB):
          os.remove(TEST_DB)
  
  def test_create_user(setup_db):
      """Test user creation"""
      user_id = create_user("Test User", "test@example.com")
      assert user_id is not None
  
  def test_get_user(setup_db):
      """Test user retrieval"""
      user_id = create_user("Test User", "test@example.com")
      user = get_user(user_id)
      assert user["name"] == "Test User"
      assert user["email"] == "test@example.com"
  ```

**Pages 23-24:**
- **How to use the completed database app:**
  ```bash
  # Create a user
  python user_db.py create "Yamada Taro" "yamada@example.com"
  
  # Get a user
  python user_db.py get 1
  
  # Update a user
  python user_db.py update 1 "Yamada Hanako" "hanako@example.com"
  
  # Delete a user
  python user_db.py delete 1
  
  # List users
  python user_db.py list
  ```

---

## 📝 Chapter Summary (Pages 25-26)

**【Manga Part】**

**Manga Scene 11 (Page 25):**
- **Panel 1:** David says: "In this chapter, we (1) learned how to design databases, (2) learned how to implement **CRUD operations** (Create, Read, Update, Delete), (3) learned how to consider database **security**, (4) learned how to write **tests** for database operations. That's what we covered."
- **Alex:** "The database app is complete! I also added **CRUD operations**, **security measures**, and **tests**."

**Panel 2:** Alex reflects: "But at first I didn't understand **what is a database? How do I use it?**..."
- **David:** "It's okay. If we do it **step by step** together, you'll understand **what a database is** and **how to use it**. If we learn **CRUD operations**, **security measures**, and **tests** together, you can build **practical database apps**."

**Panel 3:** Alex asks: "What do we learn next?"
- **David:** "Next, let's learn about **team development**. Let's learn how to develop projects with multiple people."

**【Infographic Part】**

**Pages 25-26:**
- **What we learned in this chapter:**
  - ✅ Learned how to design databases
  - ✅ Learned how to implement **CRUD operations** (Create, Read, Update, Delete)
  - ✅ Learned how to consider database **security**
  - ✅ Learned how to write **tests** for database operations

- **CRUD operations:**
  1. **Create**: `create_user()` - Create a user
  2. **Read**: `get_user()`, `list_users()` - Get users
  3. **Update**: `update_user()` - Update a user
  4. **Delete**: `delete_user()` - Delete a user

- **Database security measures:**
  1. **Parameterized queries**: Prevent SQL injection
  2. **Input validation**: Prevent invalid input
  3. **Don't expose error messages**: Prevent information leakage

- **Next chapters:** Chapter 17 onwards "Team Development"

---

**Chapter 16 - Complete**
