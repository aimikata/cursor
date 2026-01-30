# Chapter 4: Finding Code with Smart Search

## 📖 Chapter Overview

**Chapter Title:** Finding Code with Smart Search  
**Page Count:** 16-18 pages (optimized for visual learning)  
**Learning Objectives:**
- Understand the problem: "Where was that code?"
- **Search by meaning**: Use `@Codebase` in Chat to find relevant code with natural questions
- Learn search methods through practical examples in the `daily_log` project

---

## 🎬 Story Structure

### **Opening Scene (Pages 1-2): What's the Problem?**

**【Manga Part】**

**Setting:** Alex's apartment. The `daily_log` project created in Chapter 3 is open. `log.py` and `daily_log.txt` exist, and Alex has been using them gradually.

**Manga Scene 1 (Page 1):**
- **Panel 1:** Alex has `log.py` open and is frowning. "I want to change the date format to just `YYYY-MM-DD`, but where did I specify it...?"
- **Alex (thinking):** "**Where was that code?** I think I wrote something about `datetime` somewhere, but scrolling to find it is tedious."

**Panel 2:** Alex tries to search for "write" in the editor with `Ctrl+F` (or `⌘+F`). `f.write` appears, but other instances of `write` also match, and Alex can't find the "date format" part.
- **Alex (thinking):** "Even with word search, I can't search by **what I want to do (meaning)**. I want to search for something like 'where I'm appending to the log'."

**Panel 3:** David appears via video call.
- **David:** "You can use Cursor's **smart search** for that. **Search by meaning**. Ask Chat 'where is the code that appends to the log?' and it will tell you the relevant code. With `@Codebase`, it looks at the entire project, so you don't need to specify files yourself."

**【Infographic Part】**

**Pages 1-2, bottom:**
- **What you'll learn in this chapter:** Search code by **meaning** (semantic search)
- **Traditional search (Ctrl+F / text search):** Hard to find without knowing the **exact string** like "write" or "datetime"
- **Cursor's smart search:** Ask **what you want to do** like "where is the code that appends to the log?" and it tells you the relevant code
- **What to use:** Chat + `@Codebase`. The entire project is the target

---

### **Section 4.1: The Problem—"Where Was That Code?" (Pages 3-4)**

**【Manga Part】**

**Manga Scene 2 (Page 3):**
- **Panel 1:** David explains why searching is difficult.
- **David:** "When code grows a bit, you forget **where you wrote what**, right? Plus, beginners don't know terms like `f.write` or `open(..., "a")`, so regular search is hard."
- **Alex:** "Exactly. I know 'where I'm appending', but I can't think of keywords."

**Panel 2:** Alex nods: "That's why I want to search by meaning."
- **David:** "**Search by meaning** = ask by what you want to do or the role. Like 'where I'm writing to the log file', 'where I'm receiving command arguments', 'where I'm setting the date format'. Cursor reads the project with `@Codebase` and finds code that **matches that meaning**."

**Panel 3:** Alex leans forward: "Let me try it."
- **David:** "First, open Chat, type `@`, and select `Codebase`. Then just ask what you want to know in **plain language**."

**【Infographic Part】**

**Pages 3-4:**
- **Problem summary:**
  - Files and lines increase → Easy to wonder "where was that code?"
  - Text search requires **exact strings** → Hard if you don't know the terms
- **Solution approach:** Ask by **meaning** (what it does). Cursor finds the relevant parts from the project.
- **Good examples vs bad examples (how to ask):**
  | ❌ Bad (vague) | ✅ Good (specific) |
  |----------------|-------------------|
  | `@Codebase error` | `@Codebase Where is the code that appends to the log file?` |
  | `@Codebase file` | `@Codebase Where does it receive command arguments (what you did)?` |
  | `@Codebase date` | `@Codebase Where is the date format (YYYY-MM-DD HH:MM) for a log line set?` |
- **Point:** Writing **what you want to do** specifically ("where I'm appending", "where I'm receiving arguments") helps Cursor find the relevant parts accurately.

---

### **Section 4.2: Searching by Meaning—Chat and @Codebase (Pages 5-10)**

**【Manga Part】**

**Manga Scene 3-1 (Page 5):**
- **Panel 1:** Alex opens Chat with `⌘+L` (Mac) or `Ctrl+L` (Windows). The Chat panel slides in from the right.
- **David:** "As we did in Chapter 1, Chat opens with `⌘+L` (Mac) or `Ctrl+L` (Win). Type your **question** here."

**Panel 2:** Alex types `@` in Chat's **input field**. A dropdown opens showing options like `Codebase`, `Files`, `Docs`.
- **David:** "When you type `@`, you can choose **what to show** Cursor. This time, we want it to see the **entire project**, so select `Codebase`."
- **Visual representation:** Right after typing `@` in the input field, `Codebase` appears in the dropdown, and Alex clicks to select it.

