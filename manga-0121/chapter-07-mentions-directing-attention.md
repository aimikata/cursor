# Chapter 7: @Mentions — Directing AI's Attention

## 📖 Chapter Overview

**Chapter Title:** @Mentions — Directing AI's Attention  
**Page Count:** 18-20 pages (optimized for visual learning)  
**Learning Objectives:**
- Understand the problem: "AI doesn't know which files to look at"
- Practice using **@Files** to specify particular files in `daily_log`
- Review and more effective use of **@Codebase**
- Use **@Recommended** to reference files Cursor recommends
- Be conscious of "**which files and what scope** to show" in Chat and Composer

---

## 🎬 Story Structure

### **Opening Scene (Pages 1-2): What's the Problem?**

**【Manga Part】**

**Setting:** Alex's apartment. The `daily_log` project is open with `log.py` and `daily_log.txt`. Used `@Codebase` in Chapter 4, but wants to know more.

**Manga Scene 1 (Page 1):**
- **Panel 1:** Alex asks in Chat: "How can I make the `--day` feature in `log.py` more user-friendly?" However, Cursor also references `daily_log.txt` and returns a slightly off-target answer.
- **Alex (thinking):** "I want it to look only at `log.py`, but it seems to be looking at `daily_log.txt` too. Can I specify **which files to look at** more clearly?"

**Panel 2:** David appears via video call.
- **David:** "You can solve that with **@Mentions**. We used `@Codebase` in Chapters 1 and 4, but when you want to show **only specific files**, use `@Files`. If you write `@log.py`, Cursor will reference **only that file** to answer."
- **Alex:** "I can specify files. I want to try it."

**Panel 3:** Alex asks: "How do I choose between `@Codebase` and `@Files`?"
- **David:** "**When you know the specific file** → `@Files`. **When you want to search the entire project** → `@Codebase`. There's also `@Recommended` where Cursor **recommends related files**. Let's try it in `daily_log`."

**【Infographic Part】**

**Pages 1-2, bottom:**
- **What you'll learn in this chapter:** Use **@Mentions** to specify **which files and what scope** to show Cursor
- **Problem:** With multiple files, Cursor doesn't know **which files to look at** and may give off-target answers
- **Solution:** Specify with `@Files` for specific files, `@Codebase` for entire project, `@Recommended` for Cursor-recommended files
- **What to use:** Type `@` in Chat or Composer input fields to see options

---

### **Section 7.1: The Problem—"AI Doesn't Know Which Files to Look At" (Pages 3-4)**

**【Manga Part】**

**Manga Scene 2 (Page 3):**
- **Panel 1:** David explains why @Mentions are needed.
- **David:** "When a project has multiple files, Cursor may **try to look at everything** or **get confused about which to look at**. For example, when `daily_log` has `log.py` and `daily_log.txt`, even if you ask 'improve the `--day` feature in `log.py`', Cursor might look at `daily_log.txt` content too and make irrelevant suggestions."
- **Alex:** "So I need to specify **only the files I want it to look at**."

**Panel 2:** Alex asks: "Since `@Codebase` looks at the entire project, is it heavy for large projects?"
- **David:** "Yes. If you **know the specific file**, showing only that file with `@Files` makes it **faster and more accurate**. Use `@Codebase` when 'you don't know which file, so you want it to search'."

**Panel 3:** Alex leans forward: "Please teach me how to use `@Files` first."
- **David:** "Let's try asking a question with only `@log.py` specified in `daily_log`."

**【Infographic Part】**

**Pages 3-4:**
- **Problem summary:**
  - Multiple files exist → Cursor doesn't know **which files to look at** and may give off-target answers
  - `@Codebase` looks at entire project → Heavy for large projects, inefficient if you know the specific file
- **Solution approach:**
  - **When you know the specific file** → Specify only that file with `@Files`
  - **When you don't know which file** → Search entire project with `@Codebase`
  - **When you want Cursor to recommend** → Use `@Recommended`

---

### **Section 7.2: Using @Files to Specify Files (Pages 5-9)**

**【Manga Part】**

**Manga Scene 3-1 (Page 5):**
- **Panel 1:** Alex opens Chat (`⌘+L` / `Ctrl+L`) and types `@` in the input field. A dropdown opens showing `Codebase`, `Files`, `Docs`, `Recommended`, etc.
- **David:** "When you type `@`, options appear. This time, we want to show **specific files**, so select `Files`. Or, if you type `@log`, `log.py` appears as a candidate."
- **Visual representation:** Right after typing `@` in the input field, a dropdown shows `Files`, `Codebase`, etc., and Alex clicks `Files`.

