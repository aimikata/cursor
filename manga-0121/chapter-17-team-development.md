# Chapter 17: Using Cursor in Team Development

## 📖 Chapter Overview

**Chapter Title:** Using Cursor in Team Development  
**Page Count:** 20-22 pages (optimized for visual learning)  
**Learning Objectives:**
- Learn how to **share `.cursorrules` with the team** (include in Git repository, best practices for sharing)
- Learn how to **use Cursor in code reviews** (explain changes, point out potential issues, suggest improvements)
- Learn **best practices for team development** (updating `.cursorrules`, unifying code style, communication)

---

## 🎬 Story Structure

### **Opening Scene (Pages 1-2): Challenges in Team Development**

**【Manga Part】**

**Setting:** Alex's apartment. The `daily_log` project is open, and Alex is using Cursor. Recently joined team development.

**Manga Scene 1 (Page 1):**
- **Panel 1:** Alex is told by a team member: "Code styles are inconsistent. Let's unify them."
- **Alex (thinking):** "I created `.cursorrules`, but how can I make **all team members use the same rules**?"

**Panel 2:** Alex is asked in a code review: "What does this change do?"
- **Alex (thinking):** "Explaining changes in code reviews is hard. Can I use Cursor to **automatically explain changes**?"

**Panel 3:** David appears via video call.
- **David:** "In team development, it's recommended to **share `.cursorrules`** and **use Cursor in code reviews**. Since we created `.cursorrules` in Chapter 12, let's learn how to **share it with the team** and **use it in code reviews**."
- **Alex:** "Please teach me how to use Cursor in team development."

**【Infographic Part】**

**Pages 1-2, bottom:**
- **What we'll learn in this chapter:** How to use Cursor in team development
- **Problem:** In team development, code styles are inconsistent, explaining changes in code reviews is hard
- **Solution:** **Share `.cursorrules` with the team** → **Use Cursor in code reviews** → **Practice best practices**
- **What to use:** `.cursorrules` file, Git repository, Cursor's **Chat** (`⌘+L` / `Ctrl+L`), **Composer** (`⌘+I` / `Ctrl+I`)

---

### **Section 17.1: Sharing `.cursorrules` with the Team (Pages 3-9)**

**【Manga Part】**

**Manga Scene 2 (Page 3):**
- **Panel 1:** David explains: "In team development, **sharing `.cursorrules`** lets **everyone use the same rules**."
- **David:** "We created `.cursorrules` in Chapter 12, but to have **all team members use the same rules**, **including it in the Git repository** is the easiest way."

**Panel 2:** Alex asks: "How do I include `.cursorrules` in the Git repository?"
- **David:** "Place the `.cursorrules` file in the project's **root directory** and **commit it to Git**. When team members clone the repository, **`.cursorrules` is automatically included**, so everyone can use the same rules."

**Panel 3:** Alex leans forward: "I want to actually include `.cursorrules` in the Git repository for the `daily_log` project."
- **David:** "Let's experience the flow of placing the `.cursorrules` file in the project's root directory and committing it to Git."

**【Infographic Part】**

**Pages 3-4:**
- **How to share `.cursorrules` with the team:**
  1. **Place `.cursorrules` file in project root directory:** Create a `.cursorrules` file in the project's root directory (directly under the `daily_log` folder)
  2. **Commit to Git:** Commit the `.cursorrules` file to Git (`git add .cursorrules`, `git commit -m "Add .cursorrules"`)
  3. **Team members clone repository:** When team members clone the repository, **`.cursorrules` is automatically included**
  4. **Everyone uses the same rules:** All team members using the same `.cursorrules` **unifies code style**
- **Point:** Including `.cursorrules` in the Git repository maintains **consistency across the team**.

**【Manga Part】**

**Manga Scene 3-1 (Pages 4-5):**
- **Panel 1:** Alex creates a `.cursorrules` file in the `daily_log` project's root directory.
- **David:** "Place the `.cursorrules` file in the project's root directory (directly under the `daily_log` folder). Right-click `daily_log` in EXPLORER → 'New File' → type `.cursorrules` and press Enter."
- **Visual representation:** Right-clicking `daily_log` in EXPLORER, selecting 'New File', and typing `.cursorrules`.

**Panel 2:** Alex writes project rules in the `.cursorrules` file.
- **Alex (`.cursorrules` content):**
  ```
  # Code Style
  - Use `snake_case` for function names
  - Write comments in Japanese
  - Use 4 spaces for indentation
  
  # Project Rules
  - `log.py` is a script that appends logs to `daily_log.txt`
  - `--day` option displays only that day's lines
  ```
