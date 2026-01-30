# Chapter 3: Your First Code: Logging What You Did Today in One Line

## 📖 Chapter Overview

**Chapter Title:** Your First Code: Logging What You Did Today in One Line  
**Page Count:** 18-20 pages (optimized for visual learning)  
**Learning Objectives:**
- Understand **what to build and why** before starting to write
- Build a script that logs what you did today in one line—something **simple but slightly tedious that you need to do daily**
- Open a project in Cursor, write code, run it, and leverage Tab autocomplete

---

## 🎬 Story Structure

### **Opening Scene (Pages 1-2): What to Build? Why Build It?**

**【Manga Part】**

**Setting:** Alex's apartment. Cursor installation and setup are complete, and a memo text file is open.

**Manga Scene 1 (Page 1):**
- **Panel 1:** Alex opens a text file to note "what I did today" and pauses while typing the date.
- **Alex (thinking):** "I want to record what I did today every day... but opening the file, typing the date, writing the content, saving—it's **simple but slightly tedious**, and I can't keep it up. The date format also varies."

**Panel 2:** David appears via video call.
- **David:** "You can make that easier with code. Let's build a script that **appends a one-line entry with a date to a log**—just pass what you did in one line. Since it's something you do daily, **saving a little effort** makes it easier to maintain."
- **Alex:** "Something simple but slightly tedious that I need to do daily—that's exactly it. The **purpose** is clear."

**Panel 3:** Alex leans forward with interest.
- **David:** "Let's clarify the **goal**. What we're building is 'a script that appends what you did today in one line to a log'. Input is **what you did** (e.g., `"Wrote Chapter 3 draft"`), output is **date + time + that one line** appended to a log file. Just type `python log.py "something"` in the terminal."
- **Alex:** "Knowing the purpose motivates me. Let's do it."

**【Infographic Part】**

**Pages 1-2, bottom:**
- **What we'll build in this chapter:** A script that appends what you did today in one line to a log
- **Note:** Many people find it **simple** to note "what I did today" daily, but **slightly tedious** (opening the file, typing the date, etc.) and can't keep it up. This script lets you **just pass one line** to append with a date.
- **Input:** Command-line argument for "what you did" (e.g., `python log.py "Wrote Chapter 3 draft"`)
- **Output:** Appends to `daily_log.txt` like `2025-01-21 14:30 Wrote Chapter 3 draft`
- **Future uses:** Extract only that day's lines by date, change log save location, etc.

---

### **Section 3.1: Creating a Project (Pages 3-5)**

**【Manga Part】**

**Manga Scene 2-1 (Page 3):**
- **Panel 1:** Alex creates a `daily_log` folder on the desktop (or in Documents).
- **David:** "First, create a project folder and open it in Cursor. Name it `daily_log`. Location can be anywhere you like."

**Panel 2:** In Cursor, select "File" → "Open Folder" and open `daily_log`.
- **David:** "In Cursor, select 'Open Folder' → `daily_log`. You can also use shortcuts: `⌘+O` (Mac) or `Ctrl+K Ctrl+O` (Windows)."
- **Visual representation:** `daily_log` appears in the left sidebar, still empty.

**Panel 3:** Alex right-clicks `daily_log` in EXPLORER and creates `log.py` with "New File".
- **David:** "Create one Python script `log.py` for logging inside this folder. When running, pass what you did as an argument in the terminal, like `python log.py "what you did"`."

**【Infographic Part】**

**Pages 3-4:**
- **How to open a project (reproducible steps):**
  1. Create a `daily_log` folder anywhere you like (desktop, documents, etc.)
  2. In Cursor, click menu "**File**" → "**Open Folder**" (or `⌘+O` / `Ctrl+K` then `Ctrl+O`)
  3. In the dialog, select the `daily_log` folder and click "**Open**" (or "Select Folder")
  4. `daily_log` appears in the left EXPLORER. It's fine if it's empty
  5. In EXPLORER, **right-click** `daily_log` → "**New File**" → enter `log.py` as the filename and press Enter
- **Point:** Folder = one project. Place `log.py` here, and `daily_log.txt` will be created in the same folder.

---

### **Section 3.2: Writing Code—Understanding the Purpose of Each Input (Pages 6-10)**

**【Manga Part】**

**Manga Scene 3-1 (Page 6):**
- **Panel 1:** Alex writes `import sys` and `from datetime import datetime` in `log.py`.
- **David:** "`sys` receives command-line arguments (what you did). `datetime` gets the current date and time to add at the start of the log line."
- **Alex:** "Input is what you did, output is appending to a file with date, right?"

**Panel 2:** Alex writes a "usage" display with `if len(sys.argv) < 2:` and receives arguments with `line = " ".join(sys.argv[1:])`.
- **David:** "`sys.argv[1]` and beyond are what you did. If you run `python log.py "A B"`, `A B` becomes one string. `" ".join` can combine multiple words into one line."
- **Visual representation:** When running just `python log.py` in the terminal, "Usage: python log.py \"what you did\"" appears.

