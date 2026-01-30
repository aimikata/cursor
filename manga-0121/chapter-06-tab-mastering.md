# Chapter 6: Tab — Mastering Code Suggestions

## 📖 Chapter Overview

**Chapter Title:** Tab — Mastering Code Suggestions  
**Page Count:** 18-20 pages (optimized for visual learning)  
**Learning Objectives:**
- Review Chapter 1: Tab basics (gray suggestions, accept with Tab, reject with Esc)
- **How to get better suggestions**: Communicate intent with comments or function names (try in `daily_log`)
- Learn that Tab adapts to **your project's coding style**
- Master **tips for accepting/rejecting** while working with `log.py`

---

## 🎬 Story Structure

### **Opening Scene (Pages 1-2): What to Do?**

**【Manga Part】**

**Setting:** Alex's apartment. The `daily_log` project is open, and Alex is editing `log.py`. Up to Chapter 5, features like `--day` have been added with Composer.

**Manga Scene 1 (Page 1):**
- **Panel 1:** Alex tries to write a loop to display lines filtered by `--day` in `log.py` and stops mid-way. "How do I write the rest...?"
- **Alex (thinking):** "I want to write **small lines** myself rather than having Composer add them. But the next line doesn't come to me right away."

**Panel 2:** David appears via video call.
- **David:** "That's where **Tab** comes in. The **code suggestions** from Chapter 1. If you **write a bit of intent**, it suggests the next line or block. The habit of **accepting only good suggestions** and **rejecting with Esc if wrong** is important."
- **Alex:** "I want to practice using Tab in `daily_log`."

**Panel 3:** Alex says: "I want to cover from review to tips for accepting/rejecting."
- **David:** "First, quickly review **Tab basics**, then **try it specifically in log.py**. Learn **how to get better suggestions** and **accepting/rejecting** while doing it."

**【Infographic Part】**

**Pages 1-2, bottom:**
- **What we'll do in this chapter:** Tab **basic review** → **practice in log.py** (draw suggestions with comments/function names) → **tips for accepting/rejecting**
- **Practice location:** `log.py` in `daily_log`. Open it yourself, write, press Tab—**you can try it right away**
- **Goal:** When writing "small lines", use Tab **intentionally** and develop a sense of **accepting only good ones**

---

### **Section 6.1: Review of Chapter 1 — Tab Basic Operations (Pages 3-4)**

**【Manga Part】**

**Manga Scene 2 (Page 3):**
- **Panel 1:** David explains: "Tab is a feature where Cursor suggests **the continuation of the code you're writing** as **gray translucent text**."
- **David:** "Press **Tab** to accept the suggestion. **Esc** to reject. Accepted ones become normal code. Same as Chapter 1."

**Panel 2:** With `log.py` open, Alex places the cursor after `with open(log_file, "r", encoding="utf-8") as f:`. After pressing Enter or typing `for`, Tab suggests continuations like `for line in f:` or `if line.startswith(day):`.
- **David:** "Suggestions tend to follow **the flow of existing code** (read with `open`, filter by date). First, write **one line or a comment** and use Tab to get the continuation—recall that feeling."
- **Visual representation:** A suggestion appears as **gray translucent text** below the cursor. Pressing **Tab** confirms the suggestion and it becomes normal code (black text). Pressing **Esc** dismisses the suggestion.

**Panel 3:** Alex says: "The suggestion Tab gave doesn't match what I want this time."
- **David:** "In that case, **reject with Esc** and write it yourself. **Always check with your eyes** before accepting—that's the rule."

**【Infographic Part】**

**Pages 3-4:**
- **Tab basics:**
  1. Place cursor at **where you want to continue** in the editor (end of line, after Enter, right after function name, etc.)
  2. Writing **a few characters or a comment** often triggers gray suggestions
  3. **Tab** → accept suggestion. **Esc** → reject
- **Point:** **Always check suggestions with your eyes**. If wrong, reject with Esc and write yourself.

**【Text Part - Detailed Explanation】**