**Panel 2:** When Alex selects `Files`, a file list from the project (`log.py`, `daily_log.txt`, etc.) appears. Alex clicks `log.py` to select it.
- **David:** "When you select `log.py`, a pill (tag) `@log.py` is added to the input field. This makes Cursor look at **only `log.py`** to answer."
- **Visual representation:** `@log.py` is added as a pill to the input field, displayed as a small tag above it.

**Panel 3:** With `@log.py` added, Alex continues typing the question.
- **Alex (input):** `@log.py Improve the --day feature to display "No log for that day" when there are 0 matching lines`
- **David:** "With `@log.py`, Cursor references **only `log.py` content** and suggests improvements within that file. It doesn't look at `daily_log.txt`, so off-target suggestions decrease."

**【Infographic Part】**

**Pages 5-6:**
- **How to use @Files:**
  1. Type `@` in Chat or Composer input field
  2. Select `Files` from dropdown (or type `@filename` to see candidates)
  3. **Click** the file you want to show from the file list
  4. `@filename` is added as a pill
  5. Continue typing question or instruction and send
- **Point:** When specifying **multiple files**, you can add multiple pills like `@log.py @daily_log.txt`.

**【Manga Part】**

**Manga Scene 3-2 (Pages 6-7):**
- **Panel 1:** Cursor returns an answer. Code to add processing for when there are 0 matching lines in the `--day` block in `log.py` is suggested. It doesn't touch `daily_log.txt` content.
- **Cursor (response):** "In the `--day` block in `log.py`, I'll add processing to display 'No log for that day' when there are 0 matching lines: [code block]"
- **Alex:** "It answered by looking only at `log.py`. Since it's not looking at irrelevant files, the suggestions are on target."

**Panel 2:** Alex asks: "What about when I want to show multiple files?"
- **David:** "Add **multiple pills** like `@log.py @daily_log.txt`. Same as `@auth.py @user.py @database.py` in Chapter 1. However, specifying **only files that are really needed** makes Cursor's answers more accurate."

**Panel 3:** Alex asks with `@log.py @daily_log.txt`: "Check the part in `log.py` that reads `daily_log.txt` and the format of `daily_log.txt`, and verify consistency."
- **Cursor (response):** "I've checked both files. `log.py` writes in `YYYY-MM-DD HH:MM` format, and existing lines in `daily_log.txt` are in the same format. Consistency is maintained."
- **Alex:** "When I specify multiple files, it also looks at **relationships between files**."

**【Infographic Part】**

**Pages 7-8:**
- **When to use @Files:**
  - **Only one file:** `@log.py` → Best for improvements/questions within that file
  - **Multiple files:** `@log.py @daily_log.txt` → When you want to check relationships between files
  - **Entire folder:** `@daily_log` → Specify all files in the folder
- **Point:** Specifying **only files that are really needed** makes Cursor's answers faster and more accurate.

**【Text Part - Detailed Explanation】**

**Page 8, bottom:**
- **Complete steps to specify files with @Files (reproducible):**
  1. **Open Chat or Composer:** Open Chat with `⌘+L` (Mac) / `Ctrl+L` (Win), or Composer with `⌘+I` / `Ctrl+I`.
  2. **Type `@` in input field:** Place cursor in the input field and type `@`. A dropdown opens.
  3. **Select `Files`:** **Click** `Files` in the dropdown. Or, type `@log` and `log.py` appears as a candidate, then select it.
  4. **Select file:** **Click** the file you want to show (e.g., `log.py`) from the file list. A pill (tag) `@log.py` is added to the input field.
  5. **Specify multiple files (if needed):** Type `@` again or type another filename after `@` to add multiple pills (e.g., `@log.py @daily_log.txt`).
  6. **Type question/instruction:** After the pills, add a space and type your question or instruction.
  7. **Send:** Click the Send button (paper plane icon) or press Enter.

---

### **Section 7.3: Using @Codebase to View Entire Project (Review + Advanced Usage) (Pages 9-12)**

**【Manga Part】**

**Manga Scene 4 (Page 9):**
- **Panel 1:** David suggests: "We did `@Codebase` in Chapter 4, but let's look at it a bit more."
- **David:** "`@Codebase` looks at the **entire project**. Use it when **you don't know which file** but want to **search by meaning**. Same as asking 'where is the code that appends to the log?' in Chapter 4."

