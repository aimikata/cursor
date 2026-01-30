# Chapter 5: Composer — Advanced Techniques and Practical Usage

## 📖 Chapter Overview

**Chapter Title:** Composer — Advanced Techniques and Practical Usage  
**Page Count:** 20-22 pages (optimized for visual learning)  
**Learning Objectives:**
- Review Chapter 1: Composer basics (how to open, how to give instructions, Generate)
- **Add features just by describing**: Add "display only that day's lines" to `daily_log` with Composer
- Help Composer understand the entire project structure (@Codebase, folder opened state)
- Customize generated code with **additional prompts** and **partial Accept**
- Lightly experience **letting Agent handle execution** (details in Chapter 8)

---

## 🎬 Story Structure

### **Opening Scene (Pages 1-2): What to Add?**

**【Manga Part】**

**Setting:** Alex's apartment. The `daily_log` project is open with `log.py` and `daily_log.txt`. Chapters 3 and 4 are done, and Alex logs daily with `python log.py "something"`.

**Manga Scene 1 (Page 1):**
- **Panel 1:** Alex opens `daily_log.txt` and sees lines from several days. "On weekends, I want to review **only what I did that day**, but searching with my eyes is tedious."
- **Alex (thinking):** "Chapter 3's 'Next Steps' mentioned **extracting only that day's lines**. I'm a bit nervous about adding it to `log.py` myself..."

**Panel 2:** David appears via video call.
- **David:** "Let **Composer** handle that. Just **describe** 'add a feature to display only that day's lines with `python log.py --day 2025-01-21`' and it will suggest the necessary changes. It's a practical version of 'building features just by describing' from Chapter 1."
- **Alex:** "I don't have to write everything myself. I want to try it."

**Panel 3:** Alex says: "I want to review how to open Composer first."
- **David:** "Let's start with a **review**. Then we'll add **display only that day's lines** to `daily_log`."

**【Infographic Part】**

**Pages 1-2, bottom:**
- **What we'll do in this chapter:** Add **display only that day's lines** (`python log.py --day YYYY-MM-DD`) to `daily_log`
- **What to use:** Composer. **Describe the feature you want** and it suggests the code additions and changes
- **Flow:** Review Composer basics in 5.1 → Add feature in 5.2 → Show project structure in 5.3 → Fine-tune in 5.4 → Lightly experience Agent in 5.5

---

### **Section 5.1: Review of Chapter 1 — Composer Basic Operations (Pages 3-5)**

**【Manga Part】**

**Manga Scene 2 (Page 3):**
- **Panel 1:** David confirms: "Composer is a panel that **generates and changes code just by describing**."
- **David:** "In Chapter 1, we wrote something like 'Create a login feature...' in **English** and Generate created multiple files. This time, we're **adding a feature to existing `log.py`**, so you can give instructions like 'add ○○' in **Japanese or English**."

**Panel 2:** Alex presses `⌘+I` (Mac) or `Ctrl+I` (Windows). The Composer panel opens at the bottom (or right side). A large input field appears.
- **David:** "Composer opens with **`⌘+I` (Mac) / `Ctrl+I` (Win)**. You can also open it from the menu 'Composer'. Write **what you want to do** here."

**Panel 3:** Alex is writing a **draft** of the instruction they're about to give in Composer's input field.
- **David:** "The more **specific** you write, the more likely you'll get what you want. For 'display only that day's lines', it helps to write the **input format** (e.g., `--day YYYY-MM-DD`) and that **the existing append feature stays**."

**【Infographic Part】**

**Pages 3-4:**
- **Composer basics:**
  1. **Open:** `⌘+I` (Mac) / `Ctrl+I` (Win), or menu "Composer"
  2. **Write instruction in input field:** Write the feature or change you want **specifically** (Japanese or English OK)
  3. **Generate:** Press the button and Composer generates code, showing it as **diffs** in the relevant files
- **Point:** When **adding** to an existing project, writing "add ○○" or "don't change ○○" helps it understand.

---

### **Section 5.2: Building More Complex Features — Adding "Display Only That Day's Lines" (Pages 6-11)**

**【Manga Part】**

**Manga Scene 3-1 (Page 6):**
- **Panel 1:** With the `daily_log` folder open in Cursor, Alex writes an instruction in Composer's input field.
- **Alex (input):** "Add a feature to `log.py` that displays only that day's lines from `daily_log.txt` with `python log.py --day YYYY-MM-DD`. Keep the existing append feature with `python log.py "what you did"` **as is**. Date format is `YYYY-MM-DD`."
- **David:** "You've clearly written **what to add** and **what not to touch**. This level of specificity helps Composer avoid confusion."

