# Chapter 18: Solutions to Common Problems

## 📖 Chapter Overview

**Chapter Title:** Solutions to Common Problems  
**Page Count:** 20-22 pages (optimized for visual learning)  
**Learning Objectives:**
- Learn **how to handle errors** (reading error messages, fixing with Cursor, common errors and solutions)
- Learn **performance problems** and their solutions (slow code, high memory usage, etc.)
- Learn **security best practices** (password handling, API key management, input validation)

---

## 🎬 Story Structure

### **Opening Scene (Pages 1-2): Facing Common Problems**

**【Manga Part】**

**Setting:** Alex's apartment. The `daily_log` project is open, and Alex is using Cursor. Facing several problems.

**Manga Scene 1 (Page 1):**
- **Panel 1:** Alex runs `python log.py "test"` in the terminal. An error message appears.
- **Alex (thinking):** "An error appeared... I learned how to handle errors in Chapter 9, but I want to know more about **common errors** and their solutions."

**Panel 2:** Alex runs `log.py`, but processing is slow.
- **Alex (thinking):** "The code works, but **processing is slow**. It might be a performance problem. What should I do?"

**Panel 3:** David appears via video call.
- **David:** "Common problems have **patterns**. Let's learn how to handle errors, performance issues, and security best practices by creating and solving problems in `daily_log`."
- **Alex:** "Please teach me solutions to common problems."

**【Infographic Part】**

**Pages 1-2, bottom:**
- **What we'll learn in this chapter:** Solutions to common problems
- **Problem:** When errors occur, performance problems, security concerns
- **Solution:** **Read error messages** → **Handle with Cursor** → **Improve performance** → **Practice security best practices**
- **What to use:** Cursor's **Chat** (`⌘+L` / `Ctrl+L`), **Composer** (`⌘+I` / `Ctrl+I`), how to read error messages, how to improve performance, security best practices

---

### **Section 18.1: How to Handle Errors (Pages 3-9)**

**【Manga Part】**

**Manga Scene 2 (Page 3):**
- **Panel 1:** David explains: "When errors occur, **reading error messages** is the first step." Reviewing Chapter 9.
- **David:** "We learned how to read error messages in Chapter 9, but let's look at **common errors** and their solutions in more detail. Error messages contain **where the error occurred** (Traceback), **what kind of error** (error type), and **why it occurred** (cause)."

**Panel 2:** Alex asks: "What are common errors?"
- **David:** "Common errors include **`NameError`** (variable not defined), **`TypeError`** (wrong type), **`SyntaxError`** (syntax error), **`FileNotFoundError`** (file not found), **`IndentationError`** (indentation error), etc. Each has a **fixed solution**, so remembering them is useful."

**Panel 3:** Alex says: "I want to create common errors in `daily_log` and solve them."
- **David:** "Let's create common errors in `log.py` and experience the flow of solving them with Cursor."

**【Infographic Part】**

**Pages 3-4:**
- **Common errors and their solutions:**
  | Error Type | Cause | Solution |
  |------------|-------|----------|
  | **`NameError`** | Variable not defined | Define the variable, add `import` |
  | **`TypeError`** | Wrong type | Convert type correctly, use correct type |
  | **`SyntaxError`** | Syntax error | Fix syntax (missing closing parenthesis, missing colon, etc.) |
  | **`FileNotFoundError`** | File not found | Check file path, create file |
  | **`IndentationError`** | Indentation error | Align indentation correctly |
- **Point:** Common errors have **fixed solutions**. Reading error messages and **handling with Cursor** solves them quickly.

**【Manga Part】**

**Manga Scene 3-1 (Pages 4-5):**
- **Panel 1:** Alex creates a `NameError` in `log.py` (e.g., remove `import sys` and use `sys.argv`).
- **David:** "Let's create a `NameError` in `log.py`. Removing `import sys` and using `sys.argv` will show `NameError: name 'sys' is not defined`."

**Panel 2:** Alex runs `python log.py "test"` in the terminal, and an error message appears.
- **Error message (example):**
  ```
  Traceback (most recent call last):
    File "log.py", line 6, in main
      if len(sys.argv) < 2:
  NameError: name 'sys' is not defined
  ```
- **Alex:** "`NameError: name 'sys' is not defined` appeared. This means **`sys` is not defined**."

**Panel 3:** Alex opens Cursor's **Chat** (`⌘+L` / `Ctrl+L`), pastes the error message, and asks questions.
- **Alex (input):** "What is the cause of this error? How should I fix it?"
- **Cursor (response):** "This error occurs because the `sys` module is not imported. Add `import sys` at the top of `log.py`."
- **David:** "Cursor told us the **error cause** and **solution**. Adding `import sys` will fix it."

**【Manga Part】**