**Panel 3:** With `@Codebase` added as a pill (tag) in the input field, Alex continues typing the question.
- **Alex (input):** `@Codebase Where is the code that appends to the log file?`
- **David:** "Like this, you can ask in **plain Japanese (or English)**. 'Append' or 'date format'—just use **what you want to do**. When you finish typing, press the **Send button** (or Enter)."

**【Infographic Part】**

**Pages 5-6:**
- **Step summary:**
  1. Open Chat (`⌘+L` / `Ctrl+L`)
  2. Type `@` in the input field
  3. Select `Codebase` from the dropdown (entire project is the target)
  4. Continue typing what you want to know as a **sentence**
  5. **Click the Send button** (or press Enter)
- **Point:** With `@Codebase`, Cursor references code from **the project you currently have open** to answer. You don't need to specify files one by one with `@`.

**【Text Part - Detailed Explanation】**

**Page 6, bottom:**
- **Complete steps to search with @Codebase (reproducible):**
  1. **Open Chat:** Press `⌘+L` (Mac) / `Ctrl+L` (Win). Chat panel slides in from the right and opens.
  2. **Type `@` in the input field:** Place cursor in the **input field** at the bottom of the Chat panel and type `@`. A dropdown opens showing `Codebase`, `Files`, `Docs`, etc.
  3. **Select `Codebase`:** **Click** `Codebase` in the dropdown. A pill (tag) `@Codebase` is added to the input field.
  4. **Type your question:** After `@Codebase`, add a space and type what you want to know in **plain language** (e.g., "Where is the code that appends to the log file?").
  5. **Send:** Click the **Send button** (paper plane icon) on the right side of the input field, or press **Enter**.
  6. **Check the answer:** Cursor displays relevant files and lines as quotes. **Click** the quoted parts to jump to that line in the editor.

**【Manga Part】**

**Manga Scene 3-2 (Pages 6-7):**
- **Panel 1:** Cursor returns an answer. The relevant parts of `log.py` (`with open(log_file, "a", ...)` and `f.write(...)`) are quoted and displayed with filename and line numbers.
- **Cursor (response):** "Appending to the log is around line ○ in `log.py`. It opens in append mode with `open(log_file, "a")` and writes one line with `f.write(...)`."

**Panel 2:** When Alex clicks the quote, the editor jumps to that line in `log.py`.
- **Alex:** "I found the **location**. No need to scroll."
- **David:** "Just **ask by meaning** and Cursor finds the relevant parts from the codebase. That's the idea of **smart search**."

**Panel 3:** Alex says: "I want to try another example."
- **David:** "Try asking '**where does it receive command arguments?**' or '**where is the date format set?**'. Same approach: `@Codebase` + question."

**【Infographic Part】**

**Pages 7-8:**
- **What we're doing:**
  - **Input:** `@Codebase` + what you want to know (e.g., "where I'm appending to the log?")
  - **Process:** Cursor interprets code in the project and finds parts that **match the meaning**
  - **Output:** Quote of relevant files and lines. Click to jump to that line in the editor
- **Point:** Even if you don't know terms (like `f.write`), you can ask by **what you want to do**.

---

### **Section 4.3: Examples—Searching in the daily_log Project (Pages 9-12)**

**【Manga Part】**

**Manga Scene 4-1 (Page 9):**
- **Panel 1:** David suggests: "Let's do three common search examples with `daily_log`."
- **David:** "(1) Where I'm appending to the log, (2) where I'm receiving arguments, (3) where I'm setting the date format—all three by **meaning**."

**Panel 2:** Alex asks questions in Chat one by one.
- **Example 1:** `@Codebase Where is the code that appends to the log file?`  
  → Returns `open(..., "a")` and `f.write(...)` in `log.py`.
- **Example 2:** `@Codebase Where does it receive command-line arguments (what you did)?`  
  → Returns `sys.argv` and `" ".join(sys.argv[1:])` around there.
- **Example 3:** `@Codebase Where is the date format (YYYY-MM-DD HH:MM) for a log line set?`  
  → Returns `datetime.now()` and `f"{now:%Y-%m-%d %H:%M}"` around there.

**Panel 3:** Alex looks satisfied: "All three found the locations as I asked."
- **Alex:** "Even without knowing the **exact words**, I can ask by **what it does**."
- **David:** "Right. Once you get used to it, you can include what you want to change, like 'I want to change the date to just `YYYY-MM-DD`', and it will suggest fixes too."

**【Infographic Part】**

**Pages 9-10:**
- **Questions used in examples:**
  | What you want to do | Example question |
  |---------------------|------------------|
  | Find append code | `@Codebase Where is the code that appends to the log file?` |
  | Find argument receiving | `@Codebase Where does it receive command arguments (what you did)?` |
  | Find date format | `@Codebase Where is the date format for the log set?` |
- **Point:** You can ask in **your own words** that match your project. Cursor interprets the meaning and searches.