**Panel 2:** Alex presses **Generate** in Composer. After a moment, **change proposals (diffs)** for `log.py` appear in Composer. Blocks to be added and places where existing code changes are color-coded.
- **David:** "After generation, **always check the contents**. Check with your eyes whether the added `--day` processing and existing append parts aren't broken."
- **Visual representation:** In the diff view, a block starting with `if sys.argv[1] == "--day":` is shown as **added**, and the existing `main()` part below is shown as **changed**. The **Generate button** is on the right (or bottom) of the Composer input field; clicking it starts generation.

**Panel 3:** Alex scrolls through the changes to check. "For `--day`, it reads the log and filters by date to display. It didn't touch the append part."
- **David:** "If it's OK, **Accept** to incorporate. If something bothers you, **Reject** and give **additional instructions** like 'just fix ○○'. First, let's Accept and try running it."
- **Visual representation:** **Accept** and **Reject** buttons appear at the top right of the diff block (or next to each block). Clicking **Accept** applies the changes to `log.py` in the editor.

**【Text Part - Detailed Explanation】**

**Pages 7-8, bottom:**
- **Complete steps to add a feature with Composer (reproducible):**
  1. **Open Composer:** Press `⌘+I` (Mac) / `Ctrl+I` (Win). Composer panel opens at the bottom (or right side) with a large input field.
  2. **Enter instruction:** Write the feature or change you want **specifically** in the input field (e.g., "Add a feature to `log.py` that displays only that day's lines with `python log.py --day YYYY-MM-DD`. Keep the append feature as is.").
  3. **Click Generate button:** Click the **Generate** button on the right (or bottom) of the input field. Wait a moment and generation starts.
  4. **Check the diff:** Change proposals (diffs) appear in the Composer panel. Blocks to be **added** (green or + marks) and places to be **changed** (yellow or ~ marks) are color-coded. **Always scroll to check the whole thing**.
  5. **Accept or Reject:** There are **Accept** and **Reject** buttons at the top right of the diff block (or next to each block). If OK, click **Accept** to incorporate the changes. If something's wrong, **Reject** to dismiss and give additional instructions.
  6. **Run and verify:** Run `python log.py --day 2025-01-21` in the terminal and verify it works. Also verify the existing feature (`python log.py "something"`) still works.

**【Text Part - Code to Be Added (Image)**

**Page 8, bottom:**

Image of code to add to `log.py` (**existing append stays as is**, branch `--day` at the top):

```python
# When --day, display only that day's lines and exit
if len(sys.argv) >= 2 and sys.argv[1] == "--day":
    if len(sys.argv) < 3:
        print("Usage: python log.py --day YYYY-MM-DD")
        return
    day = sys.argv[2]
    log_file = "daily_log.txt"
    try:
        with open(log_file, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith(day):
                    print(line.rstrip())
    except FileNotFoundError:
        print(f"No log file found: {log_file}")
    return

# Below, the usual append processing (line = " ".join(...) etc.)
```

**【Manga Part】**

**Manga Scene 3-2 (Pages 8-9):**
- **Panel 1:** Alex clicks **Accept** in Composer. Changes are applied to `log.py`.
- **David:** "After applying, **run it in the terminal** to verify. Try specifying a date that's actually in the log, like `python log.py --day 2025-01-21`."

**Panel 2:** Alex runs `python log.py --day 2025-01-21` in the terminal. If there are lines for that date in `daily_log.txt`, only those are displayed. If not, nothing is displayed (or "No log file").
- **Alex:** "Only **that day's lines** appeared. It works exactly as I described to Composer."
- **David:** "The flow of **describe → generate → check → run** is the basic way to use Composer."

**Panel 3:** Alex also runs `python log.py "Added --day feature with Composer"` and verifies the existing append still works.
- **David:** "**Always check that existing behavior isn't broken**. This time, both append and `--day` work."

**【Infographic Part】**

**Pages 9-10:**
- **What we did:**
  - **Instruction:** "Display only that day's lines with `--day YYYY-MM-DD`. Keep append as is."
  - **Composer:** Added `--day` branch and processing to read `daily_log.txt` and filter by date in `log.py`
  - **Verification:** Check diff before Accept. After Accept, run both `python log.py --day ...` and `python log.py "something"` to verify
