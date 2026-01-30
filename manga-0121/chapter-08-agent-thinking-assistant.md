# Chapter 8: Agent — Your Thinking Assistant

## 📖 Chapter Overview

**Chapter Title:** Agent — Your Thinking Assistant  
**Page Count:** 20-22 pages (optimized for visual learning)  
**Learning Objectives:**
- Understand the problem: "Manually doing multi-step tasks like bug fixes and test execution is tedious"
- Understand how **Agent** thinks step by step and executes commands
- Experience letting Agent handle **bug fixes + test execution** in `daily_log`
- Develop the habit of checking Agent's **thinking process** and understanding **what it's doing**

---

## 🎬 Story Structure

### **Opening Scene (Pages 1-2): What's the Problem?**

**【Manga Part】**

**Setting:** Alex's apartment. The `daily_log` project is open, and Alex is using `log.py`. Added the `--day` feature in Chapter 5, but notices a small issue.

**Manga Scene 1 (Page 1):**
- **Panel 1:** Alex runs `python log.py --day 2025-12-31` in the terminal. Since there are no lines for that date in `daily_log.txt`, nothing is displayed.
- **Alex (thinking):** "When I specify a date that doesn't exist, I want it to say 'No log for that day'. But **fixing, testing, and confirming** requires many steps..."

**Panel 2:** Alex opens `log.py` and looks at the `--day` block. "I should add processing for when there are 0 matching lines here, but **fixing, running, and confirming** manually is tedious."
- **Alex (thinking):** "I used Agent briefly in Chapter 5, and it was mentioned that it can handle **multi-step tasks**. Can I let Agent handle this?"

**Panel 3:** David appears via video call.
- **David:** "Let **Agent** handle that. If you instruct it to 'fix the `--day` feature to display "No log for that day" when there are 0 matching lines, and test and verify it', Agent will **think step by step and do fix → run → verify** for you."
- **Alex:** "I can let it handle multiple steps together. I want to try it."

**【Infographic Part】**

**Pages 1-2, bottom:**
- **What you'll learn in this chapter:** **Agent** thinks step by step and executes commands
- **Problem:** Manually doing **multi-step tasks** like bug fixes and test execution is tedious
- **Solution:** Instruct Agent to "fix, test, and verify" and it will **think step by step and execute** for you
- **What to use:** Composer's **Agent mode**. Thinking process is displayed, and commands are executed in the terminal

---

### **Section 8.1: The Problem—"Manually Doing Multi-Step Tasks is Tedious" (Pages 3-4)**

**【Manga Part】**

**Manga Scene 2 (Page 3):**
- **Panel 1:** David explains why Agent is needed.
- **David:** "If you're just fixing code, Composer's Normal mode is enough. But when you need **multiple steps** like **fix → run in terminal → check results → fix again if there's a problem**, doing it manually is tedious."
- **Alex:** "Exactly. Doing it one by one takes time."

**Panel 2:** Alex asks: "Does Agent automatically do those multi-step tasks?"
- **David:** "Yes. Agent **thinks step by step** and executes in order like 'Step 1: fix code', 'Step 2: run in terminal', 'Step 3: check results'. The thinking process is visible, so you can see **what it's doing**."

**Panel 3:** Alex leans forward: "Let me try it in `daily_log`."
- **David:** "First, understand Agent's **thinking approach**, then let Agent handle the bug fix in `log.py`."

**【Infographic Part】**

**Pages 3-4:**
- **Problem summary:**
  - Manually doing **multi-step tasks** like bug fixes and test execution is tedious
  - Doing it one by one takes time, and you might forget something along the way
- **Solution approach:** Instruct Agent to "fix, test, and verify" together, and Agent will **think step by step and execute** for you
- **Tasks Agent is suited for:**
  - ✅ Bug fixes + test execution
  - ✅ Code generation + execution verification
  - ✅ Changes across multiple files + tests
  - ❌ Large design changes (better to look at proposals carefully in Normal mode)