- **David:** "As learned in Chapter 12, write **project rules** in the `.cursorrules` file. Write clearly so **all team members can understand**."

**Panel 3:** Alex commits to Git in the terminal.
- **David:** "In the terminal, run `git add .cursorrules` and `git commit -m "Add .cursorrules for team"` to commit to Git. When team members clone the repository, **`.cursorrules` is automatically included**."
- **Visual representation:** Running `git add .cursorrules` and `git commit -m "Add .cursorrules for team"` in the terminal.

**【Text Part - Detailed Explanation】**

**Pages 5-6, bottom:**
- **Complete steps to share `.cursorrules` with the team (reproducible as-is):**
  1. **Create `.cursorrules` file:** Right-click the project's root directory (`daily_log` folder) in EXPLORER → "**New File**" → type `.cursorrules` and press Enter
  2. **Write rules in `.cursorrules` file:** Open the `.cursorrules` file and write project rules (code style, how to write comments, etc.)
  3. **Commit to Git:** In the terminal, type `git add .cursorrules` and press Enter. Then type `git commit -m "Add .cursorrules for team"` and press Enter
  4. **Push to remote repository (when needed):** Push to the remote repository with `git push`
  5. **Team members clone repository:** When team members clone with `git clone`, **`.cursorrules` is automatically included**
  6. **Everyone uses the same rules:** All team members using the same `.cursorrules` **unifies code style**

**【Manga Part】**

**Manga Scene 3-2 (Pages 6-7):**
- **Panel 1:** David explains: "Let's remember **best practices** for sharing `.cursorrules`."
- **David:** "(1) **Write clearly**: Write specifically so all team members can understand. (2) **Update regularly**: When project rules change, update `.cursorrules` too. (3) **Review**: When changing `.cursorrules`, **review** with team members before committing."

**Panel 2:** Alex asks: "How do I update `.cursorrules`?"
- **David:** "After updating `.cursorrules`, **commit to Git** and have team members **pull**. Writing change details in the **commit message** makes it easier for team members to see **what changed**."

**Panel 3:** Alex asks: "What should I do when a team member updates `.cursorrules`?"
- **David:** "Updating the repository with `git pull` **automatically fetches the latest `.cursorrules`**. Restarting Cursor **applies the new rules**."

**【Infographic Part】**

**Pages 7-8:**
- **Best practices for sharing `.cursorrules`:**
  | Item | Content |
  |------|---------|
  | **Write clearly** | Write specifically so all team members can understand |
  | **Update regularly** | When project rules change, update `.cursorrules` too |
  | **Review** | When changing `.cursorrules`, **review** with team members before committing |
  | **Write in commit message** | Writing change details in the **commit message** makes it easier for team members to see **what changed** |
  | **Pull and apply** | Updating the repository with `git pull` **automatically fetches the latest `.cursorrules`**. Restarting Cursor **applies the new rules** |
- **Point:** Sharing `.cursorrules` maintains **consistency across the team**. Update regularly so **all team members use the latest rules**.

---

### **Section 17.2: Using Cursor in Code Reviews (Pages 9-15)**

**【Manga Part】**

**Manga Scene 4-1 (Page 9):**
- **Panel 1:** David explains: "Using Cursor in **code reviews** lets you **explain changes** and **point out potential issues**."
- **David:** "When explaining changes in code reviews is hard, paste changes into Cursor's **Chat** and ask **'What does this change do? Are there potential issues?'** and it will **explain clearly**."

**Panel 2:** Alex asks: "How do I use Cursor in code reviews?"
- **David:** "(1) **Have changes explained**: Paste changes into Chat and ask **'What does this change do?'**. (2) **Have potential issues pointed out**: Ask **'Are there potential issues with this change?'**. (3) **Get improvement suggestions**: Ask **'How can I improve this change?'**."

**Panel 3:** Alex says: "I want to experience the code review flow in `daily_log`."
- **David:** "Let's make changes to `log.py` and experience the flow of code reviewing with Cursor."

**【Manga Part】**

**Manga Scene 4-2 (Pages 10-11):**
- **Panel 1:** Alex makes changes to `log.py` (e.g., add error handling to the `--day` feature).
- **David:** "First, make changes to `log.py`. As an example, let's add **error handling** to the `--day` feature."

**Panel 2:** Alex opens Cursor's **Chat** (`⌘+L` / `Ctrl+L`), pastes changes, and asks questions.
- **Alex (input):** "What does this change do? Are there potential issues? How can I improve it?"
- **David:** "**Copy** changes, **paste** into Chat, and ask **specific questions**. Cursor will **explain changes**, **point out potential issues**, and **suggest improvements**."
- **Visual representation:** Chat panel open, Alex pasting changes and asking questions.