**Page 4, bottom:**
- **Complete steps to receive code suggestions with Tab (reproducible):**
  1. **Place cursor:** In the editor, place the cursor at **where you want to continue** (e.g., right after function name, right after Enter, right after comment).
  2. **Write a bit of intent:** Write a **comment** (e.g., `# Display only that day's lines`) or **function name** (e.g., `def filter_by_day(day):`). Or, write a few characters following the flow of existing code (e.g., `for`).
  3. **Wait for suggestion:** After a moment, a suggestion appears as **gray translucent text** below the cursor. If it doesn't appear, write a bit more or try pressing Enter.
  4. **Check the suggestion:** **Always check the suggestion content with your eyes**. Check if it matches your intent, if variable names and logic are correct.
  5. **Accept with Tab or reject with Esc:** If usable, press **Tab** to accept the suggestion (gray becomes normal code). If wrong, press **Esc** to reject and write yourself.
  6. **After accepting:** If needed, **manually edit** the accepted code for fine-tuning. Tab is a **helper**; you make the final judgment.

---

### **Section 6.2: Techniques for Getting Better Suggestions (Pages 5-8)**

**【Manga Part】**

**Manga Scene 3-1 (Page 5):**
- **Panel 1:** David explains: "Writing **what you want to do** a bit in **comments** or **function/variable names** makes Tab suggestions more accurate."
- **David:** "Examples: `# Display only that day's lines` or `def filter_by_day(day):`. **Writing that shows intent** helps Cursor guess the continuation."

**Panel 2:** In the `--day` block in `log.py`, Alex writes the comment `# For each line in the file, display only those starting with day` and presses Enter. Pressing Tab suggests code close to `for line in f:`, `if line.startswith(day):`, `print(line.rstrip())`.
- **Alex:** "When I wrote **what I want to do** in the comment, a suggestion close to that appeared."
- **David:** "**Japanese comments are OK**. 'Do ○○' or 'display only ○○'—short is fine."

**Panel 3:** This time, Alex writes just `def format_log_line(now, line):` and presses Enter. Pressing Tab suggests a return value like `return f"{now:%Y-%m-%d %H:%M} {line}\n"`.
- **David:** "The **function name** conveys 'format a log line', so it suggests content that matches that format. **Communicating intent with names** is also effective."

**【Infographic Part】**

**Pages 5-6:**
- **Techniques to draw suggestions:**
  - **Write intent in comments:** `# Display only that day's lines`, `# Filter by date and display`, etc. Press Enter then Tab.
  - **Write intent in function names:** `def filter_by_day(day):`, `def format_log_line(now, line):`, etc. Press Enter then Tab.
  - **Write variable names clearly:** After `day = sys.argv[2]`, writing up to `log_file = "daily_log.txt"` makes subsequent `open` or `for` suggestions more likely to match.
- **Practical examples (log.py):**
  - In `--day` block: `# Read file and filter by date` → Enter → Tab
  - `def format_log_line(now, line):` → Enter → Tab

**【Manga Part】**

**Manga Scene 3-2 (Pages 6-7):**
- **Panel 1:** Alex asks: "What happens with vague comments?"
- **David:** "Something vague like `# Do something` tends to produce off-target suggestions. Writing **'what'** to do, even briefly, helps. Like `# Filter by date` or `# Format one line`."

**Panel 2:** Alex writes just `# Error handling` and presses Tab. The suggestion might be "wrap in try/except" or "output a specific error message" depending on context, but it's less accurate than with **specific comments**.
- **David:** "**More specific is more accurate**. Writing **what to do** like `# If file doesn't exist, display 'No log'` is safer."

**【Infographic Part】**

**Pages 7-8:**
- **Vague vs specific:**
  - ❌ `# Do something`, `# Error handling` → Suggestions less accurate
  - ✅ `# Display only that day's lines`, `# If file doesn't exist, display 'No log'` → Suggestions more accurate
- **Point:** Communicating **what you want to do** to Tab, even briefly, yields **reproducible, easy-to-try** suggestions.

---

### **Section 6.3: Learning Coding Style (Pages 8-10)**

**【Manga Part】**

**Manga Scene 4 (Pages 8-9):**
- **Panel 1:** David explains: "Tab **references how you write in the currently open file or project** to make suggestions."
- **David:** "Since `log.py` uses **f-strings** like `f"{now:%Y-%m-%d %H:%M}"`, new lines also tend to get **the same style** of suggestions. It **matches existing code**."

