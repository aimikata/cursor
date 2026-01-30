# Chapter 10: Refactoring — Making Code Beautiful

## 📖 Chapter Overview

**Chapter Title:** Refactoring — Making Code Beautiful  
**Page Count:** 20-22 pages (optimized for visual learning)  
**Learning Objectives:**
- Understand the problem: "The code works, but can it be improved?"
- Learn **when to refactor** and understand **when refactoring should be done**
- Learn how to refactor code using Cursor's **Chat** and **Composer**
- **Understand refactoring changes** and learn **why those changes make the code better**

---

## 🎬 Story Structure

### **Opening Scene (Pages 1-2): What's the Problem?**

**【Manga Part】**

**Setting:** Alex's apartment. The `daily_log` project is open, and Alex is looking at `log.py`. The code works, but something feels off.

**Manga Scene 1 (Page 1):**
- **Panel 1:** Alex opens `log.py` and stares at the code, trying to remember what it does. It was written a week ago.
- **Visual representation:** Code in `log.py` is displayed (before refactoring):
  ```python
  # log.py - Append what you did today in one line to a log
  import sys
  from datetime import datetime

  def main():
      if len(sys.argv) < 2:
          print("Usage: python log.py \"what you did\"")
          print("Example: python log.py \"Wrote Chapter 3 draft\"")
          return
      line = " ".join(sys.argv[1:])
      now = datetime.now()
      log_file = "daily_log.txt"
      with open(log_file, "a", encoding="utf-8") as f:
          f.write(f"{now:%Y-%m-%d %H:%M} {line}\n")
      print(f"Logged: {now:%Y-%m-%d %H:%M} {line}")

  if __name__ == "__main__":
      main()
  ```
- **Alex (thinking):** "I wrote this code a week ago... Everything is written in the `main()` function. **I can't remember what it does**. Where does it get the log message, where does it write to the file—**everything is mixed in one function and I can't tell**."

**Panel 2:** Alex looks worried: "I want to add a feature, but I don't know where to add it."
- **Alex (thinking):** "I want to add a new feature, but since everything is written in the `main()` function, **I don't know where to add it**. The code works, but **reviewing it later is difficult**..."

**Panel 3:** David appears via video call.
- **David:** "It's great that the code works. However, having everything in the `main()` function makes **reviewing it later difficult**. When you want to **add features** or **fix bugs**, you don't know **where to fix**. Using Cursor's **Chat** or **Composer** to **organize code into functions** makes it **more readable and usable**."
- **Alex:** "What are the benefits of splitting into functions?"

**【Infographic Part】**

