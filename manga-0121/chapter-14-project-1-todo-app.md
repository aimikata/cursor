# Chapter 14: Project 1 — Building a ToDo App

## 📖 Chapter Overview

**Chapter Title:** Project 1 — Building a ToDo App  
**Page Count:** 24-26 pages (optimized for visual learning)  
**Learning Objectives:**
- **Integrate** Cursor features learned so far in a **practical project**
- Build a ToDo app **step by step**
- Learn **common problems** and their solutions
- Learn how to **test** the completed app

---

## 🎬 Story Structure

### **Opening Scene (Pages 1-2): What to Build?**

**【Manga Part】**

**Setting:** Alex's apartment. Has learned Cursor features but wants to create an actual project.

**Manga Scene 1 (Page 1):**
- **Panel 1:** Alex says: "I've learned Cursor features, but I want to **create an actual project**. However, I don't know **where to start**..."
- **Alex (thinking):** "`daily_log` was a small project, but I want to create a **larger project**. However, I don't know **how to start**."

**Panel 2:** David appears via video call.
- **David:** "Let's build a **ToDo app**. A ToDo app is a simple app that can **add, delete, and complete tasks**. You can **integrate** Cursor features learned so far."
- **Alex:** "How do I build a ToDo app? I don't know **where to start**..."

**Panel 3:** David suggests: "Let's build it **step by step** together."
- **David:** "First, make a **project plan**, then use Cursor's **Chat** and **Composer** to build it **step by step**. We'll solve **common problems** together too."

**【Infographic Part】**

**Pages 1-2, bottom:**
- **What we'll build in this chapter:** ToDo app (app that can add, delete, and complete tasks)
- **What we'll learn in this chapter:** **Integrate** Cursor features learned so far in a **practical project**, build a project **step by step**, **common problems** and their solutions
- **What to use:** Cursor's **Chat** (`⌘+L` / `Ctrl+L`), **Composer** (`⌘+I` / `Ctrl+I`), **Tab**, **Agent**, all features learned so far
- **Flow:** Plan project in 14.1 → Use Cursor features step by step in 14.2 → Solve common problems in 14.3 → Complete and test in 14.4

---

### **Section 14.1: Project Planning and Setup (Pages 3-8)**

**【Manga Part】**

**Manga Scene 2 (Page 3):**
- **Panel 1:** David explains: "First, let's make a **project plan**."
- **David:** "Before building a ToDo app, let's clarify **what to build** and **what features are needed**. For example, we need (1) **add tasks**, (2) **delete tasks**, (3) **complete tasks**, (4) **list tasks**."

**Panel 2:** Alex is worried: "I don't know **where to start**..."
- **David:** "It's okay. Ask Cursor's **Chat** 'I want to build a ToDo app. An app that can add, delete, complete, and list tasks. Please suggest a project structure' and it will suggest a project structure."

**Panel 3:** Alex leans forward: "I want to actually make a project plan in `daily_log`."
- **David:** "Let's ask Cursor's **Chat** 'I want to build a ToDo app. Please suggest a project structure'. Then experience the flow of creating the project with **Composer**."

**【Infographic Part】**

**Pages 3-4:**
- **Project plan:**
  1. **What to build:** ToDo app (app that can add, delete, complete, and list tasks)
  2. **What features are needed:**
     - Add tasks
     - Delete tasks
     - Complete tasks
     - List tasks
  3. **What files are needed:**
     - `todo.py` (main code)
     - `todo_data.json` (file to save task data)
     - `test_todo.py` (test code)

**Pages 5-6:**
- **Practice: Consult about project plan in Chat (Pages 5-6)**

**【Manga Part】**

**Manga Scene 3 (Page 5):**
- **Panel 1:** Alex opens Cursor's **Chat** (`⌘+L` / `Ctrl+L`) and types **"I want to build a ToDo app. An app that can add, delete, complete, and list tasks. Please suggest a project structure"**.
- **Alex (input):** "I want to build a ToDo app. An app that can add, delete, complete, and list tasks. Please suggest a project structure"