---

### **Section 8.2: How Agent Thinks and Acts (Pages 5-9)**

**【Manga Part】**

**Manga Scene 3-1 (Page 5):**
- **Panel 1:** David explains: "Agent is a mode that **thinks step by step and executes commands**."
- **David:** "As mentioned briefly in Chapters 1 and 5, Agent displays the **thinking process**. Like 'Step 1: check ○○', 'Step 2: fix ○○', 'Step 3: execute ○○'—you can see **what it's doing**."

**Panel 2:** Alex opens Composer (`⌘+I` / `Ctrl+I`) and selects **Agent** in the mode selector at the top.
- **David:** "When you open Composer, click **Agent** in the **mode selector** at the top ('Normal' and 'Agent'). When you switch to Agent mode, a section to display the thinking process is added."
- **Visual representation:** At the top of the Composer panel, there are "Normal" and "Agent" buttons, and Alex clicks "Agent" to select it. When switched to Agent mode, a section to display the thinking process is added.

**Panel 3:** Alex looks at the input field in Agent mode Composer.
- **David:** "Even in Agent mode, **how you give instructions is the same as Normal**. Write **what you want it to do** specifically, like 'fix ○○, test it, and verify'."

**【Infographic Part】**

**Pages 5-6:**
- **How to open Agent mode:**
  1. Open Composer (`⌘+I` / `Ctrl+I`)
  2. Click "**Agent**" in the **mode selector** at the top
  3. Switches to Agent mode, and a section to display thinking process is added
  4. Write **what you want it to do** specifically in the input field
- **Point:** Even in Agent mode, the more **specifically** you write instructions, the more accurately Agent executes.

**【Manga Part】**

**Manga Scene 3-2 (Pages 6-7):**
- **Panel 1:** Alex types an instruction in Agent mode Composer.
- **Alex (input):** "In the `--day` feature in `log.py`, fix it to display 'No log for that day' when there are 0 matching lines, test with `python log.py --day 2025-12-31`, and verify"
- **David:** "You've written **what to fix** and **how to test**. With this level of specificity, Agent is less likely to get confused."

**Panel 2:** Alex clicks the **Generate** (or "Run") button. Agent starts displaying the thinking process.
- **Agent (thinking display):**
  - "Step 1: Check the `--day` block in `log.py`"
  - "Step 2: Add processing for when there are 0 matching lines"
  - "Step 3: Save the fixed code"
  - "Step 4: Run `python log.py --day 2025-12-31` in terminal"
  - "Step 5: Check execution results"
- **Visual representation:** The thinking process is displayed as text in Composer, and each step is executed in sequence.

**Panel 3:** Agent opens the terminal at Step 4 and runs `python log.py --day 2025-12-31`.
- **Visual representation:** Terminal opens automatically and the command runs. Execution result ("No log for that day") is displayed.
- **Alex:** "Agent **automatically opened the terminal and ran it** for me. I don't have to do it manually."

**【Infographic Part】**

**Pages 7-8:**
- **Agent's action flow:**
  1. **Receive instruction:** Specific instructions like "fix, test, and verify"
  2. **Display thinking process:** Shows "Step 1: ○○", "Step 2: ○○"—what it will do
  3. **Execute in order:** Executes each step in sequence (code fixes, command execution in terminal, etc.)
  4. **Check results:** Checks execution results and proceeds to the next step if there are problems
- **Point:** Seeing Agent's **thinking process** lets you understand **what it's doing**. If something seems wrong, you can stop it mid-way.

**【Text Part - Detailed Explanation】**