**Panel 2:** Alex asks: "Which should I use, `@Files` or `@Codebase`?"
- **David:** "**When you know the specific file** → `@Files`. **When you don't know which file** → `@Codebase`. For example, with a small project like `daily_log`, `@Codebase` is fine, but in **large projects** when you know the specific file, `@Files` is faster."

**Panel 3:** Alex asks: "Can I **combine** `@Codebase` and `@Files`?"
- **David:** "Actually, when you add `@Codebase`, Cursor looks at the **entire project**, so you don't need to add `@Files` individually. However, when you want to **emphasize a specific file**, you can add both like `@Codebase @log.py`. In that case, Cursor looks at `log.py` **with priority**."

**【Infographic Part】**

**Pages 9-10:**
- **@Codebase vs @Files (when to use which):**
  | Situation | What to use | Example |
  |-----------|-------------|---------|
  | Know the specific file | `@Files` | `@log.py` to look only at `log.py` |
  | Don't know which file | `@Codebase` | `@Codebase` to search entire project |
  | Want to emphasize specific file | `@Codebase @Files` | `@Codebase @log.py` to look at entire project but prioritize `log.py` |
- **Point:** For small projects (like `daily_log`), `@Codebase` is fine. For large projects when you know the specific file, `@Files` is more efficient.

**【Manga Part】**

**Manga Scene 4-2 (Pages 10-11):**
- **Panel 1:** Alex asks with `@Codebase`: "Are there any places in the `daily_log` project overall where error handling is missing?"
- **Cursor (response):** "In the `--day` block in `log.py`, there's handling for when `daily_log.txt` doesn't exist, but error handling when reading the file may be insufficient. I recommend wrapping it in `try-except`."
- **Alex:** "It looks at the entire project and points out **improvement areas**."

**Panel 2:** David adds: "`@Codebase` also understands **project structure**."
- **David:** "Even with a small project like `daily_log`, `@Codebase` understands 'what does this project do' and 'what are the relationships between files'. So `@Codebase` is useful for **improvement suggestions for the entire project**."

**【Infographic Part】**

**Pages 11-12:**
- **Effective use of @Codebase:**
  - **Improvement suggestions for entire project:** "Are there places missing error handling?" "Are there security issues?"
  - **Check relationships between files:** "Is there consistency between `log.py` and `daily_log.txt`?"
  - **Search by meaning:** "Where is the code that appends to the log?" (as done in Chapter 4)
- **Point:** `@Codebase` understands **context of the entire project**. Even in large projects, `@Codebase` is effective when you **want to search by meaning**.

---

### **Section 7.4: Using @Recommended to Reference Files Cursor Recommends (Pages 12-15)**

**【Manga Part】**

**Manga Scene 5-1 (Page 12):**
- **Panel 1:** David introduces: "Cursor also has a **`@Recommended`** feature."
- **David:** "Using `@Recommended` makes Cursor automatically **recommend files related to your current question or code**. Without choosing files yourself, Cursor **finds related files** and references them."

**Panel 2:** Alex selects `@Recommended` in Chat. Cursor recommends `log.py` and `daily_log.txt` and automatically adds them as pills.
- **Alex (input):** `@Recommended I want to improve the log feature`
- **David:** "With `@Recommended`, Cursor automatically finds files related to **'log feature'** (`log.py`, `daily_log.txt`, etc.) and references them. Saves you the trouble of choosing files yourself."
- **Visual representation:** When `@Recommended` is selected, related files (`log.py`, `daily_log.txt`) are automatically added as pills.

**Panel 3:** Cursor returns an answer. Improvement suggestions referencing the recommended files are displayed.
- **Cursor (response):** "I've checked the recommended files (`log.py`, `daily_log.txt`). Improvement suggestions for the log feature: [suggestions]"
- **Alex:** "Even without choosing files myself, Cursor **finds related files**. That's convenient."

**【Infographic Part】**

**Pages 12-13:**
- **How to use @Recommended:**
  1. Type `@` in Chat or Composer input field
  2. Select `Recommended` from dropdown
  3. `@Recommended` is added as a pill
  4. Continue typing question or instruction
  5. Cursor automatically **finds and references related files**
- **Point:** When **you don't know which files to look at**, letting Cursor handle it with `@Recommended` is convenient. However, if you **know the specific file**, `@Files` is more accurate.

**【Manga Part】**

**Manga Scene 5-2 (Pages 13-14):**
- **Panel 1:** Alex asks: "What if the files recommended by `@Recommended` are different from what I expected?"
- **David:** "In that case, **delete the pill** and specify again yourself with `@Files`. `@Recommended` is a **helper**; you make the final judgment."

