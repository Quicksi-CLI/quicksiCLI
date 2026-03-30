<!-- omit from toc -->
# 🤝 Contributing to Quicksi CLI

First off, thank you for taking the time to contribute ❤️  
Quicksi is an open project, and **all contributions are welcome**.

We call our contributors **Superheroes 🦸‍♂️** — and you are one.

---

## 📚 Table of Contents

- [Before Contributing](#before-contributing)
- [What This Repo Is For](#what-this-repo-is-for)
- [Templates vs CLI Contributions](#templates-vs-cli-contributions)
- [What Can I Contribute (CLI)?](#what-can-i-contribute-cli)
- [Getting Started](#getting-started)
- [Testing Your Changes](#testing-your-changes)
- [Submitting Your Contribution](#submitting-your-contribution)
- [Guidelines](#guidelines)

---

## 🧠 Before Contributing

Before you start:

1. Check existing issues or discussions  
2. Open an issue for major changes (recommended)  
3. Avoid purely stylistic changes  
4. Keep changes focused and meaningful  

---

## 📦 What This Repo Is For

This repository contains the **Quicksi CLI**.

👉 Responsibilities of this repo:
- CLI commands (`quicksi`)
- Template resolution logic
- Version handling
- Download + caching system
- Project scaffolding
- Analytics (non-critical)
- CLI UX (prompts, output, flags)

---

## 🔀 Templates vs CLI Contributions

Quicksi is split into two main parts:

### 1️⃣ CLI (this repo)
👉 Handles how templates are fetched, resolved, and generated

### 2️⃣ Templates (separate repo)
👉 Contains all reusable starters

📍 Template contributions go here:
👉 https://github.com/Quicksi-CLI/quicksi-templates

---

### 🚨 Important

- ❌ Do NOT add templates in this repo  
- ✅ All templates must go into the templates repository  

For full template contribution guidelines, see:
👉 https://github.com/Quicksi-CLI/quicksi-templates

---

## 🚀 What Can I Contribute (CLI)?

You can contribute improvements to the CLI itself:

---

### ⚙️ Core CLI Features

- Improve template fetching logic  
- Improve caching system  
- Improve version handling  
- Add new CLI flags/options  
- Improve error handling  

---

### 🧠 CLI UX Improvements

- Better prompts (inquirer flow)  
- Cleaner output messages  
- Better developer experience  

---

### ⚡ Performance Improvements

- Faster downloads  
- Smarter caching  
- Reduced unnecessary operations  

---

### 🧪 Testing

- Add unit tests  
- Improve test coverage  
- Add integration tests  

---

### 🐛 Bug Fixes

- Fix CLI crashes  
- Fix incorrect template resolution  
- Fix edge cases  

---

### 📖 Documentation

- Improve README clarity  
- Add examples  
- Fix unclear instructions  

---

## ⚡ Getting Started

```bash
# Fork the repo
# Clone your fork
git clone https://github.com/Quicksi-CLI/quicksiCLI.git

cd quicksiCLI

# Install dependencies
npm install

# Build
npm run build

# Test CLI on Linux/macOS

# Make executable
chmod +x quicksi

# Run
./quicksi

# (Optional) Move to global path
mv quicksi /usr/local/bin/quicksi

# Then run globally
quicksi <template-name> <app-name>


# Test CLI on Windows
# Run directly
.\quicksi.exe

# (Optional) Move to a folder in PATH
# Example:
move quicksi.exe C:\Windows\System32\

# Then run globally
quicksi <template-name> <app-name>