- **Point:** **Specific instructions** and **explicitly stating not to change existing** makes it easier to get only the changes you want.

---

### **Section 5.3: Helping Composer Understand the Entire Project Structure (Pages 11-12)**

**【Manga Part】**

**Manga Scene 4 (Page 11):**
- **Panel 1:** Alex asks: "Does Composer know **which files to modify** on its own?"
- **David:** "When you **open the project as a folder**, Composer knows that `log.py` and `daily_log.txt` exist. Also, if you **write file names in the instruction** (e.g., 'add to `log.py`'), it follows that to make changes."

**Panel 2:** David explains: "In Composer's input field, typing **`@`** lets you specify **Codebase** or **folders**, like in Chapter 4."
- **David:** "You can **add context** like `@Codebase` for the entire project, `@daily_log` for a folder, `@log.py` for a file. For a small project like `daily_log`, just opening the folder and writing `log.py` in the instruction is often enough."

**Panel 3:** Alex notes: "For larger projects, it seems better to specify folders or files with @."
- **David:** "Right. **Limiting what you want to change** helps Composer focus on **relevant files**."

**【Infographic Part】**

**Pages 11-12:**
- **How to communicate structure to Composer:**
  - **Open folder:** Use Composer with `daily_log` open in Cursor
  - **Write names in instruction:** "add ○○ to `log.py`", "`daily_log.txt` is read-only", etc.
  - **Specify with @ (when needed):** Use `@Codebase`, `@log.py`, `@daily_log`, etc. to narrow the scope
- **Point:** For small projects, **folder + specific instructions**; for large projects, **narrow with @** is easier to handle.

---

### **Section 5.4: Advanced Customization of Generated Code (Pages 13-15)**

**【Manga Part】**

**Manga Scene 5-1 (Page 13):**
- **Panel 1:** Alex says: "When `--day` finds nothing, I want it to say 'No log for that day'."
- **David:** "You can **give Composer additional instructions** for that. Write 'when `--day` finds 0 matching lines, display "No log for that day"' in the **same Composer thread** and Generate again; it will add just that change."

**Panel 2:** Alex adds to Composer and sends: "When `--day` finds no matching lines, display `No log for that day`."
- **Cursor (Composer):** Proposes a diff that adds a count check after the loop in the existing `--day` processing, outputting "No log for that day" if 0.
- **Alex:** "**Additional prompts** let me change detailed behavior."

**Panel 3:** David adds: "**You don't have to Accept everything**."
- **David:** "When changes are split into multiple blocks, you can **Accept only the blocks you like** and fix the rest manually. **Generation is just a helper**; you make the final judgment."

**【Infographic Part】**

**Pages 13-14:**
- **How to customize:**
  - **Additional prompt:** Add to the same thread like "when ○○, do ××" and Generate again
  - **Partial Accept:** Accept only the blocks you want from the proposal, reject the rest and edit yourself
  - **Manual fix:** After Accept, fine-tune in the editor—that's fine
- **Point:** You can **use Composer's proposals as-is**, **use parts of them**, or **fix them yourself**. **Relying gradually** is easy to handle.

---

### **Section 5.5: Practical Use of Agent Mode (Pages 15-17)**

**【Manga Part】**

**Manga Scene 6-1 (Page 15):**
- **Panel 1:** David explains: "Composer has two modes: **Normal** and **Agent**." Reviewing what was mentioned in Chapter 1.
- **David:** "**Normal** generates code based on description. That's what we've been doing. **Agent** can **think step by step and execute commands in the terminal**. You can **let it handle execution** like 'after generating, run `python log.py --day today's date` to verify'."

**Panel 2:** Alex switches Composer to **Agent**, and with the same `daily_log` folder open, types: "Add `--day` feature to `log.py` and verify by running `python log.py --day 2025-01-21`."
- **Visual representation:** Agent displays **thinking steps** like "Step 1: modify log.py", "Step 2: run in terminal", then the terminal opens and `python log.py --day 2025-01-21` runs.
- **David:** "**Letting it handle execution** shows 'it worked / it didn't' right away. But **what commands it runs**—keep track of that yourself. We'll cover Agent in detail in **Chapter 8**."

**Panel 3:** Alex sees Agent's execution result (that day's lines displayed) and is impressed: "Generation and verification together."
- **David:** "For **small changes + execution verification**, Agent is convenient. For **large design** or **organizing multiple files**, first look at proposals carefully in Normal mode, then decide—that's the recommended approach."