**Pages 1-2, bottom:**
- **What you'll learn in this chapter:** How to organize code for readability, how to improve code with Cursor
- **Problem:** Looking at the `main()` function in `log.py`, **everything is written in one function and it's hard to read**. A week later, **you can't remember what it does**. When you want to **add features** or **fix bugs**, you don't know **where to fix**.
- **Solution:** **Organize `main()` into functions** → Ask Cursor's **Chat** "Please refactor this code by splitting it into functions to make it more readable" → Have **Composer** actually improve the code → **Reviewing later becomes easier**
- **Benefits:** Splitting into functions: (1) **Makes it clear what it does**, (2) **Makes it clear where to add features**, (3) **Makes it clear where to fix bugs**, (4) **Reduces bugs** (when functions are short, it's easier to identify where errors occur), (5) **Makes it easier for others to understand**
- **What to use:** Cursor's **Chat** (`⌘+L` / `Ctrl+L`), **Composer** (`⌘+I` / `Ctrl+I`), code in `log.py`
- **Before/After comparison:**
  - **Before (before refactoring):** Everything is in the `main()` function → **Hard to understand what it does**
  - **After (after refactoring):** Split into `get_log_message()`, `write_log()`, `main()` → **Each function's role is clear and easy to understand**

---

### **Section 10.1: The Problem—"The Code Works, but Can It Be Improved?" (Pages 3-4)**

**【Manga Part】**

**Manga Scene 2 (Page 3):**
- **Panel 1:** David explains: "It's great that the code works. However, having everything in the `main()` function makes **reviewing it later difficult**."
- **David:** "For example, when you review it a week later, **you can't remember what it does**. When you want to **add features** or **fix bugs**, you don't know **where to fix**. **Organizing into functions** makes it easier to understand."

**Panel 2:** Alex asks: "But since the code works, **isn't there no need to fix it**?"
- **David:** "Even if the code works, there are **benefits to splitting into functions**. For example, look at `log.py`. Everything is in the `main()` function, but splitting it into **`get_log_message()`** (get log message), **`write_log()`** (write log), and **`main()`** (main processing) makes (1) **what it does clearer**, (2) **where to add new features clearer**, (3) **where to fix bugs clearer**, (4) **reduces bugs** (when functions are short, it's easier to identify where errors occur, and the scope of fixes is smaller, so it's less likely to affect other parts)."

**Panel 3:** Alex leans forward: "I want to actually refactor in `daily_log`."
- **David:** "Let's **organize `log.py` into functions**. Experience how to make it **more readable and usable** using Cursor."

**【Infographic Part】**

**Pages 3-4:**
- **Problem summary:**
  - When everything is in the `main()` function, **you can't remember what it does when reviewing a week later**
  - When you want to **add features** or **fix bugs**, you don't know **where to fix**
  - **Others (or future you) can't understand what the code does** when they look at it
- **Solution approach:** **Organize `main()` into functions** → Instruct Cursor's **Chat** or **Composer** to refactor → **Reviewing later becomes easier**
- **Benefits of splitting into functions:**
  - **Makes it clear what it does** (each function's role is clear)
  - **Makes it clear where to add new features** (you know where to add)
  - **Makes it clear where to fix bugs** (easier to identify problem areas)
  - **Reduces bugs** (when functions are short, it's easier to identify where errors occur. The scope of fixes is smaller, so it's less likely to affect other parts)
  - **Makes it easier for others to understand** (important in team development)
  - With Cursor, you can **automatically organize into functions**
- **Before/After comparison (visually clear):**
  - **Before (before refactoring):**
    - Everything is in the `main()` function
    - **Problems:** Hard to understand what it does, don't know where to add features, **don't know where the cause is when errors occur**
  - **After (after refactoring):**
    - Split into `get_log_message()` (get log message), `write_log()` (write log), `main()` (main processing)
    - **Improvements:** Each function's role is clear, where to add features is clear, where to fix bugs is clear, **can quickly identify the cause function when errors occur**

---

### **Section 10.2: When to Refactor (Pages 5-8)**

**【Manga Part】**

**Manga Scene 3-1 (Page 5):**
- **Panel 1:** David explains: "Let's understand the **timing** for refactoring."
- **David:** "Refactoring can be done anytime, but there are **appropriate times**. For example, when (1) **code is too long**, (2) **same code is repeated**, (3) **function names are unclear**, (4) **comments are needed because it's complex**, those are signs to refactor."

**Panel 2:** Alex looks at `log.py` and asks: "Everything is in the `main()` function. Is this a sign to refactor?"
- **David:** "Yes. When everything is in the `main()` function, **you can't remember what it does when reviewing a week later**, and **you don't know where to add features**. **Splitting into functions** makes it easier to understand. For example, splitting into `get_log_message()` (get log message), `write_log()` (write log), `main()` (main processing) makes **what it does clearer** and **where to add new features clearer**. Also, **when errors occur, you can quickly identify the cause function**, making bug fixes easier."

**Panel 3:** Alex is worried: "But I don't know **where to start**."
- **David:** "It's okay. Ask Cursor's **Chat** **'Please refactor this code by splitting it into functions to make it more readable.'** and it will suggest a refactoring plan."

**【Infographic Part】**

**Pages 5-6:**
- **When to refactor (times when splitting into functions is useful):**
  | Sign | Example | What to do | **Benefits** |
  |------|---------|------------|-------------|
  | **Code is too long** | `main()` function is 50+ lines | **Split into functions** | **Makes it clear what it does. Makes it clear where to add features. Can quickly identify the cause function when errors occur** |
  | **Same code is repeated** | Same processing 3+ times | **Combine into a function** | **Fix one place and all are fixed. Bug fixes become easier. Scope of fixes is smaller, so less likely to affect other parts** |
  | **Function names are unclear** | `do_stuff()`, `process()` | **Change to clearer names** | **Can understand what it does just by looking at the code. Comments become unnecessary** |
  | **Comments needed because it's complex** | Can't understand without comments explaining | **Simplify the code** | **The code itself becomes the explanation. Reviewing later becomes easier. Bugs are easier to find** |
- **Point:** Splitting into functions makes **reviewing later easier**. **Makes it clear where to add features**. **Makes it clear where to fix bugs**. **Reduces bugs** (when functions are short, it's easier to identify where errors occur). With Cursor, you can **automatically organize into functions**.

**【Manga Part】**

**Manga Scene 3-2 (Pages 6-7):**
- **Panel 1:** Alex looks at `log.py` and understands: "Everything is in the `main()` function. **Splitting into functions** makes it more readable, right?"
- **David:** "Right. For example, splitting into `get_log_message()` (get log message), `write_log()` (write log), `main()` (main processing) makes it more readable. Let's ask Cursor's **Chat** **'Please refactor this code by splitting it into functions to make it more readable.'**"

**Panel 2:** Alex opens Cursor's **Chat** (`⌘+L` / `Ctrl+L`).
- **David:** "After opening Chat, open `log.py` and ask **'Please refactor this code by splitting it into functions to make it more readable. Everything is in the `main()` function, so please split it into `get_log_message()` (get log message), `write_log()` (write log), `main()` (main processing).'**"
- **Visual representation:** Chat panel opens, and Alex types a refactoring instruction.

**Panel 3:** Cursor suggests a refactoring plan.
- **Cursor (response):** "I've refactored `log.py` by splitting it into functions. Splitting into `get_log_message()` (get log message), `write_log()` (write log), `main()` (main processing) makes the code more readable. Changes: [code and explanation]"
- **Alex:** "Splitting into functions makes it **more readable**. I also got the changes."

**【Infographic Part】**

**Pages 7-8:**
- **Steps to judge when to refactor:**
  1. **Look at the code:** Code is too long, same code is repeated, function names are unclear, comments are needed because it's complex, etc.
  2. **Check refactoring signs:** Check if the above signs exist
  3. **Consult with Cursor Chat:** Ask Chat **"Please refactor this code by splitting it into functions to make it more readable."**
  4. **Check refactoring plan:** Check Cursor's suggestion and understand **why those changes make the code better**
- **Point:** Refactoring is **improving code structure without changing behavior**. With Cursor, you can **automatically refactor**.

**【Text Part - Detailed Explanation】**

**Page 8, bottom:**
- **Complete steps to judge when to refactor (reproducible):**
  1. **Look at the code:** Open `log.py` and look at the code. Everything is in the `main()` function, same code is repeated, function names are unclear, comments are needed because it's complex, etc.
  2. **Check refactoring signs:** Check if the above signs exist. For example, `main()` function is 50+ lines, same processing 3+ times, function names like `do_stuff()` or `process()`
  3. **Consult with Cursor Chat:** Open Chat (`⌘+L` / `Ctrl+L`) and type **"Please refactor this code by splitting it into functions to make it more readable. Everything is in the `main()` function, so please split it into `get_log_message()` (get log message), `write_log()` (write log), `main()` (main processing)."**. Click the **Send** button
  4. **Check refactoring plan:** Cursor suggests a refactoring plan. **Always check with your eyes** and understand **why those changes make the code better**

---

### **Section 10.3: Asking Cursor to Refactor (Pages 9-14)**

**【Manga Part】**

**Manga Scene 4-1 (Page 9):**
- **Panel 1:** David explains: "You can use Cursor's **Composer** to **automatically refactor** code."
- **David:** "If you instruct Composer **'Please refactor this code by splitting it into functions to make it more readable. Everything is in the `main()` function, so please split it into `get_log_message()` (get log message), `write_log()` (write log), `main()` (main processing).'**, Cursor will **refactor the code** for you. The recommended flow is to consult in Chat first, then refactor with Composer."

**Panel 2:** Alex opens Composer (`⌘+I` / `Ctrl+I`) and types a refactoring instruction.
- **Alex (input):** "Please refactor `log.py` by splitting it into functions to make it more readable. Everything is in the `main()` function, so please split it into `get_log_message()` (get log message), `write_log()` (write log), `main()` (main processing)."
- **David:** "You've written **what to refactor** and **how to refactor** specifically. With this level of specificity, Cursor is less likely to get confused."

**Panel 3:** Alex clicks the **Generate** button. Cursor refactors the code.
- **Visual representation:** A refactoring plan appears in the Composer panel. **Before/After comparison** is displayed:
  
  **Before (before refactoring):**
  ```python
  # log.py - Append what you did today in one line to a log
  import sys
  from datetime import datetime

  def main():
      if len(sys.argv) < 2:
          print("Usage: python log.py \"what you did\"")
          print("Example: python log.py \"Wrote Chapter 3 draft\"")
          return
      line = " ".join(sys.argv[1:])
      now = datetime.now()
      log_file = "daily_log.txt"
      with open(log_file, "a", encoding="utf-8") as f:
          f.write(f"{now:%Y-%m-%d %H:%M} {line}\n")
      print(f"Logged: {now:%Y-%m-%d %H:%M} {line}")

  if __name__ == "__main__":
      main()
  ```
  **→ Problem:** Everything is in the `main()` function. **Hard to understand what it does**.

  **After (after refactoring):**
  ```python
  # log.py - Append what you did today in one line to a log
  import sys
  from datetime import datetime

  def get_log_message(args):
      """Get log message from command-line arguments"""
      if len(args) < 2:
          return None
      return " ".join(args[1:])

  def write_log(message):
      """Write log message to file"""
      now = datetime.now()
      log_file = "daily_log.txt"
      with open(log_file, "a", encoding="utf-8") as f:
          f.write(f"{now:%Y-%m-%d %H:%M} {message}\n")
      print(f"Logged: {now:%Y-%m-%d %H:%M} {message}")

  def main():
      """Main processing"""
      message = get_log_message(sys.argv)
      if message is None:
          print("Usage: python log.py \"what you did\"")
          print("Example: python log.py \"Wrote Chapter 3 draft\"")
          return
      write_log(message)

  if __name__ == "__main__":
      main()
  ```
  **→ Improvement:** Split into `get_log_message()`, `write_log()`, `main()`. **Each function's role is clear and easy to understand**.

- **Alex:** "Cursor **automatically refactored** it. Comparing Before/After, I can see that **splitting into functions makes it more readable**."

**【Manga Part】**

**Manga Scene 4-2 (Pages 10-11):**
- **Panel 1:** Alex checks the refactoring plan and clicks the **Accept** button.
- **David:** "**Always check** the refactoring plan before Accept. Cursor's suggestions are **helpers**; you make the final judgment. Also check that **code behavior hasn't changed**."

**Panel 2:** Alex runs `python log.py "test"` in the terminal. It works normally.
- **Visual representation:** Terminal shows "Logged: 2025-01-21 14:30 test" and one line is appended to `daily_log.txt`.
- **Alex:** "After refactoring, it still **works normally**. Code behavior hasn't changed, but it became **more readable**."

**Panel 3:** Alex asks: "Should I use Chat and Composer every time I refactor?"
- **David:** "Yes. The flow of **consult in Chat** → **refactor with Composer** is recommended. However, understanding **refactoring thinking** gradually helps you **judge yourself**."

**【Infographic Part】**

**Pages 11-12:**
- **Flow of refactoring with Cursor:**
  1. **Look at the code:** Code is too long, same code is repeated, function names are unclear, comments are needed because it's complex, etc.
  2. **Consult in Chat:** Ask Chat **"Please refactor this code by splitting it into functions to make it more readable."**
  3. **Refactor with Composer:** Instruct Composer **"Please refactor this code by splitting it into functions to make it more readable. Everything is in the `main()` function, so please split it into `get_log_message()` (get log message), `write_log()` (write log), `main()` (main processing)."** and let Cursor refactor
  4. **Check refactoring plan:** **Always check** the refactoring plan before Accept. **Compare Before/After** and check that **code behavior hasn't changed**
  5. **Re-run and verify:** Re-run in terminal and verify it still works normally after refactoring
- **Before/After comparison points:**
  - **Before:** Everything is in the `main()` function → **Hard to understand what it does**
  - **After:** Split into `get_log_message()`, `write_log()`, `main()` → **Each function's role is clear and easy to understand**
- **Point:** The flow of consult in Chat → refactor with Composer is recommended. **Comparing Before/After** makes it easy to see **why refactoring is needed**.

**【Text Part - Detailed Explanation】**

**Page 12, bottom:**
- **Complete steps to refactor with Cursor (reproducible):**
  1. **Look at the code:** Open `log.py` and look at the code. Code is too long, same code is repeated, function names are unclear, comments are needed because it's complex, etc.
  2. **Consult in Chat:** Open Chat (`⌘+L` / `Ctrl+L`) and type **"Please refactor this code by splitting it into functions to make it more readable. Everything is in the `main()` function, so please split it into `get_log_message()` (get log message), `write_log()` (write log), `main()` (main processing)."**. Click the **Send** button
  3. **Refactor with Composer:** Open Composer (`⌘+I` / `Ctrl+I`), instruct **"Please refactor `log.py` by splitting it into functions to make it more readable. Everything is in the `main()` function, so please split it into `get_log_message()` (get log message), `write_log()` (write log), `main()` (main processing)."**, and click the **Generate** button
  4. **Check refactoring plan:** **Always check with your eyes** the refactoring plan displayed in the Composer panel. Understand **why those changes make the code better**. Also check that **code behavior hasn't changed**
  5. **Click Accept:** If you judge the refactoring plan is correct, click the **Accept** button
  6. **Re-run and verify:** Re-run `python log.py "test"` in the terminal and verify it still works normally after refactoring

**【Manga Part】**

**Manga Scene 4-3 (Pages 13-14):**
- **Panel 1:** Alex asks: "After refactoring, it became **more readable**. But are there **other places that can be refactored**?"
- **David:** "For example, adding **error handling** or **separating settings into constants**. However, **you don't need to do everything at once**. **Improve gradually**."

**Panel 2:** Alex asks: "How long do I continue refactoring?"
- **David:** "Refactoring has **no end**. However, **not seeking perfection too much** is important. **If the code is readable, usable, and maintainable, that's OK**. With Cursor, you can **refactor anytime**, so **improve gradually**."

**Panel 3:** Alex understands: "Understanding refactoring thinking helps me **judge myself**."
- **David:** "Right. Understanding **refactoring thinking** gradually helps you **judge yourself**. However, with Cursor, you can refactor **faster and more accurately**, so **use it actively**."

---

### **Section 10.4: Understanding the Changes (Pages 15-17)**

**【Manga Part】**

**Manga Scene 5-1 (Page 15):**
- **Panel 1:** David explains: "After refactoring, **understanding the changes** is important."
- **David:** "Cursor refactored it, but if you don't understand **why those changes make the code better**, you can't handle **the same problem next time**. **Understand the changes** and learn **refactoring thinking**."

**Panel 2:** Alex asks: "What changed in the refactoring of `log.py`?"
- **David:** "Let's compare Before/After. **Before (before refactoring)** had everything in the `main()` function. **After (after refactoring)** split it into `get_log_message()` (get log message), `write_log()` (write log), `main()` (main processing). This makes **each function's role clear** and **more readable**."
- **Visual representation:** Before/After comparison is displayed:
  - **Before:** Everything is in the `main()` function → **Hard to understand what it does**
  - **After:** Split into `get_log_message()`, `write_log()`, `main()` → **Each function's role is clear and easy to understand**

**Panel 3:** Alex asks: "**Why do those changes make the code better**?"
- **David:** "For example, **splitting into functions** has benefits: (1) **each function's role becomes clear**, (2) **becomes easier to test**, (3) **becomes easier to reuse**, (4) **reduces bugs** (when functions are short, it's easier to identify where errors occur. The scope of fixes is smaller, so it's less likely to affect other parts). Ask Cursor's **Chat** **'Why does this refactoring make the code better?'** and it will explain clearly."

**【Manga Part】**

**Manga Scene 5-2 (Pages 16-17):**
- **Panel 1:** Alex opens Cursor's **Chat** (`⌘+L` / `Ctrl+L`) and asks about the changes.
- **Alex (input):** "In the refactoring of `log.py`, code that was all in the `main()` function was split into `get_log_message()` (get log message), `write_log()` (write log), `main()` (main processing). Why does this refactoring make the code better?"
- **Cursor (response):** "Reasons this refactoring makes the code better: (1) **each function's role became clear** (`get_log_message()` gets log message, `write_log()` writes log, `main()` is main processing), (2) **became easier to test** (can test each function individually), (3) **became easier to reuse** (can use `write_log()` elsewhere), (4) **became more readable** (each function's role is clear, code flow is easy to understand), (5) **reduces bugs** (when functions are short, it's easier to identify where errors occur. The scope of fixes is smaller, so it's less likely to affect other parts)."
- **Alex:** "**Each function's role became clear** and it became **more readable**. It also **became easier to test** and **easier to reuse**. Also, **reducing bugs** is an important benefit."

**Panel 2:** Alex says: "I want to be able to **judge myself** when I face the same problem next time."
- **David:** "That's the right feeling. Understanding **refactoring thinking** gradually helps you **judge yourself**. However, with Cursor, you can refactor **faster and more accurately**, so **use it actively**."

**Panel 3:** Alex understands: "Understanding refactoring thinking helps me **be conscious when writing code** too."
- **David:** "Right. Understanding **refactoring thinking** helps you **be conscious when writing code** too. For example, being conscious of **splitting into functions**, **using clear names**, **reducing comments** helps you write **readable code from the start**."

**【Infographic Part】**

**Pages 16-17:**
- **Understanding refactoring changes:**
  | Change | Why it's better | Example |
  |--------|-----------------|---------|
  | **Split into functions** | Each function's role becomes clear, becomes easier to test, becomes easier to reuse, **can quickly identify the cause function when errors occur** | Split code that was all in `main()` into `get_log_message()`, `write_log()`, `main()` |
  | **Use clear names** | Code intent becomes clear | `do_stuff()` → `get_log_message()` |
  | **Reduce comments** | Code itself becomes the explanation | Change parts that needed comments to clear code |
- **Before/After comparison (visually clear):**
  - **Before (before refactoring):**
    - Everything is in the `main()` function
    - **Problems:** Hard to understand what it does, don't know where to add features, don't know where to fix bugs, **don't know where the cause is when errors occur**
  - **After (after refactoring):**
    - Split into `get_log_message()` (get log message), `write_log()` (write log), `main()` (main processing)
    - **Improvements:** Each function's role is clear, where to add features is clear, where to fix bugs is clear, **can quickly identify the cause function when errors occur** (functions are short, so the scope of fixes is smaller)
- **Point:** After refactoring, **understanding the changes** is important. **Comparing Before/After** makes it easy to see **why those changes make the code better**. You can handle **the same problem next time**.

**【Text Part - Detailed Explanation】**

**Page 17, bottom:**
- **Complete steps to understand refactoring changes (reproducible):**
  1. **Check refactoring plan:** **Always check with your eyes** the refactoring plan displayed in the Composer panel. Check **what changed**
  2. **Ask in Chat:** Open Chat (`⌘+L` / `Ctrl+L`) and ask **"Why does this refactoring make the code better?"**. Click the **Send** button
  3. **Read Cursor's explanation:** Cursor explains the changes and **why those changes make the code better**. **Always check with your eyes** and understand **why those changes make the code better**
  4. **Think yourself:** After reading Cursor's explanation, **think yourself**. Be able to explain **why those changes make the code better** in your own words
  5. **Apply next time:** Understand **refactoring thinking** and be able to handle **the same problem next time**

---

### **Chapter Summary (Pages 18-19)**

**【Manga Part】**

**Manga Scene 6 (Page 18):**
- **Panel 1:** Alex looks at the refactored code with `log.py` open.
- **Alex:** "With the flow of **consult in Chat** → **refactor with Composer** → **understand changes**, the code became **more readable**. I also understood refactoring thinking."
- **David:** "That's the right feeling. Refactoring is **improving code structure without changing behavior**. With Cursor, you can **automatically refactor**, so **use it actively**."

**Panel 2:** David summarizes the chapter points.
- **David:** "In this chapter, we (1) learned that even when code works, there are ways to make it **more readable and usable**, (2) understood refactoring **timing** (code is too long, same code is repeated, function names are unclear, comments are needed because it's complex), (3) used Cursor's **Chat** and **Composer** to refactor code, (4) **understood refactoring changes** and learned **why those changes make the code better**. That's what we covered."
- **Alex:** "Yes. I learned that understanding refactoring thinking helps me **be conscious when writing code**."

**【Infographic Part】**

**Pages 18-19:**
- Chapter 10 summary:
  - ✅ Even when code works, there are ways to make it **more readable and usable**. Refactoring is **improving code structure without changing behavior**
  - ✅ Understand refactoring **timing**: code is too long, same code is repeated, function names are unclear, comments are needed because it's complex
  - ✅ Consult with Cursor's **Chat** (`⌘+L` / `Ctrl+L`) first, then refactor with **Composer** (`⌘+I` / `Ctrl+I`). **Always check** refactoring plans before Accept
  - ✅ **Understand refactoring changes** and learn **why those changes make the code better**. Understanding **refactoring thinking** helps you handle **the same problem next time**
  - ✅ Understanding **refactoring thinking** helps you **be conscious when writing code** too
  - ✅ **Benefits of splitting into functions:** Makes it clear what it does, makes it clear where to add features, **reduces bugs** (when functions are short, it's easier to identify where errors occur. The scope of fixes is smaller, so it's less likely to affect other parts)
- **Practice Checklist (try right away):**
  - [ ] Open the `daily_log` project in Cursor
  - [ ] Look at `log.py` and check for refactoring signs (code is too long, same code is repeated, function names are unclear, comments are needed because it's complex)
  - [ ] Open Chat (`⌘+L` / `Ctrl+L`) and consult about refactoring
  - [ ] Open Composer (`⌘+I` / `Ctrl+I`) and enter refactoring instruction
  - [ ] Check refactoring plan and Accept, then re-run to verify it still works normally
  - [ ] Ask in Chat about the changes and understand **why those changes make the code better**

**【Manga Part】**

**Manga Scene 6-2 (Page 19):**
- **Panel 1:** Alex and David talk about the next chapter.
- **Alex:** "What's next?"
- **David:** "In **Chapter 11**, we'll cover **test generation** in detail. After writing code, **writing tests** is important. However, **writing tests manually is tedious**. We'll learn how to **automatically generate tests** using Cursor."

**【Infographic Part】**

**Page 19:**
- Next chapter preview:
  - **Chapter 11: Test Generation — No More Writing Tests Manually**
  - After writing code, **writing tests** is important
  - Learn how to **automatically generate tests** using Cursor

---

## ✅ Review Points

Points to check in this Japanese translation (same criteria as Chapter 9: **thoroughness, clarity, practicality**):

1. **Clarity of the problem:** Does the reader understand the difficulty of "The code works, but can it be improved?"?
2. **Refactoring timing:** Are explanations of code being too long, same code being repeated, function names being unclear, comments being needed because it's complex clear even for beginners?
3. **How to consult in Chat:** Are the **specific operations** (ask **"Please refactor this code by splitting it into functions to make it more readable."**) reproducible so readers can **follow the steps exactly**?
4. **How to refactor with Composer:** Are the **specific operations** (instruct **"Please refactor this code by splitting it into functions to make it more readable. Everything is in the `main()` function, so please split it into `get_log_message()` (get log message), `write_log()` (write log), `main()` (main processing)."**) reproducible so readers can **follow the steps exactly**?
5. **Detailed explanation:** Does "Text Part - Detailed Explanation" include **complete reproducible steps** like **how to open Chat**, **how to open Composer**, **Send/Generate/Accept button positions**, etc.?
6. **Familiarity of examples:** Are examples of refactoring using `log.py` in `daily_log` easy for beginners to try?
7. **Understanding changes:** Is the flow of understanding **why those changes make the code better** organized clearly in a **table format**?
8. **Connection to next chapter:** Does it naturally lead to Chapter 11's test generation (automatically generating tests)?

---

**Chapter 10 - Complete**