**Page 8, bottom:**
- **Complete steps to let Agent handle multi-step tasks (reproducible):**
  1. **Open Composer:** Press `⌘+I` (Mac) / `Ctrl+I` (Win).
  2. **Switch to Agent mode:** Click "**Agent**" in the **mode selector** at the top of the Composer panel. A section to display the thinking process is added.
  3. **Enter instruction:** Write **what you want it to do** specifically in the input field (e.g., "In the `--day` feature in `log.py`, fix it to display 'No log for that day' when there are 0 matching lines, test with `python log.py --day 2025-12-31`, and verify").
  4. **Click Generate (or Run):** Click the **Generate** button on the right side of the input field.
  5. **Check thinking process:** Agent displays "Step 1: ○○", "Step 2: ○○". **Always check with your eyes**.
  6. **Monitor execution:** Agent executes each step in sequence (code fixes, command execution in terminal, etc.). Watch the terminal open automatically and commands execute.
  7. **Check results:** Check execution results. If there are problems, give Agent additional instructions.

---

### **Section 8.3: Multi-Step Tasks — From Request to Completion (Pages 9-13)**

**【Manga Part】**

**Manga Scene 4-1 (Page 9):**
- **Panel 1:** David explains: "Agent handles **multi-step tasks** automatically **from request to completion**."
- **David:** "For example, if you instruct it to 'fix the bug, test it, and verify', Agent **thinks from start to finish** and executes. If there's a problem along the way, it may **judge and proceed to the next step** on its own."

**Panel 2:** Alex asks: "What if Agent makes a mistake mid-way?"
- **David:** "You can see Agent's **thinking process**, and if something seems wrong, you can **stop it mid-way**. Agent is a **helper**; you make the final judgment. However, writing **what to do** specifically makes Agent less likely to make mistakes."

**Panel 3:** Alex says: "I want to try letting Agent handle a multi-step task in `daily_log`."
- **David:** "Let's let Agent handle the bug fix in `log.py`. Watch how Agent moves while checking the **thinking process**."

**【Manga Part】**

**Manga Scene 4-2 (Pages 10-11):**
- **Panel 1:** Alex types an instruction in Agent mode Composer.
- **Alex (input):** "In the `--day` feature in `@log.py`, fix it to display 'No log for that day' when there are 0 matching lines, test with `python log.py --day 2025-12-31`, and verify that 'No log for that day' is displayed"
- **David:** "You've written **what to fix**, **how to test**, and **what to verify**. With this level of specificity, Agent is less likely to get confused."

**Panel 2:** Agent displays the thinking process and executes in sequence.
- **Agent (thinking display):**
  - "Step 1: Read the `--day` block in `log.py` and check processing for when there are 0 matching lines"
  - "Step 2: Add processing to display 'No log for that day' when there are 0 matching lines"
  - "Step 3: Save the fixed `log.py`"
  - "Step 4: Run `python log.py --day 2025-12-31` in terminal"
  - "Step 5: Verify that execution result shows 'No log for that day'"
- **Visual representation:** Each step executes in sequence, and at Step 4, the terminal opens and the command runs. Execution results are displayed.

**Panel 3:** Agent checks execution results and displays "Step 5: Execution results checked. 'No log for that day' is displayed. Task complete."
- **Alex:** "Agent did everything **from start to finish** automatically. Much easier than doing it manually."
- **David:** "Being able to let it handle **multi-step tasks** together is Agent's strength. However, **always check the thinking process** and get in the habit of stopping if something seems wrong."

**【Infographic Part】**

**Pages 11-12:**
- **Example of multi-step tasks Agent executes:**
  | Step | Agent's action |
  |------|----------------|
  | Step 1 | Check the `--day` block in `log.py` |
  | Step 2 | Add processing for when there are 0 matching lines |
  | Step 3 | Save the fixed code |
  | Step 4 | Run `python log.py --day 2025-12-31` in terminal |
  | Step 5 | Check execution results and verify they match expectations |
- **Point:** Agent thinks and executes **from request to completion**. Seeing the **thinking process** helps you understand **what it's doing**.

---

### **Section 8.4: Real Examples — Bug Fixing and Testing (Pages 13-17)**

**【Manga Part】**