**Panel 3:** Alex writes `with open(log_file, "a", encoding="utf-8") as f:` and appends with `f.write(f"{now:%Y-%m-%d %H:%M} {line}\n")`. Tab suggests datetime format and `"\n"`.
- **David:** "`"a"` is append mode. Keeps adding to the same file. `encoding="utf-8"` ensures Japanese text is written correctly."
- **Alex:** "Tab suggested the continuation of `%Y-%m-%d`, and I accepted it after checking the meaning."

**【Text Part - Code Only】**

**Pages 6-7, bottom:**
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

**【Text Part - Detailed Explanation】**

**Pages 7-8, bottom:**
- **Complete steps to run in terminal (reproducible):**
  1. **Open terminal:** Click menu "**Terminal**" → "**New Terminal**" (or press `` Ctrl+` `` (backtick)). Terminal panel opens at the bottom.
  2. **Navigate to project folder:** Type `cd daily_log` and press Enter in the terminal (if `daily_log` is open in Cursor, you may already be in that folder. Use `pwd` to check your current location).
  3. **Run the script:** Type `python log.py "Read Cursor Chapter 3"` and press Enter. **Don't forget to enclose in quotes (`"`)**.
  4. **Check result:** Terminal shows "Logged: 2025-01-21 14:30 Read Cursor Chapter 3". `daily_log.txt` appears in the left EXPLORER; click to open it and see one line with date + content.
  5. **Try again:** Run something like `python log.py "Second test"` to confirm it **appends** (second line is added to `daily_log.txt`).

**【Manga Part】**

**Manga Scene 3-2 (Page 7):**
- **Panel 1:** David explains `"a"` (append) and `encoding="utf-8"`.
- **David:** "`open(..., "a")` is for **appending**. Creates the file if it doesn't exist, adds to the end if it does. `"w"` would overwrite, so be careful."
- **Alex:** "Since we're adding daily, append mode is important."

**Panel 2:** Alex runs `python log.py "Read Cursor Chapter 3"` in the terminal.
- **David:** "Try running it right away with what you just did in one line. `daily_log.txt` should be created with one line appended."
- **Visual representation:** Terminal shows "Logged: 2025-01-21 14:30 Read Cursor Chapter 3". `daily_log.txt` appears in EXPLORER; opening it shows one line with date + content. **Terminal** can be opened from menu "Terminal" → "New Terminal" or with `` Ctrl+` `` (backtick).

**Panel 3:** Alex opens `daily_log.txt` and checks the contents.
- **Alex:** "Date and time were added automatically, and it's saved in one line. If I do this daily, it's much easier than opening a file and typing the date."
- **David:** "Right. The goal is to make **something simple but slightly tedious that you need to do daily** easier to maintain with a bit of code."

**【Infographic Part】**

**Pages 7-8:**
- **What we're doing:**
  - **Input:** Command-line argument for "what you did" (e.g., `python log.py "did something"`)
  - **Process:** Get current date and time, append one line to `daily_log.txt` in the format `YYYY-MM-DD HH:MM what you did`
  - **Output:** Append to log file. Terminal shows "Logged: …"
- **Point:** Every day, just type `python log.py "something"` and you're done. No need to manually type the date.

**【Text Part - Detailed Explanation】**

**Page 8, bottom:**
- **Steps to run and verify the log (reproducible):**
  1. Have the `daily_log` folder open in Cursor
  2. Open terminal: Menu "**Terminal**" → "**New Terminal**", or `` Ctrl+` `` (backtick)
  3. No `cd` command needed in terminal (project folder is already open). Type `python log.py "write what you did here"`
  4. Press Enter to run. If terminal shows "Logged: date time what you did", it's OK
  5. In the left EXPLORER, click `daily_log.txt` to open and verify the appended line
- **Note:** After editing `log.py`, **save** (`⌘+S` / `Ctrl+S`) before running.

---

### **Section 3.3: Using Tab Autocomplete While Writing (Pages 9-12)**

**【Manga Part】**

**Manga Scene 4-1 (Page 9):**
- **Panel 1:** David suggests: "Let's make it a bit more convenient. In 'Next Steps', you can add an option to **extract only that day's lines**."
- **Alex:** "That could be useful for seeing what I did this week, too."

**Panel 2:** Alex asks: "Tab is useful, but I shouldn't accept everything, right?"
- **David:** "Right. It's **just a helper**. Always check with your eyes, and if something looks wrong, press Esc to reject and fix it yourself. As we discussed in Chapter 1, get in the habit of accepting only good suggestions."

**Panel 3:** Alex asks: "When running without arguments, can we show the last 5 lines of the log instead of Usage?"
- **David:** "Yes. When `len(sys.argv) < 2`, add code to read the file and display the last few lines. Let's add that to 'Next Steps'."

**【Infographic Part】**

**Pages 9-10:**
- Guidelines for using Tab:
  - ✅ Always **check suggestions with your eyes** before accepting with Tab
  - ✅ If something looks wrong, press **Esc** to reject and write it yourself
  - ✅ Keep in mind **what the code is for** while writing
  - ❌ Avoid accepting everything with Tab without thinking

---

### **"Next Steps" and How to Expand (Pages 11-12)**

**【Manga Part】**

**Manga Scene 4-2 (Page 11):**
- **Panel 1:** Alex says: "On weekends, I want to review what I did that week."
- **David:** "Then add an option to **pass a date as an argument and extract and display only that day's lines**. Like `python log.py --day 2025-01-21`."

**Panel 2:** Alex takes notes.
- **Alex:** "So I add entries daily with `python log.py "something"`, and when reviewing, I use `--day` to see just that day, right?"
- **David:** "Right. **Make something simple but slightly tedious that you do daily** easier, and you can use the results later. When what you build is actually useful, motivation stays high."

**【Infographic Part】**

**Pages 11-12:**
- Next steps to try:
  - **Extract only that day's lines:** `python log.py --day 2025-01-21` displays only that day's lines from `daily_log.txt`
  - **Show last 5 lines when no arguments:** If you run it without passing anything, show the last 5 lines. Quickly check "what did I do recently?"
  - **Change log save location:** Change `log_file` to something like `Documents/logs/daily_log.txt`. Add code to create the folder if it doesn't exist.
- **Point:** Since the purpose is clear, **small extensions** are easy to add.

---

### **Chapter Summary (Pages 13-14)**

**【Manga Part】**

**Manga Scene 5 (Page 13):**
- **Panel 1:** Alex looks satisfied at the `daily_log` folder, `log.py`, and `daily_log.txt`.
- **Alex:** "I'm glad it's not Hello World, but a script that makes **something simple but slightly tedious that I do daily** easier. It's not just build and forget—I can keep using it myself."
- **David:** "Putting 'what it's for' first is important. From now on, keep in mind **what to build and what each input is for**."

**Panel 2:** David summarizes the chapter points.
- **David:** "In this chapter, we (1) created a project folder and opened it in Cursor, (2) wrote code toward the goal of **appending what you did today in one line to a log** in `log.py`, (3) ran it in the terminal with arguments like `python log.py "what you did"`, (4) used Tab autocomplete while writing."
- **Alex:** "Yes. Since it's something I do daily, knowing the purpose makes it easier to keep up."

**【Infographic Part】**

**Pages 13-14:**
- Chapter 3 summary:
  - ✅ Decide **what to build and why** first
  - ✅ Build a script that logs "what you did today" in one line—something **simple but slightly tedious that you need to do daily**—and actually run and test it
  - ✅ Experience creating a project folder, `log.py`, terminal execution, and Tab basics
  - ✅ Use what you built as a **daily routine** and feel its practicality
- **Practice Checklist (try right away):**
  - [ ] Create a `daily_log` folder and open it in Cursor with "File" → "Open Folder"
  - [ ] Create `log.py`, copy and paste this chapter's code, and save
  - [ ] Open terminal and run `python log.py "Read Chapter 3"`
  - [ ] Verify "Logged: …" appears and one line is appended to `daily_log.txt`

**【Manga Part】**

**Manga Scene 5-2 (Page 14):**
- **Panel 1:** Alex and David talk about the next chapter.
- **Alex:** "What's next?"
- **David:** "In Chapter 4, we'll cover **Cursor's search** when files increase and you wonder 'where was that code?'. You can search code by meaning, which is quite useful."

**【Infographic Part】**

**Page 14:**
- Next chapter preview:
  - **Chapter 4: Finding Code with Smart Search**
  - Search code in your project by "meaning"
  - Learn search methods with a practical project example

---

## ✅ Review Points

Points to check in this Japanese translation (same criteria as Chapter 1: **thoroughness, clarity, practicality**):

1. **Clarity of purpose:** Does "what to build and what each input is for" come across from the start?
2. **Practicality:** Does the "what you did today" memo—something simple but slightly tedious that you do daily—feel like it would **actually be easier to maintain**?
3. **Story flow:** Is the flow from goal setting → project creation → code writing → execution/verification → Tab usage natural?
4. **Code examples and detailed explanation:** Can readers **follow the steps exactly** to reproduce it, from opening the terminal to running?
5. **Specificity of UI operations:** Are details like "File" → "Open Folder" → "Select Folder" → "Open" at the same level of specificity as Chapter 1?
6. **Ease of expansion:** Are "Next Steps" (extract only that day's lines, show last 5 lines, etc.) easy for beginners to imagine?

---

**Chapter 3 - Complete**