**Manga Scene 3-2 (Pages 5-6):**
- **Panel 1:** Alex opens Cursor's **Composer** (`⌘+I` / `Ctrl+I`) and enters fix instructions.
- **Alex (input):** "Add `import sys` at the top of `log.py`. Fix the error `NameError: name 'sys' is not defined`."
- **Visual representation:** Composer panel open, Alex entering fix instructions.

**Panel 2:** Cursor displays a fix suggestion, and Alex clicks the **Accept** button.
- **Alex:** "Cursor **automatically fixed** it. `import sys` was added."

**Panel 3:** Alex runs again in the terminal, and the error is resolved.
- **Alex:** "The error is resolved. I can ask Cursor for the **error cause** and **solution** and have it **automatically fix** it."

**【Text Part - Detailed Explanation】**

**Pages 6-7, bottom:**
- **Complete steps to handle errors (reproducible as-is):**
  1. **Read error message:** Read error messages displayed in the terminal. Check **Traceback** (where it occurred), **error type** (`NameError`, etc.), and **error content** (what the problem is)
  2. **Ask cause in Chat:** Open Chat (`⌘+L` / `Ctrl+L`), paste the error message, and ask **"What is the cause of this error? How should I fix it?"**. Click the **Send** button
  3. **Have Composer fix it:** Open Composer (`⌘+I` / `Ctrl+I`) and instruct **"Fix this error. It's on line XX of `log.py`. The error message is [paste error message]."**. Click the **Generate** button
  4. **Check fix suggestion:** **Always check with your eyes** the fix suggestion displayed in the Composer panel. Understand **why that fix solves it**
  5. **Click Accept:** If the fix suggestion is correct, click the **Accept** button
  6. **Run again and verify:** Run again in the terminal and verify the error is resolved

**【Manga Part】**

**Manga Scene 3-3 (Pages 7-8):**
- **Panel 1:** David explains: "Let's remember **solution patterns** for common errors."
- **David:** "(1) **`NameError`**: Variable not defined → Define the variable, add `import`. (2) **`TypeError`**: Wrong type → Convert type correctly, use correct type. (3) **`SyntaxError`**: Syntax error → Fix syntax (missing closing parenthesis, missing colon, etc.). (4) **`FileNotFoundError`**: File not found → Check file path, create file. (5) **`IndentationError`**: Indentation error → Align indentation correctly."

**Panel 2:** Alex asks: "How should I handle errors with Cursor?"
- **David:** "When errors occur, the flow **read error messages** → **ask cause in Chat** → **have Composer fix it** → **run again and verify** is recommended. As learned in Chapter 9, remembering this flow solves any error."

**Panel 3:** Alex says: "Please summarize solutions to common errors."
- **David:** "Let's summarize solutions to common errors in a **table format**."

**【Infographic Part】**

**Pages 8-9:**
- **Summary of solutions to common errors:**
  | Error Type | Cause | Solution | Handling with Cursor |
  |------------|-------|----------|---------------------|
  | **`NameError`** | Variable not defined | Define the variable, add `import` | Ask cause in Chat → Fix with Composer |
  | **`TypeError`** | Wrong type | Convert type correctly, use correct type | Ask cause in Chat → Fix with Composer |
  | **`SyntaxError`** | Syntax error | Fix syntax | Ask cause in Chat → Fix with Composer |
  | **`FileNotFoundError`** | File not found | Check file path, create file | Ask cause in Chat → Fix with Composer |
  | **`IndentationError`** | Indentation error | Align indentation correctly | Ask cause in Chat → Fix with Composer |
- **Point:** Common errors have **fixed solutions**. Reading error messages and **handling with Cursor** solves them quickly.

---

### **Section 18.2: Performance Problems and Solutions (Pages 9-15)**

**【Manga Part】**

**Manga Scene 4-1 (Page 9):**
- **Panel 1:** David explains: "Performance problems include **slow code**, **high memory usage**, **high CPU usage**, etc."
- **David:** "Performance problems include **code works but is slow**, **high memory usage**, **high CPU usage**, etc. Let's learn how to **improve performance** using Cursor."

**Panel 2:** Alex asks: "How do I find performance problems?"
- **David:** "You notice performance problems when **code works but is slow**, **high memory usage**, **high CPU usage**, etc. Paste code into Cursor's **Chat** and ask **'How can I improve this code's performance?'** and it will **suggest improvements**."

**Panel 3:** Alex says: "I want to create performance problems in `daily_log` and improve them."
- **David:** "Let's create performance problems in `log.py` and experience the flow of improving them with Cursor."

**【Manga Part】**

**Manga Scene 4-2 (Pages 10-11):**
- **Panel 1:** Alex creates performance problems in `log.py` (e.g., read the entire file every time in the `--day` feature).
- **David:** "In `log.py`'s `--day` feature, reading the entire file every time causes **performance problems**. With large log files, **processing becomes slow**."