**Manga Scene 5-1 (Page 13):**
- **Panel 1:** David suggests: "Let's do another example in `daily_log`."
- **David:** "This time, let's assume a **different bug** in `log.py` and let Agent handle fix + test. For example, add error handling for when the date format is wrong in `--day` (like `2025/01/21` with `/` separators)."

**Panel 2:** Alex types an instruction in Agent mode Composer.
- **Alex (input):** "In the `--day` feature in `@log.py`, fix it to display an error message when the date format is not `YYYY-MM-DD` (e.g., `2025/01/21`), test with `python log.py --day 2025/01/21`, and verify that an error message is displayed"
- **David:** "You've written **what bug to fix** and **how to test** specifically. Agent is less likely to get confused."

**Panel 3:** Agent displays the thinking process and starts execution.
- **Agent (thinking display):**
  - "Step 1: Check date format validation in the `--day` block in `log.py`"
  - "Step 2: Add error handling for when format is not `YYYY-MM-DD`"
  - "Step 3: Save the fixed code"
  - "Step 4: Run `python log.py --day 2025/01/21` in terminal"
  - "Step 5: Verify that an error message is displayed"
- **Visual representation:** Each step executes in sequence, and at Step 4, the terminal opens and the command runs. An error message is displayed.

**【Manga Part】**

**Manga Scene 5-2 (Pages 14-15):**
- **Panel 1:** Agent checks execution results and displays "Step 5: Execution results checked. Error message is displayed. Task complete."
- **Alex:** "Agent did everything from **bug fix + test execution + verification**. Much faster than doing it manually."
- **David:** "Being able to let it handle **multi-step tasks** together is Agent's strength. However, **always check the thinking process** and get in the habit of stopping if something seems wrong mid-way."

**Panel 2:** Alex asks: "What if Agent makes a mistake mid-way?"
- **David:** "You can see Agent's **thinking process**, and if something seems wrong, you can **stop it mid-way**. Use the **Stop** button in Composer (or `Ctrl+C`) to stop, then give **additional instructions** or fix it manually yourself."

**Panel 3:** Alex asks: "How do I choose between tasks for Agent and tasks to do myself?"
- **David:** "**Multi-step tasks** (fix + test + verify) suit Agent. For **large design changes** or **organizing multiple files**, first look at proposals carefully in Normal mode, then decide—that's the recommended approach."

**【Infographic Part】**

**Pages 15-16:**
- **Tasks suited for Agent vs Normal mode:**
  | Suited for Agent | Suited for Normal mode |
  |------------------|------------------------|
  | Bug fixes + test execution | Large design changes |
  | Code generation + execution verification | Organizing multiple files |
  | Multi-step tasks | When you want to look at proposals carefully |
- **Point:** **Multi-step tasks** → Agent, **tasks you want to think through carefully** → Normal mode—that's the recommended distinction.

**【Text Part - Detailed Explanation】**

**Page 16, bottom:**
- **Complete steps to let Agent handle bug fixes + test execution (reproducible):**
  1. **Open Composer and switch to Agent mode:** `⌘+I` / `Ctrl+I` → Click "Agent" in mode selector
  2. **Enter instruction:** Write specifically like "In the ○○ feature in `@log.py`, fix △△, test with `python log.py ...`, and verify that ×× is displayed"—write **what to fix, how to test, what to verify** specifically
  3. **Click Generate:** Agent starts displaying thinking process
  4. **Check thinking process:** "Step 1: ○○", "Step 2: ○○" are displayed. **Always check with your eyes**
  5. **Monitor execution:** Agent executes each step in sequence (code fixes, command execution in terminal, etc.). Watch the terminal open automatically and commands execute
  6. **Check results:** Check execution results and verify they match expectations. If there are problems, give Agent additional instructions or fix manually yourself
  7. **Stop mid-way (if needed):** If the thinking process seems wrong, stop with the **Stop** button (or `Ctrl+C`)

---

### **Chapter Summary (Pages 17-18)**