**【Manga Part】**

**Manga Scene 4-2 (Pages 10-11):**
- **Panel 1:** Alex asks: "When I know the **exact string**, should I also use traditional search?"
- **David:** "Yes. For things like `daily_log.txt` or `sys.argv` that you **know for sure**, **project-wide text search** with `Ctrl+Shift+F` (Mac: `⌘+Shift+F`) can be faster sometimes. **When you want to search by meaning** → `@Codebase` + Chat, **when you want to search by string** → text search. That's how to use them."

**Panel 2:** Alex takes notes: "I'll remember both."
- **David:** "At first, prioritize **searching by meaning**. You'll gradually learn terms, and then text search becomes easier to use."

**【Infographic Part】**

**Pages 11-12:**
- **When to use which search:**
  - **Want to search by meaning** → `@Codebase` + question in Chat (e.g., "where does it do ○○?")
  - **Want to search by exact string** → Project search with `Ctrl+Shift+F` (Win) / `⌘+Shift+F` (Mac)
- **This chapter summary:**
  - ✅ "Where was that code?" is easier to solve with **search by meaning**
  - ✅ Add `@Codebase` in Chat and ask in **plain language**
  - ✅ Even with a small project like `daily_log`, **trying examples** helps you learn the method

---

### **Chapter Summary (Pages 13-14)**

**【Manga Part】**

**Manga Scene 5 (Page 13):**
- **Panel 1:** Alex looks at the screen right after using `@Codebase` to search in Chat with `daily_log` open.
- **Alex:** "**Searching by meaning** was easier than I thought. Just saying 'where I'm appending' found it right away."
- **David:** "That's the right feeling. **Asking what you want to do** directly is the key."

**Panel 2:** David summarizes the chapter points.
- **David:** "In this chapter, we (1) learned that 'where was that code?' is easier with **search by meaning**, (2) added `@Codebase` in Chat and asked in **plain language**, (3) searched for append, arguments, and date format in `daily_log` with **examples**, (4) learned to use search by meaning → `@Codebase`, search by string → `Ctrl+Shift+F` appropriately."
- **Alex:** "Yes. Even if code grows, searching by meaning should keep me from getting lost."

**【Infographic Part】**

**Pages 13-14:**
- Chapter 4 summary:
  - ✅ **"Where was that code in which file?"** → Easier to find with search by meaning
  - ✅ Use **`@Codebase`** + question in Chat to find relevant code in the project
  - ✅ In **daily_log**, actually searched for append, arguments, and date format with three examples
  - ✅ Use appropriately: search by meaning = `@Codebase`, search by string = `Ctrl+Shift+F` / `⌘+Shift+F`
- **Practice Checklist (try right away):**
  - [ ] Open the `daily_log` project in Cursor
  - [ ] Open Chat (`⌘+L` / `Ctrl+L`) and select `@Codebase`
  - [ ] Type "Where is the code that appends to the log file?" and send
  - [ ] Click the quoted parts in the answer to verify you can jump to that line in the editor
  - [ ] Try another question (e.g., "Where is the date format set?")

**【Manga Part】**

**Manga Scene 5-2 (Page 14):**
- **Panel 1:** Alex and David talk about the next chapter.
- **Alex:** "What's next?"
- **David:** "In Chapter 5, we'll dig deeper into **Composer**. We'll try 'building features just by describing' from Chapter 1 with **slightly larger changes** that span multiple files. Adding 'extract only that day's lines' to `daily_log` would be good practice."

**【Infographic Part】**

**Page 14:**
- Next chapter preview:
  - **Chapter 5: Composer — Advanced Techniques and Practical Usage**
  - Add features that span multiple files with Composer
  - Use `daily_log` expansion (e.g., display only that day's lines) as the topic

---

## ✅ Review Points

Points to check in this Japanese translation (same criteria as Chapter 1: **thoroughness, clarity, practicality**):

1. **Clarity of the problem:** Does the reader understand the difficulty of "where was that code?"
2. **Flow of searching by meaning:** Are the **specific operations** (Chat → `@` → select `Codebase` → question → **Send button**) reproducible so readers can **follow the steps exactly**?
3. **Detailed explanation:** Does "Text Part - Detailed Explanation" include **complete reproducible steps** like the **Send button position** and **Enter key**?
4. **Good examples vs bad examples:** Is the **comparison table** of vague vs specific questions as clear as Chapter 1's "good examples vs bad examples"?
5. **Familiarity of examples:** Are the three examples (append, arguments, date format) in `daily_log` easy for beginners to try?
6. **When to use which:** Is the contrast between "search by meaning = `@Codebase`" and "search by string = `Ctrl+Shift+F`" clear?
7. **Connection to next chapter:** Does it naturally lead to Chapter 5's Composer expansion (adding features to `daily_log`)?

---

**Chapter 4 - Complete**