**Panel 2:** Alex deletes the `@Recommended` pill and manually adds `@log.py`.
- **David:** "**Check recommendations and adjust manually if needed**—that's fine. You can also start with `@Recommended` and **add missing files with `@Files`** if needed."

**【Infographic Part】**

**Pages 14-15:**
- **When to use @Recommended:**
  - **Don't know which files to look at** → Let Cursor handle it with `@Recommended`
  - **Know the specific file** → Specify yourself with `@Files`
  - **Check recommendations and adjust** → Start with `@Recommended`, add/remove with `@Files` if needed
- **Point:** `@Recommended` is convenient as a **first step**. Once you get used to it, specifying yourself with `@Files` is often **more accurate and faster**.

---

### **Chapter Summary (Pages 16-17)**

**【Manga Part】**

**Manga Scene 6 (Page 16):**
- **Panel 1:** Alex looks at the screen right after asking a question with `@log.py` in Chat with `daily_log` open.
- **Alex:** "Specifying **which files to show** made Cursor's answers much more accurate. I learned to use `@Files` for specific files, `@Codebase` for entire project, `@Recommended` for recommendations."
- **David:** "That's the right feeling. **Using them appropriately for the situation** is the key."

**Panel 2:** David summarizes the chapter points.
- **David:** "In this chapter, we (1) learned that specifying **which files to show** makes answers accurate, (2) used `@Files` to specify **specific files**, (3) used `@Codebase` to look at **entire project** (review of Chapter 4), (4) used `@Recommended` to reference **files Cursor recommends**. That's what we covered."
- **Alex:** "Yes. Actually trying it in `daily_log` made the distinctions easier to imagine."

**【Infographic Part】**

**Pages 16-17:**
- Chapter 7 summary:
  - ✅ Specifying **which files to show** makes Cursor's answers **faster and more accurate**
  - ✅ **@Files** to specify specific files (`@log.py`, etc.). Can specify **multiple files** (`@log.py @daily_log.txt`)
  - ✅ **@Codebase** to look at entire project (review of Chapter 4). Effective when you **want to search by meaning**
  - ✅ **@Recommended** to automatically reference files Cursor recommends. Convenient when **you don't know which files**
  - ✅ **When to use which:** Know specific file → `@Files`, don't know which file → `@Codebase`, want to let it recommend → `@Recommended`
- **Practice Checklist (try right away):**
  - [ ] Open the `daily_log` project in Cursor
  - [ ] Open Chat (`⌘+L` / `Ctrl+L`), type `@`, and select `Files`
  - [ ] Select `log.py` and try asking with `@log.py` (e.g., "improve the `--day` feature")
  - [ ] Try searching the entire project with `@Codebase` (review of Chapter 4)
  - [ ] Try letting Cursor choose recommended files with `@Recommended`

**【Manga Part】**

**Manga Scene 6-2 (Page 17):**
- **Panel 1:** Alex and David talk about the next chapter.
- **Alex:** "What's next?"
- **David:** "In **Chapter 8**, we'll dig deeper into **Agent**. We'll cover 'thinking step by step and executing commands' mentioned briefly in Chapters 1 and 5 in detail with examples like **bug fixes** and **test execution**. Let's actually use Agent in `daily_log` to **let it handle multi-step tasks**."

**【Infographic Part】**

**Page 17:**
- Next chapter preview:
  - **Chapter 8: Agent — Your Thinking Assistant**
  - How Agent thinks step by step and executes commands
  - Use Agent in examples like bug fixes and test execution

---

## ✅ Review Points

Points to check in this Japanese translation (same criteria as Chapter 1: **thoroughness, clarity, practicality**):

1. **Clarity of the problem:** Does the reader understand the difficulty of "AI doesn't know which files to look at"?
2. **Specificity of @Files:** Are the **specific operations** (type `@` → select `Files` → select file → add pill) reproducible so readers can **follow the steps exactly**?
3. **Detailed explanation:** Does "Text Part - Detailed Explanation" include **complete reproducible steps** like **dropdown display** and **pill addition**?
4. **Clarity of distinctions:** Is the **comparison table** of `@Files` vs `@Codebase` vs `@Recommended` as clear as Chapter 1's "good examples vs bad examples"?
5. **Familiarity of examples:** Are examples using `log.py` and `daily_log.txt` in `daily_log` easy for beginners to try?
6. **Consistency with Chapter 4:** Does the `@Codebase` explanation match Chapter 4 and function as **review + application**?
7. **Connection to next chapter:** Does it naturally lead to Chapter 8's Agent (multi-step tasks)?

---

**Chapter 7 - Complete**
