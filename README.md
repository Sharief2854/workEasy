# 🚀 WorkEasy Pro - 1-Click Developer Workspace Launcher

> **Developed by Sharief**  
> High-performance Windows desktop application designed to eliminate daily startup friction by launching your entire development environment (VS Code, MongoDB Compass, Web Portals, Project Folders, and Scripts) with a single click.

---

## 📋 Table of Contents
1. [Prerequisites](#-prerequisites)
2. [Step-by-Step Installation Guide](#-step-by-step-installation-guide)
3. [How to Run WorkEasy](#-how-to-run-workeasy)
4. [Desktop Shortcut Setup](#-desktop-shortcut-setup)
5. [Building Standalone .exe Installer](#-building-standalone-exe-installer)
6. [Key Features](#-key-features)
7. [ThunderBoard v3 Integration](#-thunderboard-v3-integration)
8. [Google Meet & Multi-Account Selection](#-google-meet--multi-account-selection)
9. [How to Configure Workspaces](#-how-to-configure-workspaces)
10. [Project Structure](#-project-structure)
11. [Backup & Export](#-backup--export)

---

## 💻 Prerequisites

Ensure you have the following installed before proceeding:
1. **Windows 10 / Windows 11** (64-bit)
2. **Node.js** (v18 or higher, recommended v20 LTS / v24):
   - Download: [https://nodejs.org](https://nodejs.org)
   - Verify installation in terminal:
     ```powershell
     node -v
     npm -v
     ```

---

## 📦 Step-by-Step Installation Guide

### Step 1: Open Terminal & Navigate to Project
Open **PowerShell** or **Command Prompt**:
```powershell
cd d:\sharief\workEasy
```

### Step 2: Install All Dependencies
Download and install all necessary packages:
```bash
npm install
```

### Step 3: Build & Compile Assets
Compile the React frontend bundle:
```bash
npm run build:renderer
```

### Step 4: Add WorkEasy Icon to Desktop
Create the double-clickable shortcut on your Windows Desktop:
```powershell
powershell -ExecutionPolicy Bypass -File create-desktop-shortcut.ps1
```

---

## 🚀 How to Run WorkEasy

| Method | Command | Description |
|---|---|---|
| **Desktop Shortcut** | *(Double-click Desktop Icon)* | Instant startup directly from your desktop. |
| **Terminal Direct** | `npm start` | Launches the compiled app immediately. |
| **Development Mode** | `npm run dev` | Runs with live hot-reload for code changes. |

---

## 🖥️ Desktop Shortcut Setup

To place or refresh the **WorkEasy** shortcut icon on your Windows Desktop:
```powershell
powershell -ExecutionPolicy Bypass -File create-desktop-shortcut.ps1
```
A custom orange **WorkEasy** icon will appear on your desktop at:
`C:\Users\<YourUser>\Desktop\WorkEasy.lnk`

---

## 🔨 Building Standalone .exe Installer

To package WorkEasy into a standalone Windows `.exe` installer or portable executable:
```bash
npm run build
```
The output executables will be generated in `dist-electron/`:
- `dist-electron/WorkEasy Setup 1.0.0.exe` (Windows Installer)
- `dist-electron/WorkEasy 1.0.0.exe` (Portable Executable)

---

## ✨ Key Features

- ⚡ **1-Click Multi-Tool Orchestration**: Launch IDEs, databases, web tools, and folders with a single click.
- 🎨 **ThunderBoard v3 Integration**: Native integration with Sharief's ThunderBoard v3. Select any classroom batch (`JFS-56`, `JFS-57`, etc.) and launch directly into that class's canvas notes.
- 🌐 **Browser Multi-Profile Switcher**: Auto-detects Chrome, Brave, and Edge profiles (e.g. `sharief@codegnan.com`, personal accounts) so links and portals open in the exact designated account.
- 📹 **Google Meet Automation Suite**: 1-click Auto-Join for calls with pre-meeting mic/camera muting.
- 🚪 **Automatic Exit On Launch**: Once tools are dispatched, WorkEasy automatically closes itself so your desktop remains clutter-free.
- 🔍 **Auto App Detector**: Scans your PC for installed software (VS Code, MongoDB Compass, Postman, Chrome, Brave, Git Bash, DBeaver, ThunderBoard, etc.).
- 📁 **VS Code Folder Launching**: Directly opens project directories in VS Code (`code <path>`).
- ⏱️ **Stagger Delay**: Sequential execution (e.g. 500ms delay) prevents system lag and CPU spikes.
- 🌙 **Permanent Dark Theme**: Crisp dark design with solid orange accents (`#ea580c`).
- 🔄 **GitHub Releases Auto-Updater**: Built-in `electron-updater` integration connected to `Sharief2854/workEasy` for 1-click updates.
- 💾 **JSON Backup & Restore**: Export and import your workspace templates anytime.

---

## 🎨 ThunderBoard v3 Integration

WorkEasy Pro includes deep integration with **ThunderBoard v3** (Sharief's Intelligent Teaching Whiteboard):
1. **Auto-Discovery**: WorkEasy automatically detects your local ThunderBoard executable and existing classroom batches from storage (`%APPDATA%\ThunderBoard v3\boards\workspace_data.json`).
2. **Batch Selector Modal**: When adding ThunderBoard to any template, choose from all your active batches (`JFS-56`, `JFS-57`, `test`, or Last Active).
3. **Instant Pre-Activation**: On launch, WorkEasy safely updates the active batch and passes `--batch-id` and `--batch` parameters, booting ThunderBoard straight into the selected class!

---

## 🌐 Google Meet & Multi-Account Selection

Never join a student lecture or work meeting from the wrong Google account again:
- **Profile Selection**: Associate any URL or browser app with a specific Chrome profile (e.g., `sharief@codegnan.com`).
- **Auto-Join**: Optional helper extension handles muting mic, disabling camera, and clicking **"Join now"** seamlessly.

---

## 📖 How to Configure Workspaces

1. **Create a Workspace**: Click **"+ New Workspace"** in the top bar.
2. **Add Applications**: Click **"+ App"** to choose auto-detected tools (like ThunderBoard with a selected batch) or browse any `.exe` / `.bat` / `.lnk`.
3. **Add Project Directory**: Click **"+ Folder"** ➜ Select your folder ➜ Choose **"Open in VS Code"**.
4. **Add Web Tabs**: Click **"+ Web URL"** and paste links (choose an optional Chrome profile for Google Meet / portals).
5. **Add Startup Scripts**: Click **"+ Script"** to add background/terminal commands (e.g. `npm run dev`).
6. **Launch**: Click **"Launch All"** on the workspace card to open everything with 1 click!

---

## 📂 Project Structure

```
workEasy/
├── electron/
│   ├── main.cjs            # Electron main process & lifecycle management
│   ├── preload.cjs         # Secure IPC bridge
│   ├── launcher.cjs        # Application, folder, URL, and script execution engine
│   ├── appDetector.cjs     # Windows software scanner
│   ├── browserProfiles.cjs # Chrome, Edge & Brave multi-profile detector
│   ├── thunderboard.cjs    # ThunderBoard v3 batch detection & switcher
│   ├── updater.cjs         # GitHub Releases auto-updater engine (electron-updater)
│   └── store.cjs           # JSON local database persistence
├── extensions/
│   └── workeasy-meet-helper/ # Optional companion extension for Google Meet Auto-Join
├── src/
│   ├── components/
│   │   ├── Header.jsx           # App navigation bar & search
│   │   ├── TemplateCard.jsx     # Workspace cards with 1-click launch
│   │   ├── TemplateModal.jsx    # Workspace creator & editor modal
│   │   ├── AppPickerModal.jsx   # Installed Windows software & batch browser
│   │   ├── SettingsModal.jsx    # Preferences, backup & restore
│   │   └── LaunchToast.jsx      # Real-time execution toast feedback
│   ├── utils/
│   │   └── icons.jsx            # Dynamic Lucide icon mapper
│   ├── App.jsx                  # Main React dashboard & state
│   ├── main.jsx                 # React root mounting
│   └── index.css                # Solid dark theme styling
├── public/
│   ├── workeasy.ico             # Windows app icon
│   └── workeasy.png             # App logo image
├── create-desktop-shortcut.ps1  # Automated desktop shortcut script
├── WorkEasy.bat                 # Batch launcher
├── WorkEasy.vbs                 # Silent VBScript launcher
├── package.json
├── vite.config.mjs
├── INSTALLATION.md              # Dedicated installation guide
└── README.md                    # Main project documentation
```

---

## 💾 Backup & Data Persistence

All workspaces are stored in:
`%APPDATA%\workeasy\workeasy-store.json`

To export or backup:
1. Open WorkEasy ➜ Click **Settings** (gear icon).
2. Click **"Export to JSON"** to save your templates to a `.json` file.
3. Click **"Import from JSON"** to restore templates on any machine.

---

## 👤 Author

- **Developed by**: **Sharief**
- **Edition**: WorkEasy Pro (v1.1.0)
- **License**: MIT