**【Manga Part】**

**Manga Scene 6 (Page 17):**
- **Panel 1:** Alex looks at the results of the bug fix Agent executed with `log.py` open.
- **Alex:** "I could let it handle **multi-step tasks** together, which was easy. Seeing the **thinking process** helped me understand **what it was doing**."
- **David:** "That's the right feeling. Agent is a **helper**; **always check the thinking process** and get in the habit of stopping if something seems wrong."

**Panel 2:** David summarizes the chapter points.
- **David:** "In this chapter, we (1) learned that manually doing **multi-step tasks** (bug fixes + test execution, etc.) is tedious, (2) learned that Agent **thinks step by step and executes commands**, (3) experienced letting Agent handle **bug fixes + test execution** in `daily_log`, (4) developed the habit of checking Agent's **thinking process** and understanding **what it's doing**. That's what we covered."
- **Alex:** "Yes. I learned how to distinguish between tasks for Agent and tasks to do myself."

**【Infographic Part】**

**Pages 17-18:**
- Chapter 8 summary:
  - ✅ Manually doing **multi-step tasks** (bug fixes + test execution, etc.) is tedious → Can let Agent handle it
  - ✅ Agent **thinks step by step and executes commands**. **Thinking process** is displayed
  - ✅ Experienced letting Agent handle **bug fixes + test execution** in `daily_log`
  - ✅ Developed the habit of checking Agent's **thinking process** and understanding **what it's doing**
  - ✅ **When to use which:** Multi-step tasks → Agent, tasks you want to think through carefully → Normal mode
- **Practice Checklist (try right away):**
  - [ ] Open Composer (`⌘+I` / `Ctrl+I`) and switch to **Agent mode**
  - [ ] Instruct: "In the `--day` feature in `log.py`, fix it to display 'No log for that day' when there are 0 matching lines, test and verify"
  - [ ] Check Agent's **thinking process** (Step 1, Step 2...)
  - [ ] Monitor Agent executing commands in the terminal
  - [ ] Check execution results and verify they match expectations

**【Manga Part】**

**Manga Scene 6-2 (Page 18):**
- **Panel 1:** Alex and David talk about the next chapter.
- **Alex:** "What's next?"
- **David:** "In **Chapter 9**, we'll cover **debugging** in detail. We'll learn how to read error messages, how to fix errors with Cursor, and the step-by-step debugging process by actually creating errors in `daily_log` and fixing them."

**【Infographic Part】**

**Page 18:**
- Next chapter preview:
  - **Chapter 9: Debugging Made Simple**
  - How to read error messages, how to fix errors with Cursor
  - Flow of creating errors in `daily_log` and fixing them

---

## ✅ Review Points

Points to check in this Japanese translation (same criteria as Chapter 1: **thoroughness, clarity, practicality**):

1. **Clarity of the problem:** Does the reader understand the difficulty of "manually doing multi-step tasks is tedious"?
2. **How to open Agent mode:** Are the **specific operations** (open Composer → click "Agent" in mode selector) reproducible so readers can **follow the steps exactly**?
3. **Display of thinking process:** Is the **specific appearance** of Agent displaying "Step 1: ○○", "Step 2: ○○" as thinking process described at the same level as Chapter 1?
4. **Detailed explanation:** Does "Text Part - Detailed Explanation" include **complete reproducible steps** like **mode selector position**, **thinking process display**, **automatic terminal execution**, etc.?
5. **Familiarity of examples:** Are examples of bug fixes + test execution using `log.py` in `daily_log` easy for beginners to try?
6. **Clarity of distinctions:** Is the **comparison table** of Agent vs Normal mode as clear as Chapter 1's "good examples vs bad examples"?
7. **Consistency with Chapter 5:** Does the Agent explanation match Chapter 5 and function as a **detailed version**?
8. **Connection to next chapter:** Does it naturally lead to Chapter 9's debugging (error fixing)?

---

**Chapter 8 - Complete**