**Panel 2:** Alex tries to add a new `print` in `log.py` and types `print(`. Tab suggests a continuation similar to the existing `print(f"Logged: ...")` with **f-strings**.
- **Alex:** "The suggestion matches the feel of the existing `print`."
- **David:** "It also learns **indentation** and **naming habits** from the project. So, **gradually matching style when you write** makes Tab suggestions more compatible."

**【Infographic Part】**

**Pages 9-10:**
- **Style learning:**
  - Tab **references surrounding code** (same file, same project) for **how to write**
  - Suggestions tend to match existing style for **f-strings**, **indentation**, **variable naming**, etc.
- **Point:** When you write, **matching style** makes Tab suggestions **easier to use right away**.

---

### **Section 6.4: Using Tab in Larger Projects (Pages 10-11)**

**【Manga Part】**

**Manga Scene 5 (Page 10):**
- **Panel 1:** Alex asks: "`daily_log` is still small, but **what about when files increase**?"
- **David:** "Tab mainly looks at **the file you're editing** or **open files**. Suggestions tend to follow **the flow within that file**. Even in large projects, it focuses on **where you're working**."

**Panel 2:** David adds: "For changes that **span multiple files**, Composer is better suited. Think of Tab as for **completing a few lines or blocks you're writing right now**."
- **Alex:** "So Tab = completion for the current spot, Composer = changes by feature—that's the distinction."

**【Infographic Part】**

**Pages 10-11:**
- **Tab vs Composer (when to use which):**
  - **Tab:** Continuation or completion of **a few lines or blocks** you're writing. Suggestions follow **the flow within that file**.
  - **Composer:** **Adding/fixing features** or changes that **span multiple files**. Describe and generate together.
- **Point:** Even in a small project like `daily_log`, the distinction is the same: **write details with Tab, add features together with Composer**.

---

### **Section 6.5: Best Practices for Accepting and Rejecting Suggestions (Pages 11-14)**

**【Manga Part】**

**Manga Scene 6-1 (Pages 11-12):**
- **Panel 1:** David emphasizes: "**Always check with your eyes** before accepting with Tab. **Don't assume everything is correct**."
- **David:** "If variable names are wrong, logic is wrong, or it **doesn't match the existing `--day` behavior**, **reject with Esc** and fix it yourself. As we discussed in Chapter 1, get in the habit of **accepting only good suggestions**."

**Panel 2:** In `log.py`, Alex writes `# When 0 matching lines, show message` and presses Tab. The suggestion shows processing for "when 0 matching lines", but the **message text** differs from what's intended (e.g., stays as "No entries" instead of "No log for that day").
- **Alex:** "The meaning matches, but the **text I want to display** is different. I'll reject this and fix it myself."
- **David:** "When it's **partially wrong** like that, reject first and **fix only what's needed**—that's fine. **Not expecting perfect suggestions** is the key."

**Panel 3:** Alex sees another suggestion and thinks "this one I can use as-is", then accepts it with Tab.
- **David:** "**If you judge it usable, Tab**; **if wrong or different, Esc**. **Being a bit conscious of this each time** changes how you work with Tab significantly."

**【Infographic Part】**

**Pages 12-13:**
- **Tips for accepting/rejecting:**
  - ✅ **Check suggestions with your eyes** before deciding Tab / Esc
  - ✅ **If wrong or different from intent** → Reject with Esc and write yourself or fix partially
  - ✅ **If usable as-is** → Accept with Tab
  - ❌ Avoid accepting everything with Tab without thinking
- **What you can practice (log.py):** Draw suggestions with comments or function names, **check if they match intent** each time, then Tab / Esc.

**【Manga Part】**

**Manga Scene 6-2 (Page 13):**
- **Panel 1:** Alex asks: "What if I want to fix something **after accepting**?"
- **David:** "**After Accept**, just edit normally in the editor. Tab is a suggestion **at the moment you accept it**. **Fine-tuning yourself afterward** is normal, so don't worry about it."

**Panel 2:** Alex manually fixes variable names or messages in lines accepted with Tab.
- **David:** "Think of **suggestions as drafts**. **Fixing yourself** is expected, so you can use Tab more casually."

**【Infographic Part】**

**Pages 13-14:**
- **Summary:**
  - After accepting with Tab, **manual fixes are OK**
  - **Suggestions are helpers**. Whether it works or matches intent—**check yourself**