**Panel 3:** Cursor explains changes, points out potential issues, and suggests improvements.
- **Cursor (response):** "This change adds error handling to the `--day` feature. A potential issue is that **handling for incorrect date formats** is missing. As an improvement, I recommend adding **date format validation**."
- **Alex:** "Cursor **explained changes**, **pointed out potential issues**, and **suggested improvements**. This seems useful for code reviews."

**【Infographic Part】**

**Pages 11-12:**
- **How to use Cursor in code reviews:**
  | Purpose | Example Question |
  |---------|------------------|
  | **Have changes explained** | "What does this change do?" |
  | **Have potential issues pointed out** | "Are there potential issues with this change?" |
  | **Get improvement suggestions** | "How can I improve this change?" |
- **Point:** Using Cursor in code reviews lets you **explain changes**, **point out potential issues**, and **get improvement suggestions**.

**【Text Part - Detailed Explanation】**

**Page 12, bottom:**
- **Complete steps to use Cursor in code reviews (reproducible as-is):**
  1. **Copy changes:** **Select** changed code with the mouse and copy with `⌘+C` (Mac) / `Ctrl+C` (Win)
  2. **Open Chat:** Press `⌘+L` (Mac) / `Ctrl+L` (Win) or click menu "**View**" → "**Command Palette**" → "**Cursor: Open Chat**"
  3. **Paste changes and ask questions:** **Paste** changes (`⌘+V` / `Ctrl+V`) in Chat's input field and type **"What does this change do? Are there potential issues? How can I improve it?"**
  4. **Click Send button:** Click the **Send** button (or press `Enter`) on the right side of the input field
  5. **Read Cursor's explanation:** Cursor **explains changes**, **points out potential issues**, and **suggests improvements**. **Always check with your eyes** and understand **why those issues exist and how to improve**
  6. **Implement improvement suggestions (when needed):** To implement improvements, give instructions in **Composer** (`⌘+I` / `Ctrl+I`)

**【Manga Part】**

**Manga Scene 4-3 (Pages 13-14):**
- **Panel 1:** David explains: "You can also use **Composer** in code reviews."
- **David:** "When implementing improvements, instruct **Composer** **'Please improve this change. Add date format validation'** and it will **automatically improve**."

**Panel 2:** Alex opens Composer (`⌘+I` / `Ctrl+I`) and enters improvement instructions.
- **Alex (input):** "Add date format validation to the `--day` feature in `log.py`. Display an error message if the format is not `YYYY-MM-DD`."
- **Visual representation:** Composer panel open, Alex entering improvement instructions.

**Panel 3:** Cursor implements improvements, and Alex clicks the **Accept** button.
- **Alex:** "Cursor **automatically improved** it. In code reviews, I can **explain changes**, **point out potential issues**, and **implement improvements**."

**【Infographic Part】**

**Pages 14-15:**
- **Flow of using Cursor in code reviews:**
  1. **Copy changes:** Copy changed code
  2. **Ask in Chat:** Paste changes into Chat and ask **"What does this change do? Are there potential issues?"**
  3. **Check improvement suggestions:** Check Cursor's improvement suggestions
  4. **Implement with Composer (when needed):** To implement improvements, give instructions in **Composer**
  5. **Re-review:** Re-review the improved code
- **Point:** Using Cursor in code reviews lets you **explain changes**, **point out potential issues**, and **implement improvements**.

---

### **Section 17.3: Best Practices for Team Development (Pages 15-19)**

**【Manga Part】**

**Manga Scene 5-1 (Page 15):**
- **Panel 1:** David explains: "Let's remember **best practices** for team development."
- **David:** "(1) **Update `.cursorrules` regularly**: When project rules change, update `.cursorrules` too. (2) **Unify code style**: Sharing `.cursorrules` **unifies code style**. (3) **Communicate**: When changing `.cursorrules`, **communicate** with team members."

**Panel 2:** Alex asks: "How should I use Cursor in team development?"
- **David:** "(1) **Use in code reviews**: Explain changes and point out potential issues. (2) **Share `.cursorrules`**: All team members use the same rules. (3) **Update regularly**: Update `.cursorrules` regularly so **all team members use the latest rules**."

**Panel 3:** Alex says: "Please summarize best practices for team development."
- **David:** "Let's summarize best practices for team development in a **table format**."

**【Infographic Part】**

**Pages 15-16:**
- **Best practices for team development:**
  | Item | Content |
  |------|---------|
  | **Update `.cursorrules` regularly** | When project rules change, update `.cursorrules` too |
  | **Unify code style** | Sharing `.cursorrules` **unifies code style** |
  | **Communicate** | When changing `.cursorrules`, **communicate** with team members |
  | **Use Cursor in code reviews** | Explain changes and point out potential issues |
  | **Implement improvements** | When implementing improvements, give instructions in **Composer** |
