const fs = require('fs');
const path = require('path');

function resolveEnvVars(str) {
  if (!str) return str;
  return str.replace(/%([^%]+)%/g, (_, n) => process.env[n] || '');
}

const COMMON_APPS = [
  {
    id: 'vscode',
    name: 'Visual Studio Code',
    category: 'IDE / Editor',
    icon: 'Code2',
    candidates: [
      '%LOCALAPPDATA%\\Programs\\Microsoft VS Code\\Code.exe',
      '%PROGRAMFILES%\\Microsoft VS Code\\Code.exe',
      '%PROGRAMFILES(X86)%\\Microsoft VS Code\\Code.exe',
    ],
  },
  {
    id: 'mongodb-compass',
    name: 'MongoDB Compass',
    category: 'Database',
    icon: 'Database',
    candidates: [
      '%LOCALAPPDATA%\\MongoDBCompass\\MongoDBCompass.exe',
      '%PROGRAMFILES%\\MongoDB Compass\\MongoDBCompass.exe',
      '%LOCALAPPDATA%\\Programs\\MongoDB Compass\\MongoDBCompass.exe',
    ],
  },
  {
    id: 'postman',
    name: 'Postman',
    category: 'API Testing',
    icon: 'Send',
    candidates: [
      '%LOCALAPPDATA%\\Postman\\Postman.exe',
      '%LOCALAPPDATA%\\Programs\\Postman\\Postman.exe',
    ],
  },
  {
    id: 'google-chrome',
    name: 'Google Chrome',
    category: 'Browser',
    icon: 'Globe',
    candidates: [
      '%PROGRAMFILES%\\Google\\Chrome\\Application\\chrome.exe',
      '%PROGRAMFILES(X86)%\\Google\\Chrome\\Application\\chrome.exe',
      '%LOCALAPPDATA%\\Google\\Chrome\\Application\\chrome.exe',
    ],
  },
  {
    id: 'brave-browser',
    name: 'Brave Browser',
    category: 'Browser',
    icon: 'Shield',
    candidates: [
      '%PROGRAMFILES%\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
      '%PROGRAMFILES(X86)%\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
      '%LOCALAPPDATA%\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    ],
  },
  {
    id: 'ms-edge',
    name: 'Microsoft Edge',
    category: 'Browser',
    icon: 'Globe',
    candidates: [
      '%PROGRAMFILES(X86)%\\Microsoft\\Edge\\Application\\msedge.exe',
      '%PROGRAMFILES%\\Microsoft\\Edge\\Application\\msedge.exe',
    ],
  },
  {
    id: 'git-bash',
    name: 'Git Bash',
    category: 'Terminal',
    icon: 'Terminal',
    candidates: [
      '%PROGRAMFILES%\\Git\\git-bash.exe',
      '%PROGRAMFILES(X86)%\\Git\\git-bash.exe',
      '%LOCALAPPDATA%\\Programs\\Git\\git-bash.exe',
    ],
  },
  {
    id: 'dbeaver',
    name: 'DBeaver Community',
    category: 'Database',
    icon: 'Database',
    candidates: [
      '%LOCALAPPDATA%\\Programs\\DBeaver\\dbeaver.exe',
      '%PROGRAMFILES%\\DBeaver\\dbeaver.exe',
    ],
  },
  {
    id: 'docker-desktop',
    name: 'Docker Desktop',
    category: 'Containers',
    icon: 'Boxes',
    candidates: [
      '%PROGRAMFILES%\\Docker\\Docker\\Docker Desktop.exe',
    ],
  },
  {
    id: 'notion',
    name: 'Notion',
    category: 'Notes / Docs',
    icon: 'BookOpen',
    candidates: [
      '%LOCALAPPDATA%\\Programs\\Notion\\Notion.exe',
    ],
  },
  {
    id: 'discord',
    name: 'Discord',
    category: 'Communication',
    icon: 'MessageSquare',
    candidates: [
      '%LOCALAPPDATA%\\Discord\\Update.exe',
    ],
  },
  {
    id: 'spotify',
    name: 'Spotify',
    category: 'Media',
    icon: 'Music',
    candidates: [
      '%APPDATA%\\Spotify\\Spotify.exe',
    ],
  },
  {
    id: 'windows-terminal',
    name: 'Windows Terminal / PowerShell',
    category: 'Terminal',
    icon: 'Terminal',
    candidates: [
      '%LOCALAPPDATA%\\Microsoft\\WindowsApps\\wt.exe',
      '%SYSTEMROOT%\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
    ],
  },
];

function detectInstalledApps() {
  const detected = [];
  for (const app of COMMON_APPS) {
    let foundPath = null;
    for (const cand of app.candidates) {
      const resolved = resolveEnvVars(cand);
      if (fs.existsSync(resolved)) {
        foundPath = resolved;
        break;
      }
    }
    detected.push({
      id: app.id,
      name: app.name,
      category: app.category,
      icon: app.icon,
      installed: !!foundPath,
      path: foundPath || resolveEnvVars(app.candidates[0]),
    });
  }
  return detected;
}

module.exports = {
  detectInstalledApps,
  resolveEnvVars,
};