**Panel 2:** Alex opens Cursor's **Chat** (`⌘+L` / `Ctrl+L`), pastes code, and asks questions.
- **Alex (input):** "How can I improve this code's performance? In the `--day` feature, reading the entire file every time makes processing slow."
- **Cursor (response):** "Ways to improve this code's performance include **reading the file line by line**, **processing only matching lines**, **using caching**, etc. Improvement methods: [code and explanation]"
- **David:** "Cursor told us **performance improvement methods**. There are several methods like **reading the file line by line**, **processing only matching lines**, **using caching**."

**Panel 3:** Alex says: "I want to implement improvement suggestions."
- **David:** "Let's implement improvement suggestions with **Composer**."

**【Manga Part】**

**Manga Scene 4-3 (Pages 11-12):**
- **Panel 1:** Alex opens Composer (`⌘+I` / `Ctrl+I`) and enters improvement instructions.
- **Alex (input):** "Improve the `--day` feature in `log.py` to read the file line by line and process only matching lines. Improve performance."
- **Visual representation:** Composer panel open, Alex entering improvement instructions.

**Panel 2:** Cursor implements improvements, and Alex clicks the **Accept** button.
- **Alex:** "Cursor **automatically improved** it. It now reads the file line by line and processes only matching lines."

**Panel 3:** Alex runs again in the terminal, and performance improves.
- **Alex:** "Performance improved. I can ask Cursor for **performance improvement methods** and have it **automatically improve** it."

**【Infographic Part】**

**Pages 12-13:**
- **Performance problems and solutions:**
  | Problem | Cause | Solution |
  |---------|-------|----------|
  | **Slow code** | Reading entire file, repeating unnecessary processing | Read file line by line, process only matching lines, use caching |
  | **High memory usage** | Loading large data at once | Load data in chunks, delete unnecessary data |
  | **High CPU usage** | Repeating heavy processing | Optimize processing, use parallel processing |
- **Point:** Performance problems can be improved quickly by **getting improvement suggestions from Cursor** and **implementing with Composer**.

**【Text Part - Detailed Explanation】**

**Page 13, bottom:**
- **Complete steps to improve performance problems (reproducible as-is):**
  1. **Identify problem:** Identify **performance problems** like code works but is slow, high memory usage, high CPU usage, etc.
  2. **Ask improvement methods in Chat:** Open Chat (`⌘+L` / `Ctrl+L`), paste code, and ask **"How can I improve this code's performance?"**. Click the **Send** button
  3. **Check improvement suggestions:** Check Cursor's improvement suggestions. Understand **why that improvement improves performance**
  4. **Implement with Composer:** Open Composer (`⌘+I` / `Ctrl+I`) and instruct **"Improve this code's performance. Improve XX."**. Click the **Generate** button
  5. **Check improvement suggestion:** **Always check with your eyes** the improvement suggestion displayed in the Composer panel. Understand **why that improvement improves performance**
  6. **Click Accept:** If the improvement suggestion is correct, click the **Accept** button
  7. **Run again and verify:** Run again in the terminal and verify performance improved

---

### **Section 18.3: Security Best Practices (Pages 14-19)**

**【Manga Part】**

**Manga Scene 5-1 (Page 14):**
- **Panel 1:** David explains: "Security best practices include **password handling**, **API key management**, **input validation**, etc."
- **David:** "Security best practices include **password handling** (don't save in plain text, hash), **API key management** (use environment variables, use `.env` files), **input validation** (validate user input, prevent SQL injection), etc. Let's learn how to **practice security best practices** using Cursor."

**Panel 2:** Alex asks: "How do I practice security best practices?"
- **David:** "For security best practices, paste code into **Cursor's Chat** and ask **'How can I improve this code's security?'** and it will **suggest improvements**. Especially for **password handling**, **API key management**, **input validation**, getting improvement suggestions is recommended."

**Panel 3:** Alex says: "I want to practice security best practices in `daily_log`."
- **David:** "Let's experience the flow of practicing security best practices in `log.py`."

**【Manga Part】**