- **What we practiced in this chapter:** In `log.py`, drew suggestions with comments/function names, repeated **check → Tab / Esc** and **manual fixes after accepting if needed**.

---

### **Chapter Summary (Pages 15-16)**

**【Manga Part】**

**Manga Scene 7 (Page 15):**
- **Panel 1:** Alex looks at places completed with Tab in `log.py`.
- **Alex:** "Writing **a bit of intent** makes suggestions more accurate, and **checking before Tab/Esc** is important—I learned that."
- **David:** "That's the right feeling. Use Tab for **small lines**, and **Esc if something seems wrong**. Trying it a few times in `daily_log` will help you get used to it."

**Panel 2:** David summarizes the chapter points.
- **David:** "In this chapter, we (1) reviewed Tab basics (gray suggestions, accept with Tab, reject with Esc), (2) learned that writing intent in **comments or function names** makes suggestions more accurate, (3) learned that Tab adapts to **project style**, (4) learned to **always check** before accepting/rejecting, (5) learned that **manual fixes after accepting are OK**. That's what we covered."
- **Alex:** "So it's about using Tab **intentionally**."

**【Infographic Part】**

**Pages 15-16:**
- Chapter 6 summary:
  - ✅ **Tab basics**: Gray suggestions → check → **accept with Tab** / **reject with Esc**
  - ✅ **Better suggestions**: Communicate intent with **comments** (`# Display only that day's lines`, etc.) or **function names** (`def format_log_line(...)`, etc.)
  - ✅ Tab tends to suggest code that matches **existing code style**
  - ✅ **Accepting/rejecting**: Always check with your eyes. Esc if wrong. **Manual fixes after accepting are OK**
- **Practice Checklist (try right away):**
  - [ ] Open `log.py` and write a comment `# Display only that day's lines` on a new line
  - [ ] Press Enter, then press **Tab** (wait until suggestion appears)
  - [ ] **Check the suggestion with your eyes**, then press **Tab** if usable, **Esc** if wrong
  - [ ] In another place, write `def format_log_line(now, line):` and press Enter, then check Tab suggestions
  - [ ] Verify you can **manually edit** accepted code for fine-tuning

**【Manga Part】**

**Manga Scene 7-2 (Page 16):**
- **Panel 1:** Alex and David talk about the next chapter.
- **Alex:** "What's next?"
- **David:** "In **Chapter 7**, we'll dig deeper into **@Mentions**. We used `@Codebase` in Chapters 1 and 4, but we'll cover **distinctions** like using **@Files** to specify particular files or **@Docs** to reference documentation. Practice **making clear where to show AI** in Chat and Composer."

**【Infographic Part】**

**Page 16:**
- Next chapter preview:
  - **Chapter 7: @Mentions — Directing AI's Attention**
  - Distinctions between @Codebase, @Files, @Docs, etc.
  - Be conscious of "**which files and what scope** to show" in Chat and Composer

---

## ✅ Review Points

Points to check in this Japanese translation (same criteria as Chapter 1: **thoroughness, clarity, practicality**):

1. **Practical concrete examples:** Are operations like writing a **comment** (`# Display only that day's lines`, etc.) or **function name** (`def format_log_line(...)`) in `log.py` and pressing Tab described as **reproducible operations you can try right away**?
2. **Detailed explanation:** Does "Text Part - Detailed Explanation" include **complete reproducible steps** like **Tab and Esc key positions** and **gray translucent text** so readers can **follow the steps exactly**?
3. **Visual representation:** Are details like "displayed as gray translucent text, confirmed with Tab, dismissed with Esc" described at the same level of specificity as Chapter 1?
4. **Consistency with review:** Does it match Chapter 1's Tab (gray suggestions, Tab/Esc) without contradiction?
5. **Accepting/rejecting:** Are "always check → Esc if wrong, Tab if usable" and "manual fixes after accepting are OK" conveyed with **specific situations** (e.g., message text differences)?
6. **Volume compared to Ch1:** Shorter than Chapter 1, but is it written **practically and concretely** (what to do and try is clear)?
7. **Connection to next chapter:** Does it naturally lead to Chapter 7's @Mentions (@Files, @Docs, etc.)?

---

**Chapter 6 - Complete**
