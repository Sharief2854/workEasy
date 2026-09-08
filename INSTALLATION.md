# 🚀 WorkEasy Pro - Installation & Setup Guide

> **Developed by Sharief**  
> Complete, beginner-friendly guide to set up, install, and run **WorkEasy Pro** on any Windows machine from scratch.

---

## 📋 System Requirements & Prerequisites

Before starting, ensure you have the following installed on your Windows PC:

1. **Operating System**: Windows 10 or Windows 11 (64-bit)
2. **Node.js**: Version 18.0 or higher (Recommended: Node.js 20 LTS or Node.js 24)
   - Download link: [https://nodejs.org/en/download](https://nodejs.org/en/download)
   - Check if installed: Open PowerShell and run `node -v` and `npm -v`
3. **Git** *(Optional)*: If cloning from a repository
   - Download link: [https://git-scm.com/download/win](https://git-scm.com/download/win)

---

## 🛠️ Step-by-Step Installation Instructions

### Step 1: Open PowerShell / Terminal
Open **Windows PowerShell** or **Command Prompt** (Terminal).

Navigate to the directory where you want the project or where it is located:
```powershell
cd d:\sharief\workEasy
```

---

### Step 2: Install Project Dependencies
Run `npm install` to automatically download and install all necessary packages (Electron, React, Tailwind CSS, Vite, and Lucide icons):

```bash
npm install
```
*(This process takes around 30–60 seconds depending on your internet connection).*

---

### Step 3: Compile & Build Frontend Assets
Build the production React UI bundle by running:

```bash
npm run build:renderer
```
*(You will see a success message: `✓ built in ~4s`)*.

---

### Step 4: Create Desktop Shortcut Icon (Recommended)
To add a direct double-clickable **WorkEasy** icon to your **Windows Desktop**:

```powershell
powershell -ExecutionPolicy Bypass -File create-desktop-shortcut.ps1
```
✅ You will now see the **WorkEasy** icon on your Desktop!

---

## 🚀 How to Launch the Application

You have 3 easy ways to launch WorkEasy:

### Method 1: Double-Click from Desktop (Easiest)
- Simply go to your **Windows Desktop**.
- **Double-click** the **WorkEasy** icon to open the app instantly.

---

### Method 2: Launch via Terminal
In `d:\sharief\workEasy`, run:

```bash
npm start
```

---

### Method 3: Development Mode (Live Hot-Reload)
If you want to modify code and see changes in real-time:

```bash
npm run dev
```

---

## 📦 How to Build a Standalone Windows Installer (.exe)

If you want to build an `.exe` file that can be installed or shared on any PC:

```bash
npm run build
```
The output installation package and portable `.exe` will be generated inside the `dist-electron/` directory:
- `dist-electron/WorkEasy Setup 1.0.0.exe` (Full Installer)
- `dist-electron/WorkEasy 1.0.0.exe` (Portable Executable)

---

## ❓ Troubleshooting & FAQs

### Q1: `node` or `npm` is not recognized
- **Solution**: Install Node.js from [nodejs.org](https://nodejs.org) and restart your PowerShell terminal.

### Q2: How do I change where my project opens in VS Code?
- **Solution**: Open WorkEasy ➜ Click the **Edit** pencil icon on any workspace card ➜ Click **+ Folder** ➜ Choose your project folder and select **"Open in VS Code"**.

### Q3: Why does the app close after launching?
- **Solution**: Auto-Close is enabled by default to keep your screen clean after launching all tools. If you want to keep WorkEasy open, click **Settings** (gear icon) and uncheck **"Close WorkEasy After Launch"**.

### Q4: How do I backup my workspace templates?
- **Solution**: Click **Settings** (gear icon) ➜ Click **"Export to JSON"** to save your templates to a backup file.

---

## 👤 Author
- **Developer**: **Sharief**
- **Project**: WorkEasy Pro
- **License**: MIT
