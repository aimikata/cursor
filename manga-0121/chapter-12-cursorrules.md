# Chapter 12: .cursorrules — Teaching AI Project Rules

## 📖 Chapter Overview

**Chapter Title:** .cursorrules — Teaching AI Project Rules  
**Page Count:** 18-20 pages (optimized for visual learning)  
**Learning Objectives:**
- Understand the problems: "Explaining the same things every time wastes time" and "Do I need to create .cursorrules?"
- Understand **why .cursorrules is needed** (explaining the same things every time wastes time, can share with team, maintains consistency, etc.)
- Learn how to create a `.cursorrules` file and teach project rules to Cursor
- Learn how to share `.cursorrules` with a team

---

## 🎬 Story Structure

### **Opening Scene (Pages 1-2): What's the Problem?**

**【Manga Part】**

**Setting:** Alex's apartment. The `daily_log` project is open, and Alex is using Cursor's **Chat** and **Composer**. Feels that explaining the same things every time is tedious.

**Manga Scene 1 (Page 1):**
- **Panel 1:** Alex instructs in Cursor's **Chat**: "Unify code style in `log.py`. Use `snake_case` for function names, write comments in Japanese."
- **Alex (thinking):** "Explaining the same things every time is tedious... Code style, how to write comments—**I feel like I'm saying the same things every time**."

**Panel 2:** Alex instructs in Cursor's **Composer**: "Add a new feature to `log.py`. Use `snake_case` for function names, write comments in Japanese."
- **Alex (thinking):** "I explained the same thing again... **Explaining the same things every time wastes time**. Can't I be more efficient?"

**Panel 3:** David appears via video call.
- **David:** "You can solve that by creating a **`.cursorrules`** file. Writing project rules (code style, how to write comments, etc.) in a `.cursorrules` file makes Cursor **understand automatically**. You won't need to explain the same things every time."
- **Alex:** "How do I create `.cursorrules`? Also, **can't I just explain every time? Do I need to create .cursorrules?**"

**【Infographic Part】**

**Pages 1-2, bottom:**
- **What you'll learn in this chapter:** How to create `.cursorrules` files, how to teach project rules to Cursor
- **Problem:** Explaining the same things every time wastes time, **can't I just explain every time? Do I need to create .cursorrules?**
- **Solution:** Understand **why .cursorrules is needed** → Create `.cursorrules` file and write project rules → Cursor understands automatically
- **Benefits:** (1) **No need to explain the same things every time** (saves time), (2) **can share with team** (all team members can use the same rules), (3) **maintains consistency** (same code style across the project), (4) **makes project rules clear** (looking at `.cursorrules` shows what rules exist)
- **What to use:** `.cursorrules` file, Cursor's **Chat** (`⌘+L` / `Ctrl+L`), **Composer** (`⌘+I` / `Ctrl+I`)

---

### **Section 12.1: The Problem—"Explaining the Same Things Every Time Wastes Time" and "Do I Need to Create .cursorrules?" (Pages 3-4)**

**【Manga Part】**

**Manga Scene 2 (Page 3):**
- **Panel 1:** David explains: "First, let's understand **why .cursorrules is needed**."
- **David:** "Explaining the same things every time **takes time** and has a **risk of oversight**. Creating a `.cursorrules` file makes Cursor **understand automatically**, so **you won't need to explain the same things every time**."

**Panel 2:** Alex asks: "But **can't I just explain every time? Do I need to create .cursorrules?**"
- **David:** "Explaining every time **wastes time** and has a **risk of oversight**. Creating a `.cursorrules` file has benefits: (1) **no need to explain the same things every time** (saves time), (2) **can share with team** (all team members can use the same rules), (3) **maintains consistency** (same code style across the project), (4) **makes project rules clear** (looking at `.cursorrules` shows what rules exist)."

**Panel 3:** Alex asks: "How do I create a `.cursorrules` file?"
- **David:** "Just create a `.cursorrules` file in the project root directory and write project rules. Ask Cursor's **Chat** or **Composer** to 'create a `.cursorrules` file and write project rules' and it will generate it automatically."

**【Infographic Part】**

**Pages 3-4:**
- **Problem summary:**
  - Explaining the same things every time wastes time
  - **Can't I just explain every time? Do I need to create .cursorrules?**
  - Don't know what happens if you don't create `.cursorrules`
- **Solution approach:** Understand **why .cursorrules is needed** → Create `.cursorrules` file and write project rules → Cursor understands automatically
- **What happens if you don't create .cursorrules:**
  - **Need to explain the same things every time** (takes time)
  - **Risk of oversight** (forget to explain sometimes)
  - **Can't share with team** (team members can't use the same rules)
  - **Can't maintain consistency** (code style varies across the project)
  - **Project rules aren't clear** (don't know what rules exist)