**Panel 2:** Cursor suggests a project structure.
- **Cursor (response):** "I'll suggest a ToDo app project structure:
  ```
  todo_app/
  ├── todo.py          # Main code
  ├── todo_data.json   # File to save task data
  └── test_todo.py     # Test code
  ```
  
  `todo.py` will implement the following features:
  - `add_task(task)`: Add a task
  - `delete_task(task_id)`: Delete a task
  - `complete_task(task_id)`: Complete a task
  - `list_tasks()`: List tasks
  - `main()`: Main processing
  ```"

**Panel 3:** Alex is worried: "A project structure was suggested, but I don't know **how to start**..."
- **David:** "It's okay. Instruct Cursor's **Composer** 'Create a `todo_app` folder and create a `todo.py` file. Implement features to add, delete, complete, and list tasks' and it will create the project."

**【Infographic Part】**

**Pages 5-6:**
- **Steps to consult about project plan in Chat:**
  1. **Open Chat:** Open Chat (`⌘+L` / `Ctrl+L`)
  2. **Enter question:** Type **"I want to build a ToDo app. An app that can add, delete, complete, and list tasks. Please suggest a project structure"**
  3. **Click Send button:** Click the **Send** button
  4. **Check Cursor's suggestion:** Cursor suggests a project structure. **Always check with your eyes** and understand **what the structure is**

**Pages 7-8:**
- **Practice: Create project with Composer (Pages 7-8)**

**【Manga Part】**

**Manga Scene 4 (Page 7):**
- **Panel 1:** Alex opens Cursor's **Composer** (`⌘+I` / `Ctrl+I`) and instructs **"Create a `todo_app` folder and create a `todo.py` file. Implement features to add, delete, complete, and list tasks"**.
- **Alex (input):** "Create a `todo_app` folder and create a `todo.py` file. Implement features to add, delete, complete, and list tasks"

**Panel 2:** Composer creates the project.
- **Composer (suggestion):** Creates a `todo_app` folder and creates a `todo.py` file:
  ```python
  # todo.py - ToDo app
  import json
  import os
  from datetime import datetime
  
  DATA_FILE = "todo_data.json"
  
  def load_tasks():
      """Load tasks"""
      if os.path.exists(DATA_FILE):
          with open(DATA_FILE, "r", encoding="utf-8") as f:
              return json.load(f)
      return []
  
  def save_tasks(tasks):
      """Save tasks"""
      with open(DATA_FILE, "w", encoding="utf-8") as f:
          json.dump(tasks, f, ensure_ascii=False, indent=2)
  
  def add_task(task):
      """Add a task"""
      tasks = load_tasks()
      task_id = len(tasks) + 1
      tasks.append({
          "id": task_id,
          "task": task,
          "completed": False,
          "created_at": datetime.now().isoformat()
      })
      save_tasks(tasks)
      print(f"Task added: {task}")
  
  def delete_task(task_id):
      """Delete a task"""
      tasks = load_tasks()
      tasks = [t for t in tasks if t["id"] != task_id]
      save_tasks(tasks)
      print(f"Task deleted: ID {task_id}")
  
  def complete_task(task_id):
      """Complete a task"""
      tasks = load_tasks()
      for task in tasks:
          if task["id"] == task_id:
              task["completed"] = True
              break
      save_tasks(tasks)
      print(f"Task completed: ID {task_id}")
  
  def list_tasks():
      """List tasks"""
      tasks = load_tasks()
      if not tasks:
          print("No tasks")
          return
      for task in tasks:
          status = "✓" if task["completed"] else " "
          print(f"{status} [{task['id']}] {task['task']}")
  
  def main():
      """Main processing"""
      import sys
      if len(sys.argv) < 2:
          print("Usage: python todo.py [add|delete|complete|list] [args...]")
          return
      command = sys.argv[1]
      if command == "add":
          if len(sys.argv) < 3:
              print("Usage: python todo.py add \"task\"")
              return
          add_task(sys.argv[2])
      elif command == "delete":
          if len(sys.argv) < 3:
              print("Usage: python todo.py delete [task_id]")
              return
          delete_task(int(sys.argv[2]))
      elif command == "complete":
          if len(sys.argv) < 3:
              print("Usage: python todo.py complete [task_id]")
              return
          complete_task(int(sys.argv[2]))
      elif command == "list":
          list_tasks()
      else:
          print(f"Unknown command: {command}")
  
  if __name__ == "__main__":
      main()
  ```

**Panel 3:** Alex says: "I want to check the generated code."
- **David:** "**Always check with your eyes** the code displayed in the Composer panel and understand **what features are implemented**. Then click the **Accept** button to create the project."

**【Infographic Part】**

**Pages 7-8:**
- **Steps to create project with Composer:**
  1. **Open Composer:** Open Composer (`⌘+I` / `Ctrl+I`)
  2. **Enter instruction:** Instruct **"Create a `todo_app` folder and create a `todo.py` file. Implement features to add, delete, complete, and list tasks"**
  3. **Click Generate button:** Click the **Generate** button
  4. **Check generated code:** **Always check with your eyes** the code displayed in the Composer panel. Understand **what features are implemented**
  5. **Click Accept button:** Click the **Accept** button to create the project

---

### **Section 14.2: Using Cursor Features Step by Step (Pages 9-16)**

**【Manga Part】**

**Manga Scene 5 (Page 9):**
- **Panel 1:** David explains: "Let's use Cursor features **step by step** to complete the ToDo app."
- **David:** "First, use **Tab** to write code. Then ask **Chat** questions and add features with **Composer**. Use **Agent** to run tests."

**Panel 2:** Alex is worried: "I don't know **where to use Cursor features**..."
- **David:** "It's okay. Let's do it **step by step** together. For example, (1) write code with **Tab**, (2) ask questions in **Chat**, (3) add features with **Composer**, (4) run tests with **Agent**."

**Panel 3:** Alex leans forward: "I want to actually use Cursor features in `todo_app`."
- **David:** "Let's write code with **Tab**. Then experience the flow of asking **Chat** questions and adding features with **Composer**."

**【Infographic Part】**

**Pages 9-10:**
- **Flow of using Cursor features step by step:**
  1. **Write code with Tab:** Open `todo.py` and write code with **Tab**
  2. **Ask questions in Chat:** When you don't understand something, ask in **Chat**
  3. **Add features with Composer:** When adding new features, add with **Composer**
  4. **Run tests with Agent:** When running tests, use **Agent**

**Pages 11-12:**
- **Practice: Write code with Tab (Pages 11-12)**

**【Manga Part】**

**Manga Scene 6 (Page 11):**
- **Panel 1:** Alex opens `todo.py` and tries to write the `add_task()` function. "I want to write the `add_task()` function..."
- **Alex (thinking):** "I want to write the `add_task()` function, but **the next line doesn't come to me**..."

**Panel 2:** Alex presses **Tab** and Cursor suggests code.
- **Cursor (suggestion):** Suggests continuation of the `add_task()` function:
  ```python
  def add_task(task):
      """Add a task"""
      tasks = load_tasks()
      task_id = len(tasks) + 1
      tasks.append({
          "id": task_id,
          "task": task,
          "completed": False,
          "created_at": datetime.now().isoformat()
      })
      save_tasks(tasks)
      print(f"Task added: {task}")
  ```

**Panel 3:** Alex is worried: "**Tab** suggested code, but I don't know if it's a **good suggestion**..."
- **David:** "It's okay. **Accept with Tab if it's good**, **reject with Esc if wrong**. **Always check with your eyes** and get in the habit of **accepting only good suggestions**."

**【Infographic Part】**

**Pages 11-12:**
- **Steps to write code with Tab:**
  1. **Open file:** Open `todo.py`
  2. **Write code:** Write function names or comments
  3. **Press Tab:** Press **Tab** and Cursor suggests code
  4. **Check suggestion:** **Always check with your eyes** and judge if it's a **good suggestion**
  5. **Accept or reject:** **Accept with Tab if good**, **reject with Esc if wrong**

**Pages 13-14:**
- **Practice: Ask questions in Chat (Pages 13-14)**

**【Manga Part】**

**Manga Scene 7 (Page 13):**
- **Panel 1:** Alex looks at `todo.py` and is worried: "I don't know how to use `json.dump()`..."
- **Alex (thinking):** "I don't know how to use `json.dump()`. Let me ask in **Chat**."

**Panel 2:** Alex opens Cursor's **Chat** (`⌘+L` / `Ctrl+L`) and asks **"Please teach me how to use `json.dump()`"**.
- **Alex (input):** "Please teach me how to use `json.dump()`"

**Panel 3:** Cursor explains how to use `json.dump()`.
- **Cursor (response):** "`json.dump()` is a function to write Python objects to a JSON file. Usage:
  ```python
  import json
  data = {"key": "value"}
  with open("file.json", "w", encoding="utf-8") as f:
      json.dump(data, f, ensure_ascii=False, indent=2)
  ```
  `ensure_ascii=False` is to save Japanese correctly, `indent=2` is to make it readable."

**【Infographic Part】**

**Pages 13-14:**
- **Steps to ask questions in Chat:**
  1. **Open Chat:** Open Chat (`⌘+L` / `Ctrl+L`)
  2. **Enter question:** Ask what you don't understand (e.g., "Please teach me how to use `json.dump()`")
  3. **Click Send button:** Click the **Send** button
  4. **Read Cursor's explanation:** Cursor displays an explanation. **Always check with your eyes** and **understand**

**Pages 15-16:**
- **Practice: Add features with Composer (Pages 15-16)**

**【Manga Part】**

**Manga Scene 8 (Page 15):**
- **Panel 1:** Alex thinks: "I want to add a feature to edit tasks..."
- **Alex (thinking):** "I want to add a feature to edit tasks, but I don't know **how to add it**..."

**Panel 2:** Alex opens Cursor's **Composer** (`⌘+I` / `Ctrl+I`) and instructs **"Add a feature to edit tasks to `todo.py`. Create a function called `edit_task(task_id, new_task)`"**.
- **Alex (input):** "Add a feature to edit tasks to `todo.py`. Create a function called `edit_task(task_id, new_task)`"

**Panel 3:** Composer adds a feature to edit tasks.
- **Composer (suggestion):** Adds the following code to `todo.py`:
  ```python
  def edit_task(task_id, new_task):
      """Edit a task"""
      tasks = load_tasks()
      for task in tasks:
          if task["id"] == task_id:
              task["task"] = new_task
              break
      save_tasks(tasks)
      print(f"Task edited: ID {task_id}")
  ```

**【Infographic Part】**

**Pages 15-16:**
- **Steps to add features with Composer:**
  1. **Open Composer:** Open Composer (`⌘+I` / `Ctrl+I`)
  2. **Enter instruction:** Describe the feature you want to add (e.g., "Add a feature to edit tasks to `todo.py`")
  3. **Click Generate button:** Click the **Generate** button
  4. **Check generated code:** **Always check with your eyes** the code displayed in the Composer panel. Understand **what feature was added**
  5. **Click Accept button:** Click the **Accept** button to add the feature

---

### **Section 14.3: Common Problems and Solutions (Pages 17-20)**

**【Manga Part】**

**Manga Scene 9 (Page 17):**
- **Panel 1:** Alex runs `python todo.py add "test"` in the terminal. An error appears.
- **Error message (example):**
  ```
  Traceback (most recent call last):
    File "todo.py", line 45, in main
      add_task(sys.argv[2])
  IndexError: list index out of range
  ```
- **Alex:** "An error appeared... I don't know **what to do**..."

**Panel 2:** David explains: "When an error appears, **reading error messages** is important."
- **David:** "Reading error messages tells you **where the problem is**. Paste error messages into Cursor's **Chat** and ask **'What is the cause of this error? How should I fix it?'** and it will tell you how to fix."

**Panel 3:** Alex pastes error messages into Cursor's **Chat** and asks how to fix.
- **Alex (input):** "What is the cause of this error? How should I fix it?"
- **Cursor (response):** "`IndexError: list index out of range` occurs when `sys.argv[2]` doesn't exist. Check the length of `sys.argv` before accessing: ..."

**【Infographic Part】**

**Pages 17-18:**
- **Common problems and solutions:**
  | Problem | Cause | Solution |
  |---------|-------|----------|
  | **`IndexError: list index out of range`** | `sys.argv` index is out of range | **Check `sys.argv` length** before accessing |
  | **`FileNotFoundError`** | File doesn't exist | **Check file existence** before accessing |
  | **`JSONDecodeError`** | JSON file format is incorrect | **Check JSON file format** |

**Pages 19-20:**
- **Steps to solve errors:**
  1. **Read error message:** Read error messages displayed in the terminal
  2. **Ask in Cursor Chat:** Paste error messages into Cursor's **Chat** (`⌘+L` / `Ctrl+L`) and ask **"What is the cause of this error? How should I fix it?"**
  3. **Check fix method:** Cursor suggests a fix method. **Always check with your eyes** and understand **why that fix solves the problem**
  4. **Apply fix:** Apply the fix and run again

---

### **Section 14.4: Completion and Testing (Pages 21-24)**

**【Manga Part】**

**Manga Scene 10 (Page 21):**
- **Panel 1:** David explains: "The ToDo app is complete, so let's **test** it."
- **David:** "Writing tests lets you **automatically verify that existing features aren't broken when you change code**. Ask Cursor's **Chat** or **Composer** to 'create `test_todo.py` and write test code for `todo.py`' and it will generate test code."

**Panel 2:** Alex is worried: "I don't know how to write tests..."
- **David:** "It's okay. Cursor generates them, so you just need to **understand test results**. However, **looking at generated tests and understanding what they test** helps you understand **test thinking**."

**Panel 3:** Alex leans forward: "I want to actually write tests in `todo_app`."
- **David:** "Let's ask Cursor's **Chat** 'create `test_todo.py` and write test code for `todo.py`'. Then experience the flow of creating test files with **Composer**."

**【Infographic Part】**

**Pages 21-22:**
- **Steps to write tests:**
  1. **Ask in Chat:** Open Chat (`⌘+L` / `Ctrl+L`) and ask **"Create `test_todo.py` and write test code for `todo.py`. Use `pytest` to test each function: `add_task()`, `delete_task()`, `complete_task()`, `list_tasks()`"**
  2. **Check Cursor's suggestion:** Cursor displays test code suggestions. **Always check with your eyes** and understand **what they test**
  3. **Generate with Composer:** Open Composer (`⌘+I` / `Ctrl+I`) and instruct **"Create `test_todo.py` and write test code for `todo.py`"**
  4. **Run tests:** Run `pytest test_todo.py` in the terminal

**Pages 23-24:**
- **How to use the completed ToDo app:**
  ```bash
  # Add a task
  python todo.py add "Go shopping"
  
  # List tasks
  python todo.py list
  
  # Complete a task
  python todo.py complete 1
  
  # Delete a task
  python todo.py delete 1
  ```

---

## 📝 Chapter Summary (Pages 25-26)

**【Manga Part】**

**Manga Scene 11 (Page 25):**
- **Panel 1:** David says: "In this chapter, we (1) built a ToDo app **step by step**, (2) **integrated** Cursor features (Tab, Chat, Composer, Agent), (3) learned **common problems** and their solutions, (4) learned how to **test** the completed app. That's what we covered."
- **Alex:** "The ToDo app is complete! I can now **integrate** Cursor features learned so far."

**Panel 2:** Alex reflects: "But sometimes I didn't know **where to use Cursor features**..."
- **David:** "It's okay. If we do it **step by step** together, you'll understand **where to use Cursor features**. If we solve **common problems** together, you can handle **the same problem next time**."

**Panel 3:** Alex asks: "What do we learn next?"
- **David:** "Next, let's build an **API integration app**. Let's learn how to integrate with external APIs."

**【Infographic Part】**

**Pages 25-26:**
- **What we learned in this chapter:**
  - ✅ Built a ToDo app **step by step**
  - ✅ **Integrated** Cursor features (Tab, Chat, Composer, Agent)
  - ✅ Learned **common problems** and their solutions
  - ✅ Learned how to **test** the completed app

- **ToDo app features:**
  1. **Add tasks:** `python todo.py add "task"`
  2. **Delete tasks:** `python todo.py delete [task_id]`
  3. **Complete tasks:** `python todo.py complete [task_id]`
  4. **List tasks:** `python todo.py list`

- **Next chapter:** Chapter 15 "Project 2 — Building an API Integration App"

---

**Chapter 14 - Complete**