- **Point:** In team development, **sharing `.cursorrules`** and **using Cursor in code reviews** **unifies code style** and **makes code reviews efficient**.

**【Manga Part】**

**Manga Scene 5-2 (Pages 16-17):**
- **Panel 1:** Alex asks: "Are there any **precautions** when using Cursor in team development?"
- **David:** "(1) **Share `.cursorrules`**: Make all team members use the same rules. (2) **Update regularly**: Update `.cursorrules` regularly so **all team members use the latest rules**. (3) **Communicate**: When changing `.cursorrules`, **communicate** with team members."

**Panel 2:** Alex says: "Please show me **good examples and bad examples** of using Cursor in team development."
- **David:** "**Good examples**: (1) Include `.cursorrules` in the Git repository so all team members use the same rules. (2) Use Cursor in code reviews to explain changes and point out potential issues. (3) Update `.cursorrules` regularly so **all team members use the latest rules**. **Bad examples**: (1) Don't share `.cursorrules` and each person uses their own rules. (2) Don't use Cursor in code reviews and review manually. (3) Don't update `.cursorrules` and keep using old rules."

**Panel 3:** Alex says: "I want to practice best practices for team development."
- **David:** "Let's experience the flow of sharing `.cursorrules` and using Cursor in code reviews in the `daily_log` project again."

**【Infographic Part】**

**Pages 17-18:**
- **Good examples vs bad examples:**
  | Item | Good Example | Bad Example |
  |------|--------------|-------------|
  | **Sharing `.cursorrules`** | Include in Git repository so all team members use the same rules | Don't share `.cursorrules` and each person uses their own rules |
  | **Code reviews** | Use Cursor to explain changes and point out potential issues | Don't use Cursor and review manually |
  | **Updating `.cursorrules`** | Update regularly so **all team members use the latest rules** | Don't update and keep using old rules |
- **Point:** In team development, **sharing `.cursorrules`** and **using Cursor in code reviews** **unifies code style** and **makes code reviews efficient**.

---

### **Chapter Summary (Pages 19-20)**

**【Manga Part】**

**Manga Scene 6 (Page 19):**
- **Panel 1:** Alex looks at the `.cursorrules` file and code review results with the `daily_log` project open.
- **Alex:** "In team development, **sharing `.cursorrules`** and **using Cursor in code reviews** **unified code style** and **made code reviews efficient**."
- **David:** "That's the right feeling. In team development, **sharing `.cursorrules`** and **using Cursor in code reviews** maintains **consistency across the team**."

**Panel 2:** David summarizes chapter points.
- **David:** "In this chapter, we (1) learned how to **share `.cursorrules` with the team** (include in Git repository, best practices for sharing), (2) learned how to **use Cursor in code reviews** (explain changes, point out potential issues, suggest improvements), (3) learned **best practices for team development** (updating `.cursorrules`, unifying code style, communication). That's what we covered."
- **Alex:** "I understand how to use Cursor in team development."

**【Infographic Part】**

**Pages 19-20:**
- Chapter 17 summary:
  - ✅ How to **share `.cursorrules` with the team**: Include in Git repository, best practices for sharing
  - ✅ How to **use Cursor in code reviews**: Explain changes, point out potential issues, suggest improvements
  - ✅ **Best practices for team development**: Updating `.cursorrules`, unifying code style, communication
  - ✅ **Good examples vs bad examples**: Sharing `.cursorrules`, code reviews, updating `.cursorrules`
- **Practice checklist (try now):**
  - [ ] Create a `.cursorrules` file in the `daily_log` project's root directory
  - [ ] Write project rules in the `.cursorrules` file
  - [ ] Commit to Git (`git add .cursorrules`, `git commit -m "Add .cursorrules for team"`)
  - [ ] Make changes to `log.py` and code review with Cursor's **Chat**
  - [ ] Implement improvements with **Composer**

**【Manga Part】**

**Manga Scene 6-2 (Page 20):**
- **Panel 1:** Alex and David talk about the next chapter.
- **Alex:** "What's next?"
- **David:** "**Chapter 18** covers **solutions to common problems** in detail. We'll learn how to handle errors, performance issues, and security best practices by creating and solving problems in `daily_log`."

**【Infographic Part】**

**Page 20:**
- Next chapter preview:
  - **Chapter 18: Solutions to Common Problems**
  - How to handle errors, performance issues, security best practices
  - Creating and solving problems in `daily_log`

---

**Chapter 17 - Complete**
