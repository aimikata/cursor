# Chapter 11: Test Generation — No More Writing Tests Manually

## 📖 Chapter Overview

**Chapter Title:** Test Generation — No More Writing Tests Manually  
**Page Count:** 20-22 pages (optimized for visual learning)  
**Learning Objectives:**
- Understand the problems: "I don't know how to write tests" and "Do I need to write tests?"
- Understand **why tests are needed** (even when code works, it might break when changed later, can catch bugs early, etc.)
- Learn how to automatically generate tests using Cursor's **Chat** and **Composer**
- Learn how to run generated tests and **understand test results**

---

## 🎬 Story Structure

### **Opening Scene (Pages 1-2): What's the Problem?**

**【Manga Part】**

**Setting:** Alex's apartment. The `daily_log` project is open, and Alex is using `log.py`. After refactoring in Chapter 10, Alex is trying to add a new feature.

**Manga Scene 1 (Page 1):**
- **Panel 1:** Alex opens `log.py` and tries to improve the `--day` feature. "When I specify a date with `--day`, I want it to display 'No log for that day' if the date doesn't exist."
- **Alex (thinking):** "But I'm worried existing features might break... What if changing `--day` makes the normal log append feature stop working?"

**Panel 2:** Alex runs `python log.py "test"` in the terminal to verify the normal log append works.
- **Alex (thinking):** "It works now, but **it might break when changed later**. However, **manually checking every time is tedious**..."

**Panel 3:** David appears via video call.
- **David:** "You can solve that by writing **tests**. Writing tests lets you **automatically verify that existing features aren't broken when you change code**. Ask Cursor's **Chat** or **Composer** to 'generate tests for `log.py`' and it will automatically generate test code."
- **Alex:** "How do I write tests? Also, **the code works, so do I need to write tests?**"

**【Infographic Part】**

**Pages 1-2, bottom:**
- **What you'll learn in this chapter:** How to write tests, how to automatically generate tests with Cursor
- **Problem:** Don't know how to write tests, **the code works, so do I need to write tests?**
- **Solution:** Understand **why tests are needed** → Instruct Cursor's **Chat** or **Composer** to generate tests → Run tests and verify
- **Benefits:** (1) **Can automatically verify that existing features aren't broken when you change code**, (2) **can catch bugs early**, (3) **can change code with confidence**, (4) **makes it easier for others to understand** (tests become examples of how to use the code)
- **What to use:** Cursor's **Chat** (`⌘+L` / `Ctrl+L`), **Composer** (`⌘+I` / `Ctrl+I`), Python's `pytest` (test framework)

---

### **Section 11.1: The Problem—"I Don't Know How to Write Tests" and "Do I Need to Write Tests?" (Pages 3-4)**

**【Manga Part】**

**Manga Scene 2 (Page 3):**
- **Panel 1:** David explains: "First, let's understand **why tests are needed**."
- **David:** "The code works, but **it might break when changed later**. For example, when improving the `--day` feature in `log.py`, the normal log append feature might stop working. **Writing tests lets you automatically verify that existing features aren't broken when you change code**."

**Panel 2:** Alex asks: "But **can't I just check manually every time?**"
- **David:** "Manual checking **takes time** and has a **risk of oversight**. Writing tests lets you **verify everything with one command**. Also, **when others change code**, running tests verifies it isn't broken."

**Panel 3:** Alex is worried: "I don't know how to write tests..."
- **David:** "It's okay. Ask Cursor's **Chat** or **Composer** to 'generate tests for `log.py`' and it will automatically generate test code. **You don't need to learn how to write tests**. Cursor generates them, so you just need to **understand test results**."

**【Infographic Part】**

**Pages 3-4:**
- **Problem summary:**
  - Don't know how to write tests
  - **The code works, so do I need to write tests?**
  - Don't know what happens if you don't write tests
- **Solution approach:** Understand **why tests are needed** → Instruct Cursor's **Chat** or **Composer** to generate tests → Run tests and verify
- **What happens if you don't write tests:**
  - **Don't notice when existing features break after changing code**
  - **Bug discovery is delayed** (notice after errors appear in production)
  - **Can't change code with confidence** (hesitate to change for fear of breaking)
  - **Can't verify when others change code that it isn't broken**