- **What happens if you create .cursorrules:**
  - **No need to explain the same things every time** (saves time)
  - **No oversight** (written in `.cursorrules`, so you don't forget)
  - **Can share with team** (all team members can use the same rules)
  - **Maintains consistency** (same code style across the project)
  - **Project rules become clear** (looking at `.cursorrules` shows what rules exist)

---

### **Section 12.2: Why .cursorrules Is Needed (Pages 5-8)**

**【Manga Part】**

**Manga Scene 3 (Page 5):**
- **Panel 1:** David explains: "Let's see specifically **what happens if you don't create .cursorrules**."
- **David:** "For example, explaining 'use `snake_case` for function names, write comments in Japanese' every time in Cursor's **Chat** or **Composer** **takes time** and has a **risk of oversight**. Creating a `.cursorrules` file makes it **understand automatically**, so **you won't need to explain the same things every time**."

**Panel 2:** Alex asks: "But **can't I just explain every time? Do I need to create .cursorrules?**"
- **David:** "Explaining every time **wastes time** and has a **risk of oversight**. Also, **can't share with team**, so team members can't use the same rules. Creating a `.cursorrules` file lets **all team members use the same rules**, so **consistency is maintained**."

**Panel 3:** Alex asks: "What are the benefits of creating `.cursorrules`?"
- **David:** "Creating `.cursorrules` has benefits: (1) **no need to explain the same things every time** (saves time), (2) **can share with team** (all team members can use the same rules), (3) **maintains consistency** (same code style across the project), (4) **makes project rules clear** (looking at `.cursorrules` shows what rules exist)."

**【Infographic Part】**

**Pages 5-8:**
- **What happens if you don't create .cursorrules:**
  | Situation | Problem | Result |
  |-----------|---------|--------|
  | **When explaining every time** | Takes time, risk of oversight | **Inefficient** |
  | **When sharing with team** | Team members can't use the same rules | **Can't maintain consistency** |
  | **When checking project rules** | Don't know what rules exist | **Rules aren't clear** |
  | **When new members join** | Need to explain rules | **Takes time** |

- **What happens if you create .cursorrules:**
  | Situation | Benefit | Result |
  |-----------|---------|--------|
  | **When explaining every time** | No need to explain the same things every time (saves time) | **More efficient** |
  | **When sharing with team** | All team members can use the same rules | **Consistency is maintained** |
  | **When checking project rules** | Looking at `.cursorrules` shows what rules exist | **Rules become clear** |
  | **When new members join** | Looking at `.cursorrules` shows the rules | **Saves time** |

- **Benefits of .cursorrules:**
  1. **No need to explain the same things every time** (saves time)
  2. **Can share with team** (all team members can use the same rules)
  3. **Maintains consistency** (same code style across the project)
  4. **Makes project rules clear** (looking at `.cursorrules` shows what rules exist)

---

### **Section 12.3: Creating a .cursorrules File (Pages 9-14)**

**【Manga Part】**

**Manga Scene 4 (Page 9):**
- **Panel 1:** David explains: "Let's create a `.cursorrules` file for the `daily_log` project."
- **David:** "Create a `.cursorrules` file in the project root directory and write project rules. For example, code style, how to write comments, function naming conventions, etc. Ask Cursor's **Chat** or **Composer** to 'create a `.cursorrules` file and write rules for the `daily_log` project. Use `snake_case` for function names, write comments in Japanese' and it will generate it automatically."

**Panel 2:** Alex asks: "What should I write in the `.cursorrules` file?"
- **David:** "Write project rules. For example, (1) **code style** (use `snake_case` for function names, use `snake_case` for variable names, etc.), (2) **how to write comments** (write comments in Japanese, etc.), (3) **how to write functions** (write docstrings for functions, etc.), (4) **file structure** (test files start with `test_`, etc.)."

**Panel 3:** Alex leans forward: "I want to actually create a `.cursorrules` file in `daily_log`."
- **David:** "Let's ask Cursor's **Chat** to 'create a `.cursorrules` file and write rules for the `daily_log` project'. Then experience the flow of creating `.cursorrules` files with **Composer**."

**【Infographic Part】**

**Pages 9-10:**
- **Flow of creating .cursorrules files:**
  1. **Ask in Chat:** Open Chat (`⌘+L` / `Ctrl+L`) and ask **"Create a `.cursorrules` file and write rules for the `daily_log` project. Use `snake_case` for function names, write comments in Japanese"**. Click the **Send** button
  2. **Check Cursor's suggestion:** Cursor displays `.cursorrules` file suggestions. **Always check with your eyes** and understand **what rules are written**
  3. **Generate with Composer:** Open Composer (`⌘+I` / `Ctrl+I`) and instruct **"Create a `.cursorrules` file and write rules for the `daily_log` project. Use `snake_case` for function names, write comments in Japanese"**. Click the **Generate** button
  4. **Check generated .cursorrules:** **Always check with your eyes** the `.cursorrules` file content displayed in the Composer panel. Understand **what rules are written**

**Pages 11-12:**
- **Practice: Consult about .cursorrules creation in Chat (Pages 11-12)**

**【Manga Part】**

**Manga Scene 5 (Page 11):**
- **Panel 1:** Alex opens Cursor's **Chat** (`⌘+L` / `Ctrl+L`) and types **"Create a `.cursorrules` file and write rules for the `daily_log` project. Use `snake_case` for function names, write comments in Japanese"**.
- **Alex (input):** "Create a `.cursorrules` file and write rules for the `daily_log` project. Use `snake_case` for function names, write comments in Japanese"

**Panel 2:** Cursor displays `.cursorrules` file suggestions.
- **Cursor (response):** "I'll create a `.cursorrules` file and write the following rules:
  ```
  # daily_log project rules
  
  ## Code Style
  - Use `snake_case` for function names
  - Use `snake_case` for variable names
  - Write comments in Japanese
  
  ## How to Write Functions
  - Write docstrings for functions (in Japanese)
  - Functions should do one thing
  
  ## File Structure
  - Test files start with `test_`
  - Main code is written in `log.py`
  ```"

**Panel 3:** Alex is worried: "A `.cursorrules` file was generated, but I don't understand **what rules are written**..."
- **David:** "It's okay. Ask Cursor's **Chat** **'What rules are written in this .cursorrules file?'** and it will explain clearly."

**【Infographic Part】**

**Pages 11-12:**
- **Steps to consult about .cursorrules creation in Chat:**
  1. **Open Chat:** Open Chat (`⌘+L` / `Ctrl+L`)
  2. **Enter question:** Type **"Create a `.cursorrules` file and write rules for the `daily_log` project. Use `snake_case` for function names, write comments in Japanese"**
  3. **Click Send button:** Click the **Send** button
  4. **Check Cursor's suggestion:** Cursor displays `.cursorrules` file suggestions. **Always check with your eyes** and understand **what rules are written**
  5. **Ask about .cursorrules file explanation:** If needed, ask Cursor's **Chat** **"What rules are written in this .cursorrules file?"**

**Pages 13-14:**
- **Practice: Create .cursorrules file with Composer (Pages 13-14)**

**【Manga Part】**

**Manga Scene 6 (Page 13):**
- **Panel 1:** Alex opens Cursor's **Composer** (`⌘+I` / `Ctrl+I`) and instructs **"Create a `.cursorrules` file and write rules for the `daily_log` project. Use `snake_case` for function names, write comments in Japanese"**.
- **Alex (input):** "Create a `.cursorrules` file and write rules for the `daily_log` project. Use `snake_case` for function names, write comments in Japanese"

**Panel 2:** Composer generates a `.cursorrules` file.
- **Composer (suggestion):** Creates a `.cursorrules` file and suggests the following content:
  ```
  # daily_log project rules
  
  ## Code Style
  - Use `snake_case` for function names
  - Use `snake_case` for variable names
  - Write comments in Japanese
  
  ## How to Write Functions
  - Write docstrings for functions (in Japanese)
  - Functions should do one thing
  
  ## File Structure
  - Test files start with `test_`
  - Main code is written in `log.py`
  ```

**Panel 3:** Alex says: "I want to check the generated `.cursorrules` file."
- **David:** "**Always check with your eyes** the `.cursorrules` file content displayed in the Composer panel and understand **what rules are written**. Then click the **Accept** button to create the `.cursorrules` file."

**【Infographic Part】**

**Pages 13-14:**
- **Steps to create .cursorrules file with Composer:**
  1. **Open Composer:** Open Composer (`⌘+I` / `Ctrl+I`)
  2. **Enter instruction:** Instruct **"Create a `.cursorrules` file and write rules for the `daily_log` project. Use `snake_case` for function names, write comments in Japanese"**
  3. **Click Generate button:** Click the **Generate** button
  4. **Check generated .cursorrules:** **Always check with your eyes** the `.cursorrules` file content displayed in the Composer panel. Understand **what rules are written**
  5. **Click Accept button:** Click the **Accept** button to create the `.cursorrules` file

- **Checkpoints for generated .cursorrules file:**
  - **What rules are written** (code style, how to write comments, how to write functions, file structure, etc.)
  - **Are rules appropriate** (do they fit the project?)
  - **Are rules clear** (are they easy to understand?)

---

### **Section 12.4: Sharing .cursorrules with a Team (Pages 15-18)**

**【Manga Part】**

**Manga Scene 7 (Page 15):**
- **Panel 1:** David explains: "After creating a `.cursorrules` file, **share it with the team**."
- **David:** "Commit the `.cursorrules` file to Git so all team members can use the same rules. This **maintains consistency across the team** and **when new members join**, they can see the rules by looking at the `.cursorrules` file."

**Panel 2:** Alex asks: "What are the benefits of sharing with the team?"
- **David:** "Sharing with the team has benefits: (1) **all team members can use the same rules** (consistency is maintained), (2) **when new members join**, they can see the rules by looking at the `.cursorrules` file (saves time), (3) **project rules become clear** (looking at `.cursorrules` shows what rules exist)."

**Panel 3:** Alex says: "Please teach me how to commit the `.cursorrules` file to Git."
- **David:** "Committing the `.cursorrules` file to Git is the same as any file. Stage with `git add .cursorrules` and commit with `git commit -m "Add .cursorrules"`. Team members can `git pull` to share the `.cursorrules` file."

**【Infographic Part】**

**Pages 15-18:**
- **Steps to share .cursorrules with team:**
  1. **Create .cursorrules file:** Create a `.cursorrules` file in the project root directory
  2. **Commit to Git:** Stage with `git add .cursorrules` and commit with `git commit -m "Add .cursorrules"`
  3. **Push to remote repository:** Push with `git push` to the remote repository
  4. **Team members pull:** Team members can `git pull` to share the `.cursorrules` file

- **Benefits of sharing with team:**
  | Situation | Benefit | Result |
  |-----------|---------|--------|
  | **When all team members use the same rules** | Consistency is maintained | **Same code style across the project** |
  | **When new members join** | Looking at `.cursorrules` shows the rules | **Saves time** |
  | **When checking project rules** | Looking at `.cursorrules` shows what rules exist | **Rules become clear** |

- **Example .cursorrules file:**
  ```
  # daily_log project rules
  
  ## Code Style
  - Use `snake_case` for function names
  - Use `snake_case` for variable names
  - Write comments in Japanese
  
  ## How to Write Functions
  - Write docstrings for functions (in Japanese)
  - Functions should do one thing
  
  ## File Structure
  - Test files start with `test_`
  - Main code is written in `log.py`
  ```

---

## 📝 Chapter Summary (Pages 19-20)

**【Manga Part】**

**Manga Scene 8 (Page 19):**
- **Panel 1:** David says: "In this chapter, we (1) understood **why .cursorrules is needed** (explaining the same things every time wastes time, can share with team, maintains consistency, etc.), (2) learned how to create a `.cursorrules` file and teach project rules to Cursor, (3) learned how to share `.cursorrules` with a team. That's what we covered."
- **Alex:** "Creating a `.cursorrules` file means **no need to explain the same things every time**. **Sharing with the team** is also convenient."

**Panel 2:** Alex confirms: "But **can't I just explain every time? Do I need to create .cursorrules?**"
- **David:** "Explaining every time **wastes time** and has a **risk of oversight**. Creating a `.cursorrules` file makes it **understand automatically**, so **you won't need to explain the same things every time**. Also, **sharing with the team** **maintains consistency**."

**Panel 3:** Alex asks: "What do we learn next?"
- **David:** "Next, let's learn about the **70% problem**. Code generated by AI is often only **about 70% complete**. Let's learn how to complete the remaining 30%."

**【Infographic Part】**

**Pages 19-20:**
- **What we learned in this chapter:**
  - ✅ Understood **why .cursorrules is needed**: explaining the same things every time wastes time, can share with team, maintains consistency, etc.
  - ✅ Learned how to create a `.cursorrules` file and teach project rules to Cursor
  - ✅ Learned how to share `.cursorrules` with a team
  - ✅ Understood **what happens if you don't create .cursorrules**: need to explain the same things every time, risk of oversight, can't share with team, can't maintain consistency, etc.
  - ✅ Understood **what happens if you create .cursorrules**: no need to explain the same things every time, can share with team, maintains consistency, project rules become clear, etc.

- **Benefits of .cursorrules:**
  1. **No need to explain the same things every time** (saves time)
  2. **Can share with team** (all team members can use the same rules)
  3. **Maintains consistency** (same code style across the project)
  4. **Makes project rules clear** (looking at `.cursorrules` shows what rules exist)

- **Next chapter:** Chapter 13 "The 70% Problem: Completing AI-Generated Code"

---

**Chapter 12 - Complete**
