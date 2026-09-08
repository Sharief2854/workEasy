const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const defaultTemplates = [
  {
    id: 'tpl-fullstack-dev',
    name: 'Full-Stack App Dev',
    description: 'Launch VS Code, MongoDB Compass, Dev Server, and Web Portals',
    color: '#ea580c',
    icon: 'Code2',
    favorite: true,
    staggerDelayMs: 500,
    items: [
      {
        id: 'item-vscode',
        type: 'app',
        name: 'VS Code',
        path: '%LOCALAPPDATA%\\Programs\\Microsoft VS Code\\Code.exe',
        args: '',
        enabled: true,
      },
      {
        id: 'item-compass',
        type: 'app',
        name: 'MongoDB Compass',
        path: '%LOCALAPPDATA%\\MongoDBCompass\\MongoDBCompass.exe',
        args: '',
        enabled: true,
      },
      {
        id: 'item-folder',
        type: 'folder',
        name: 'WorkEasy Project Workspace',
        path: 'd:\\sharief\\workEasy',
        openWith: 'vscode',
        enabled: true,
      },
      {
        id: 'item-chatgpt',
        type: 'url',
        name: 'ChatGPT',
        path: 'https://chatgpt.com',
        enabled: true,
      },
      {
        id: 'item-claude',
        type: 'url',
        name: 'Claude AI',
        path: 'https://claude.ai',
        enabled: true,
      },
      {
        id: 'item-localhost',
        type: 'url',
        name: 'Local Dev Server',
        path: 'http://localhost:5173',
        enabled: true,
      },
    ],
  },
  {
    id: 'tpl-ai-research',
    name: 'AI Research & Writing',
    description: 'Instant access to AI assistants, Notebooks, and docs',
    color: '#ea580c',
    icon: 'Sparkles',
    favorite: false,
    staggerDelayMs: 400,
    items: [
      {
        id: 'ai-1',
        type: 'url',
        name: 'ChatGPT',
        path: 'https://chatgpt.com',
        enabled: true,
      },
      {
        id: 'ai-2',
        type: 'url',
        name: 'Claude AI',
        path: 'https://claude.ai',
        enabled: true,
      },
      {
        id: 'ai-3',
        type: 'url',
        name: 'Google Gemini',
        path: 'https://gemini.google.com',
        enabled: true,
      },
      {
        id: 'ai-4',
        type: 'url',
        name: 'DeepSeek',
        path: 'https://chat.deepseek.com',
        enabled: true,
      },
    ],
  },
  {
    id: 'tpl-daily-startup',
    name: 'Morning Workspace',
    description: 'Productivity dashboard, Mail, GitHub, and Communication',
    color: '#ea580c',
    icon: 'Coffee',
    favorite: false,
    staggerDelayMs: 400,
    items: [
      {
        id: 'daily-1',
        type: 'url',
        name: 'GitHub Notifications',
        path: 'https://github.com/notifications',
        enabled: true,
      },
      {
        id: 'daily-2',
        type: 'url',
        name: 'Gmail / Mail',
        path: 'https://mail.google.com',
        enabled: true,
      },
      {
        id: 'daily-3',
        type: 'url',
        name: 'ChatGPT',
        path: 'https://chatgpt.com',
        enabled: true,
      },
    ],
  },
];

const defaultSettings = {
  theme: 'dark', // 'dark' | 'light'
  closeOnLaunch: true, // Automatically close WorkEasy once all items in a template are opened
  minimizeOnLaunch: false,
  globalStaggerMs: 500,
};

function getDataFilePath() {
  const userDataDir = app.getPath('userData');
  return path.join(userDataDir, 'workeasy-store.json');
}

function loadData() {
  const filePath = getDataFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(raw);
      return {
        templates: Array.isArray(data.templates) ? data.templates : defaultTemplates,
        settings: { ...defaultSettings, ...(data.settings || {}) },
      };
    }
  } catch (err) {
    console.error('Failed to load store data, using defaults:', err);
  }
  return { templates: defaultTemplates, settings: defaultSettings };
}

function saveData(data) {
  const filePath = getDataFilePath();
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true };
  } catch (err) {
    console.error('Failed to save store data:', err);
    return { success: false, error: err.message };
  }
}

module.exports = {
  loadData,
  saveData,
  defaultTemplates,
  defaultSettings,
};