- **What happens if you write tests:**
  - **Can automatically verify that existing features aren't broken when you change code**
  - **Can catch bugs early** (running tests immediately shows problems)
  - **Can change code with confidence** (if tests pass, you know it isn't broken)
  - **Makes it easier for others to understand** (tests become examples of how to use the code)

---

### **Section 11.2: Why Tests Are Needed (Pages 5-8)**

**【Manga Part】**

**Manga Scene 3 (Page 5):**
- **Panel 1:** David explains: "Let's see specifically **what happens if you don't write tests**."
- **David:** "For example, when improving the `--day` feature in `log.py`, you might not notice that **the normal log append feature broke**. If you have tests, you can **verify everything with one command**."

**Panel 2:** Alex asks: "But **it works now, so do I need to write tests?**"
- **David:** "It works now, but **it might break when changed later**. Writing tests lets you **automatically verify that existing features aren't broken when you change code**. Also, **catching bugs early** means you can solve problems much earlier than **noticing after errors appear in production**."

**Panel 3:** Alex asks: "What are the benefits of writing tests?"
- **David:** "Writing tests has benefits: (1) **can automatically verify that existing features aren't broken when you change code**, (2) **can catch bugs early** (running tests immediately shows problems), (3) **can change code with confidence** (if tests pass, you know it isn't broken), (4) **makes it easier for others to understand** (tests become examples of how to use the code)."

**【Infographic Part】**

**Pages 5-8:**
- **What happens if you don't write tests:**
  | Situation | Problem | Result |
  |-----------|---------|--------|
  | **When changing code** | Don't notice existing features broke | **Notice after errors appear in production** |
  | **When discovering bugs** | Discovery is delayed | **Notice after users are affected** |
  | **When changing code** | Hesitate to change for fear of breaking | **Improvements don't progress** |
  | **When others change code** | Can't verify it isn't broken | **Team development becomes difficult** |

- **What happens if you write tests:**
  | Situation | Benefit | Result |
  |-----------|---------|--------|
  | **When changing code** | Can automatically verify existing features aren't broken | **Can change code with confidence** |
  | **When discovering bugs** | Can catch early (running tests immediately shows problems) | **Can notice before errors appear in production** |
  | **When changing code** | If tests pass, you know it isn't broken | **Improvements progress** |
  | **When others change code** | Running tests verifies it isn't broken | **Team development goes smoothly** |

- **Benefits of tests:**
  1. **Can automatically verify that existing features aren't broken when you change code**
  2. **Can catch bugs early** (running tests immediately shows problems)
  3. **Can change code with confidence** (if tests pass, you know it isn't broken)
  4. **Makes it easier for others to understand** (tests become examples of how to use the code)

---

### **Section 11.3: Generating Tests with Cursor (Pages 9-16)**

**【Manga Part】**

**Manga Scene 4 (Page 9):**
- **Panel 1:** David explains: "Let's generate tests for `log.py` with Cursor."
- **David:** "Ask Cursor's **Chat** or **Composer** to 'Generate tests for `log.py`. Use `pytest` to create test code that tests each function: `get_log_message()`, `write_log()`, `main()`' and it will automatically generate test code."

**Panel 2:** Alex asks: "Do I need to learn how to write tests?"
- **David:** "**You don't need to learn how to write tests**. Cursor generates them, so you just need to **understand test results**. However, **looking at generated tests and understanding what they test** helps you understand **test thinking**."

**Panel 3:** Alex leans forward: "I want to actually generate tests in `daily_log`."
- **David:** "Let's ask Cursor's **Chat** to 'generate tests for `log.py`'. Then experience the flow of creating test files with **Composer**."

**【Infographic Part】**

**Pages 9-10:**
- **Flow of generating tests with Cursor:**
  1. **Ask in Chat:** Open Chat (`⌘+L` / `Ctrl+L`) and ask **"Generate tests for `log.py`. Use `pytest` to create test code that tests each function: `get_log_message()`, `write_log()`, `main()`"**. Click the **Send** button
  2. **Check Cursor's suggestion:** Cursor displays test code suggestions. **Always check with your eyes** and understand **what they test**
  3. **Generate with Composer:** Open Composer (`⌘+I` / `Ctrl+I`) and instruct **"Create a file called `test_log.py` and write test code for `log.py`. Use `pytest` to test each function: `get_log_message()`, `write_log()`, `main()`"**. Click the **Generate** button
  4. **Check generated tests:** **Always check with your eyes** the test code displayed in the Composer panel. Understand **what they test**

**Pages 11-12:**
- **Practice: Consult about test generation in Chat (Pages 11-12)**

**【Manga Part】**

**Manga Scene 5 (Page 11):**
- **Panel 1:** Alex opens Cursor's **Chat** (`⌘+L` / `Ctrl+L`) and types **"Generate tests for `log.py`. Use `pytest` to create test code that tests each function: `get_log_message()`, `write_log()`, `main()`"**.
- **Alex (input):** "Generate tests for `log.py`. Use `pytest` to create test code that tests each function: `get_log_message()`, `write_log()`, `main()`"

**Panel 2:** Cursor displays test code suggestions.
- **Cursor (response):** "I'll create a file called `test_log.py` and write the following test code:
  ```python
  import pytest
  import sys
  from datetime import datetime
  from log import get_log_message, write_log, main
  
  def test_get_log_message():
      """Test get_log_message()"""
      # Normal case
      args = ['log.py', 'test message']
      assert get_log_message(args) == 'test message'
      
      # No arguments case
      args = ['log.py']
      assert get_log_message(args) is None
  
  def test_write_log():
      """Test write_log()"""
      # Normal case
      write_log('test message')
      # Verify it was written to file
      with open('daily_log.txt', 'r', encoding='utf-8') as f:
          lines = f.readlines()
          assert 'test message' in lines[-1]
  
  def test_main():
      """Test main()"""
      # Normal case
      sys.argv = ['log.py', 'test message']
      main()
      # Verify it was written to file
      with open('daily_log.txt', 'r', encoding='utf-8') as f:
          lines = f.readlines()
          assert 'test message' in lines[-1]
  ```"

**Panel 3:** Alex is worried: "Test code was generated, but I don't understand **what they test**..."
- **David:** "It's okay. Ask Cursor's **Chat** **'What does this test code test?'** and it will explain clearly."

**【Infographic Part】**

**Pages 11-12:**
- **Steps to consult about test generation in Chat:**
  1. **Open Chat:** Open Chat (`⌘+L` / `Ctrl+L`)
  2. **Enter question:** Type **"Generate tests for `log.py`. Use `pytest` to create test code that tests each function: `get_log_message()`, `write_log()`, `main()`"**
  3. **Click Send button:** Click the **Send** button
  4. **Check Cursor's suggestion:** Cursor displays test code suggestions. **Always check with your eyes** and understand **what they test**
  5. **Ask about test code explanation:** If needed, ask Cursor's **Chat** **"What does this test code test?"**

**Pages 13-16:**
- **Practice: Create test file with Composer (Pages 13-16)**

**【Manga Part】**

**Manga Scene 6 (Page 13):**
- **Panel 1:** Alex opens Cursor's **Composer** (`⌘+I` / `Ctrl+I`) and instructs **"Create a file called `test_log.py` and write test code for `log.py`. Use `pytest` to test each function: `get_log_message()`, `write_log()`, `main()`"**.
- **Alex (input):** "Create a file called `test_log.py` and write test code for `log.py`. Use `pytest` to test each function: `get_log_message()`, `write_log()`, `main()`"

**Panel 2:** Composer generates test code.
- **Composer (suggestion):** Creates a file called `test_log.py` and suggests the following test code:
  ```python
  import pytest
  import sys
  from datetime import datetime
  from log import get_log_message, write_log, main
  
  def test_get_log_message():
      """Test get_log_message()"""
      # Normal case
      args = ['log.py', 'test message']
      assert get_log_message(args) == 'test message'
      
      # No arguments case
      args = ['log.py']
      assert get_log_message(args) is None
  
  def test_write_log():
      """Test write_log()"""
      # Normal case
      write_log('test message')
      # Verify it was written to file
      with open('daily_log.txt', 'r', encoding='utf-8') as f:
          lines = f.readlines()
          assert 'test message' in lines[-1]
  
  def test_main():
      """Test main()"""
      # Normal case
      sys.argv = ['log.py', 'test message']
      main()
      # Verify it was written to file
      with open('daily_log.txt', 'r', encoding='utf-8') as f:
          lines = f.readlines()
          assert 'test message' in lines[-1]
  ```

**Panel 3:** Alex says: "I want to check the generated test code."
- **David:** "**Always check with your eyes** the test code displayed in the Composer panel and understand **what they test**. Then click the **Accept** button to create the test file."

**【Infographic Part】**

**Pages 13-16:**
- **Steps to create test file with Composer:**
  1. **Open Composer:** Open Composer (`⌘+I` / `Ctrl+I`)
  2. **Enter instruction:** Instruct **"Create a file called `test_log.py` and write test code for `log.py`. Use `pytest` to test each function: `get_log_message()`, `write_log()`, `main()`"**
  3. **Click Generate button:** Click the **Generate** button
  4. **Check generated tests:** **Always check with your eyes** the test code displayed in the Composer panel. Understand **what they test**
  5. **Click Accept button:** Click the **Accept** button to create the test file

- **Checkpoints for generated test code:**
  - **What functions are tested** (`get_log_message()`, `write_log()`, `main()`)
  - **What cases are tested** (normal cases, error cases)
  - **What is verified** (return values, file writes, etc.)

---

### **Section 11.4: Running Tests and Understanding Results (Pages 17-20)**

**【Manga Part】**

**Manga Scene 7 (Page 17):**
- **Panel 1:** David explains: "Let's run the generated tests."
- **David:** "Run `pytest test_log.py` in the terminal and the tests run. **If all tests pass** (`passed`), the code works correctly. **If tests fail** (`failed`), you can see where the problem is."

**Panel 2:** Alex runs `pytest test_log.py` in the terminal.
- **Terminal output (example):**
  ```
  ============================= test session starts ==============================
  platform darwin -- Python 3.9.0, pytest-7.0.0
  collected 3 items
  
  test_log.py::test_get_log_message PASSED                                  [ 33%]
  test_log.py::test_write_log PASSED                                        [ 66%]
  test_log.py::test_main PASSED                                              [100%]
  
  ============================== 3 passed in 0.05s ===============================
  ```
- **Alex:** "All tests passed! So this means the code works correctly, right?"

**Panel 3:** David explains: "If tests pass, **you can change code with confidence**."
- **David:** "For example, when improving the `--day` feature in `log.py`, **running tests verifies existing features aren't broken**. If tests pass, you know **existing features aren't broken**, so you can **change code with confidence**."

**【Infographic Part】**

**Pages 17-18:**
- **Steps to run tests:**
  1. **Open terminal:** Open terminal
  2. **Run tests:** Run `pytest test_log.py`
  3. **Check results:** Check test results
     - **If all tests pass** (`passed`): Code works correctly
     - **If tests fail** (`failed`): You can see where the problem is

- **How to read test results:**
  | Result | Meaning | What to do |
  |--------|---------|------------|
  | **`PASSED`** | Test passed | **Code works correctly**. Can change code with confidence |
  | **`FAILED`** | Test failed | Check **where the problem is**. Paste error message into Cursor's **Chat** and ask how to fix |

**Pages 19-20:**
- **Practice: How to handle test failures (Pages 19-20)**

**【Manga Part】**

**Manga Scene 8 (Page 19):**
- **Panel 1:** After improving the `--day` feature in `log.py`, Alex runs tests. Tests fail.
- **Terminal output (example):**
  ```
  ============================= test session starts ==============================
  platform darwin -- Python 3.9.0, pytest-7.0.0
  collected 3 items
  
  test_log.py::test_get_log_message PASSED                                  [ 33%]
  test_log.py::test_write_log FAILED                                        [ 66%]
  test_log.py::test_main FAILED                                              [100%]
  
  ============================== 2 failed, 1 passed in 0.05s ===============================
  ```
- **Alex:** "Tests failed... Where's the problem?"

**Panel 2:** David explains: "When tests fail, **reading error messages** is important."
- **David:** "Reading error messages displayed in the terminal tells you **where the problem is**. Paste error messages into Cursor's **Chat** and ask **'What is the cause of this test failure? How should I fix it?'** and it will tell you how to fix."

**Panel 3:** Alex pastes error messages into Cursor's **Chat** and asks how to fix.
- **Alex (input):** "What is the cause of this test failure? How should I fix it?"
- **Cursor (response):** "The reason `test_write_log()` and `test_main()` failed is that when improving the `--day` feature in `log.py`, existing features broke. Fix as follows: ..."

**【Infographic Part】**

**Pages 19-20:**
- **How to handle test failures:**
  1. **Read error messages:** Read error messages displayed in the terminal
  2. **Ask in Cursor Chat:** Paste error messages into Cursor's **Chat** (`⌘+L` / `Ctrl+L`) and ask **"What is the cause of this test failure? How should I fix it?"**
  3. **Check fix method:** Cursor suggests a fix method. **Always check with your eyes** and understand **why that fix solves the problem**
  4. **Apply fix:** Apply the fix and run tests again

- **Flow of using tests:**
  1. **Change code:** Improve the `--day` feature in `log.py`
  2. **Run tests:**** Run `pytest test_log.py`
  3. **Check results:**
     - **If all tests pass:** Existing features aren't broken. Can change code with confidence
     - **If tests fail:** Existing features are broken. Ask Cursor's **Chat** how to fix
  4. **Apply fix:** Apply the fix and run tests again

---

## 📝 Chapter Summary (Pages 21-22)

**【Manga Part】**

**Manga Scene 9 (Page 21):**
- **Panel 1:** David says: "In this chapter, we (1) understood **why tests are needed** (even when code works, it might break when changed later, can catch bugs early, etc.), (2) learned how to automatically generate tests using Cursor's **Chat** and **Composer**, (3) learned how to run generated tests and **understand test results**. That's what we covered."
- **Alex:** "Writing tests lets you **automatically verify that existing features aren't broken when you change code**. I can now **change code with confidence**."

**Panel 2:** Alex confirms: "But **I don't need to learn how to write tests**, right?"
- **David:** "Right. Cursor generates them, so you just need to **understand test results**. However, **looking at generated tests and understanding what they test** helps you understand **test thinking**."

**Panel 3:** Alex asks: "What do we learn next?"
- **David:** "Next, let's learn about **`.cursorrules`**. Explaining the same things every time wastes time, so **writing project rules in a `.cursorrules` file** makes Cursor understand automatically."

**【Infographic Part】**

**Pages 21-22:**
- **What we learned in this chapter:**
  - ✅ Understood **why tests are needed**: even when code works, it might break when changed later, can catch bugs early, etc.
  - ✅ Learned how to automatically generate tests using Cursor's **Chat** and **Composer**
  - ✅ Learned how to run generated tests and **understand test results**
  - ✅ Understood **what happens if you don't write tests**: don't notice when existing features break after changing code, bug discovery is delayed, etc.
  - ✅ Understood **what happens if you write tests**: can automatically verify existing features aren't broken when you change code, can catch bugs early, can change code with confidence, etc.

- **Benefits of tests:**
  1. **Can automatically verify that existing features aren't broken when you change code**
  2. **Can catch bugs early** (running tests immediately shows problems)
  3. **Can change code with confidence** (if tests pass, you know it isn't broken)
  4. **Makes it easier for others to understand** (tests become examples of how to use the code)

- **Next chapter:** Chapter 12 ".cursorrules: Teaching AI Project Rules"

---

**Chapter 11 - Complete**
