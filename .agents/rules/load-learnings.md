---
trigger: always_on
description: Tự động load learnings từ .agents/learnings/ ở đầu mỗi session
globs: "**/*.{kt,java,xml,gradle,kts}"
---

---
description: Automatically loads project learnings from .agents/learnings/ at the start of every session.
globs: "**/*.{kt,java,xml,gradle,kts,ts,tsx,js,jsx,py,html,css,json,md}"
trigger: always_on
---

# Automated Project Learnings Loader

This rule enforces the automatic discovery and selective loading of project-specific learnings and historical bug preventions stored within `.agents/learnings/`.

---

## 1. Trigger Conditions

This rule triggers automatically at the **start of every new session**, conversation initialization, or major task context shift within this codebase.

---

## 2. Mandatory Execution Protocol

Upon session initialization, the AI agent **MUST** perform the following steps sequentially:

### Step 1: Scan Learning Directory Index
Scan the `.agents/learnings/` directory to retrieve the list of available file names.
> **Constraint:** Read **ONLY file names and metadata** during this step. Do **NOT** read full file contents yet to optimize context window efficiency.

### Step 2: Contextual Relevance Matching
Analyze the current user task, prompt, or modified files, and correlate them against the retrieved file names:
* *Example 1:* If the task involves user authentication or JWT tokens → select `auth.md` or `jwt-handling.md`.
* *Example 2:* If the task touches database migrations → select `database-migrations.md`.
* *Example 3:* If no file names match the domain of the current task → skip content reading entirely.

### Step 3: Selective Content Reading
Execute file reads **ONLY** for the specific `.md` files identified as relevant in Step 2.
> **Constraint:** Do **NOT** perform a bulk read of all files in `.agents/learnings/`. Context budget must be preserved.

### Step 4: Transparent User Notification
Output a brief, non-intrusive confirmation message to the user listing the loaded learnings:
> *"Loaded project learnings: `auth.md`, `session-management.md`"*
>
> *If no learnings match:*
> *"No relevant learnings found in `.agents/learnings/` for this task."*

### Step 5: Implicit Knowledge Integration
Silently apply all extracted constraints, rules, and historical bug fixes to subsequent code generation, refactoring, and execution steps without prompting the user to re-confirm previously recorded knowledge.

---

## 3. Operational Rules & Edge Cases

* **Missing Directory / Empty State:** If `.agents/learnings/` does not exist or contains no files, fail silently and proceed with standard execution without raising errors.
* **Session Deduplication:** Do not re-scan or re-read learnings files if they have already been loaded within the current active session, unless explicitly requested by the user.
* **Multi-Domain Tasks:** If a task spans multiple features (e.g., UI redesign + notification system), load all corresponding learnings files.