**Manga Scene 5-2 (Pages 15-16):**
- **Panel 1:** Alex creates security problems in `log.py` (e.g., don't validate user input).
- **David:** "In `log.py`, not validating user input causes **security problems**. For example, if **path traversal** (like `../../../etc/passwd`) is entered, **unintended files** might be accessed."

**Panel 2:** Alex opens Cursor's **Chat** (`⌘+L` / `Ctrl+L`), pastes code, and asks questions.
- **Alex (input):** "How can I improve this code's security? User input is not validated."
- **Cursor (response):** "Ways to improve this code's security include **validating user input**, **preventing path traversal**, **normalizing file paths**, etc. Improvement methods: [code and explanation]"
- **David:** "Cursor told us **security improvement methods**. There are several methods like **validating user input**, **preventing path traversal**, **normalizing file paths**."

**Panel 3:** Alex says: "I want to implement improvement suggestions."
- **David:** "Let's implement improvement suggestions with **Composer**."

**【Manga Part】**

**Manga Scene 5-3 (Pages 16-17):**
- **Panel 1:** Alex opens Composer (`⌘+I` / `Ctrl+I`) and enters improvement instructions.
- **Alex (input):** "Improve `log.py` to validate user input and prevent path traversal. Improve security."
- **Visual representation:** Composer panel open, Alex entering improvement instructions.

**Panel 2:** Cursor implements improvements, and Alex clicks the **Accept** button.
- **Alex:** "Cursor **automatically improved** it. It now validates user input and prevents path traversal."

**Panel 3:** Alex says: "Please summarize security best practices."
- **David:** "Let's summarize security best practices in a **table format**."

**【Infographic Part】**

**Pages 17-18:**
- **Security best practices:**
  | Item | Content | Handling with Cursor |
  |------|---------|---------------------|
  | **Password handling** | Don't save in plain text, hash | Ask improvement methods in Chat → Implement with Composer |
  | **API key management** | Use environment variables, use `.env` files | Ask improvement methods in Chat → Implement with Composer |
  | **Input validation** | Validate user input, prevent SQL injection | Ask improvement methods in Chat → Implement with Composer |
  | **Prevent path traversal** | Normalize file paths, don't access unintended files | Ask improvement methods in Chat → Implement with Composer |
- **Point:** Security best practices can be practiced quickly by **getting improvement suggestions from Cursor** and **implementing with Composer**.

**【Text Part - Detailed Explanation】**

**Page 18, bottom:**
- **Complete steps to practice security best practices (reproducible as-is):**
  1. **Identify problem:** Identify **security problems** like password handling, API key management, input validation, etc.
  2. **Ask improvement methods in Chat:** Open Chat (`⌘+L` / `Ctrl+L`), paste code, and ask **"How can I improve this code's security?"**. Click the **Send** button
  3. **Check improvement suggestions:** Check Cursor's improvement suggestions. Understand **why that improvement improves security**
  4. **Implement with Composer:** Open Composer (`⌘+I` / `Ctrl+I`) and instruct **"Improve this code's security. Improve XX."**. Click the **Generate** button
  5. **Check improvement suggestion:** **Always check with your eyes** the improvement suggestion displayed in the Composer panel. Understand **why that improvement improves security**
  6. **Click Accept:** If the improvement suggestion is correct, click the **Accept** button
  7. **Run again and verify:** Run again in the terminal and verify security improved

---

### **Chapter Summary (Pages 19-20)**

**【Manga Part】**

**Manga Scene 6 (Page 19):**
- **Panel 1:** Alex looks at error resolution, performance improvement, and security improvement results with the `daily_log` project open.
- **Alex:** "I learned solutions to common problems and can now practice **error handling**, **performance improvement**, and **security best practices**."
- **David:** "That's the right feeling. Common problems have **patterns**, so handling them with Cursor solves them quickly."

**Panel 2:** David summarizes chapter points.
- **David:** "In this chapter, we (1) learned **how to handle errors** (reading error messages, fixing with Cursor, common errors and solutions), (2) learned **performance problems** and their solutions (slow code, high memory usage, etc.), (3) learned **security best practices** (password handling, API key management, input validation). That's what we covered."
- **Alex:** "I understand solutions to common problems."

**【Infographic Part】**

**Pages 19-20:**
- Chapter 18 summary:
  - ✅ **How to handle errors**: Read error messages → Ask cause in Chat → Fix with Composer → Run again and verify
  - ✅ **Common errors and solutions**: `NameError`, `TypeError`, `SyntaxError`, `FileNotFoundError`, `IndentationError`, etc.
  - ✅ **Performance problems** and solutions: Slow code, high memory usage, high CPU usage → Ask improvement methods in Chat → Implement with Composer
  - ✅ **Security best practices**: Password handling, API key management, input validation → Ask improvement methods in Chat → Implement with Composer
- **Practice checklist (try now):**
  - [ ] Create common errors in the `daily_log` project and solve them with Cursor
  - [ ] Create performance problems and improve them with Cursor
  - [ ] Practice security best practices

**【Manga Part】**

**Manga Scene 6-2 (Page 20):**
- **Panel 1:** Alex and David talk about the next chapter.
- **Alex:** "What's next?"
- **David:** "**Chapter 19** covers **continuing the learning journey** in detail. We'll learn how to read official documentation, engage with the community, and take next steps by experiencing them in `daily_log`."

**【Infographic Part】**

**Page 20:**
- Next chapter preview:
  - **Chapter 19: Continuing the Learning Journey**
  - How to read official documentation, engage with the community, next steps
  - Experiencing them in `daily_log`

---

**Chapter 18 - Complete**