**【Infographic Part】**

**Pages 16-17:**
- **Normal vs Agent (Composer):**
  - **Normal:** Description → code generation, diff display → you Accept/run and verify yourself
  - **Agent:** Description → think step by step → code changes **+ terminal execution**, etc. may happen
- **When to use Agent:** When you want to **let it handle execution and simple tests** after generation. **What to do** should be clearly written in the instruction.
- **Details in Chapter 8:** We'll dig deeper into Agent's thinking, combining with bug fixes and tests, etc.

---

### **Chapter Summary (Pages 18-19)**

**【Manga Part】**

**Manga Scene 7 (Page 18):**
- **Panel 1:** Alex looks at the execution result of `python log.py --day 2025-01-21` with `log.py` open.
- **Alex:** "Just by **describing**, I added the feature to display only that day's lines. Much easier than writing everything myself."
- **David:** "Writing **what you want to add** specifically is the most important. Also, **always check** the generation results and check that **existing behavior isn't broken**—get in that habit."

**Panel 2:** David summarizes the chapter points.
- **David:** "In this chapter, we (1) reviewed Composer basics (how to open, instructions, Generate), (2) added **display only that day's lines** to `daily_log`, (3) communicated structure by opening the project, writing file names in instructions, narrowing with @, (4) customized with additional prompts and partial Accept, (5) experienced **letting Agent handle execution**. That's what we covered."
- **Alex:** "I learned that both **adding/fixing with Composer** and **checking yourself** are important."

**【Infographic Part】**

**Pages 18-19:**
- Chapter 5 summary:
  - ✅ **Composer** basics: Open with `⌘+I` / `Ctrl+I` → give specific instructions → Generate → check → Accept
  - ✅ Added **display only that day's lines** (`python log.py --day YYYY-MM-DD`) to `log.py` with Composer
  - ✅ Communicate structure by opening project, writing file names in instructions, narrowing with @
  - ✅ Customize with **additional prompts** and **partial Accept**. **Generation is a helper**; you make the final judgment
  - ✅ Experience **letting Agent handle generation + execution verification**. Details in Chapter 8
- **Practice Checklist (try right away):**
  - [ ] Open the `daily_log` project in Cursor
  - [ ] Open Composer (`⌘+I` / `Ctrl+I`) and instruct: "Add `--day` feature to `log.py`"
  - [ ] Click **Generate button** and check the diff
  - [ ] Click **Accept button** to incorporate changes
  - [ ] Run `python log.py --day 2025-01-21` in the terminal and verify it works

**【Manga Part】**

**Manga Scene 7-2 (Page 19):**
- **Panel 1:** Alex and David talk about the next chapter.
- **Alex:** "What's next?"
- **David:** "In **Chapter 6**, let's get better at **Tab**. In addition to the autocomplete basics from Chapter 1, we'll cover **how to get better suggestions** and **tips for accepting/rejecting**. You can practice while working on `daily_log`."

**【Infographic Part】**

**Page 19:**
- Next chapter preview:
  - **Chapter 6: Tab — Mastering Code Suggestions**
  - Techniques for getting better suggestions, best practices for accepting/rejecting
  - Use Tab in real projects like `daily_log`

---

## ✅ Review Points

Points to check in this Japanese translation (same criteria as Chapter 1: **thoroughness, clarity, practicality**):

1. **Composer review:** Does the flow (how to open (`⌘+I` / `Ctrl+I`), how to give instructions, Generate) match Chapter 1 without contradiction?
2. **Detailed explanation:** Does "Text Part - Detailed Explanation" include **complete reproducible steps** like **Generate button and Accept button positions** so readers can **follow the steps exactly**?
3. **Specificity of feature addition:** Is "display only that day's lines" `--day YYYY-MM-DD` clear as **what to add**? Is it written that existing append stays?
4. **Specificity of UI operations:** Are details like "click Generate button" and "click Accept button" at the same level of specificity as Chapter 1?
5. **Project structure:** Is the distinction between opening folder, writing file names in instructions, and using @ easy for beginners to imagine?
6. **Customization:** Can the three patterns (additional prompt, partial Accept, manual fix) be understood separately?
7. **Agent handling:** Does it touch on "letting it handle execution" as an experience while noting details are in Chapter 8, so readers understand?
8. **Connection to next chapter:** Does it naturally lead to Chapter 6's Tab (accepting/rejecting suggestions, etc.)?

---

**Chapter 5 - Complete**
