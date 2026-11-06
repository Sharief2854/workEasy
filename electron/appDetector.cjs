const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

function resolveEnvVars(str) {
  if (!str) return str;
  return str.replace(/%([^%]+)%/g, (_, n) => process.env[n] || '');
}

function categorizeApp(name, appId) {
  const n = (name + ' ' + (appId || '')).toLowerCase();

  if (n.includes('whiteboard') || n.includes('figma') || n.includes('canva') || n.includes('paint') || n.includes('draw') || n.includes('photoshop')) {
    return 'Design & Whiteboard';
  }
  if (n.includes('code') || n.includes('studio') || n.includes('pycharm') || n.includes('intellij') || n.includes('sublime') || n.includes('vim') || n.includes('notepad++') || n.includes('webstorm') || n.includes('atom') || n.includes('cursor')) {
    return 'IDE & Code Editors';
  }
  if (n.includes('mongo') || n.includes('dbeaver') || n.includes('mysql') || n.includes('sql') || n.includes('postgres') || n.includes('redis') || n.includes('database') || n.includes('datagrip')) {
    return 'Databases & Tools';
  }
  if (n.includes('postman') || n.includes('insomnia') || n.includes('terminal') || n.includes('powershell') || n.includes('bash') || n.includes('cmd') || n.includes('docker') || n.includes('git')) {
    return 'Developer & Terminal';
  }
  if (n.includes('teams') || n.includes('discord') || n.includes('slack') || n.includes('skype') || n.includes('telegram') || n.includes('whatsapp') || n.includes('zoom')) {
    return 'Communication';
  }
  if (n.includes('word') || n.includes('excel') || n.includes('powerpoint') || n.includes('onenote') || n.includes('to do') || n.includes('notion') || n.includes('obsidian') || n.includes('copilot') || n.includes('notes')) {
    return 'Productivity & Office';
  }
  if (n.includes('chrome') || n.includes('brave') || n.includes('edge') || n.includes('firefox') || n.includes('opera') || n.includes('browser') || n.includes('safari')) {
    return 'Web Browsers';
  }
  if (n.includes('spotify') || n.includes('vlc') || n.includes('media') || n.includes('music') || n.includes('video') || n.includes('sound')) {
    return 'Media & Entertainment';
  }
  return 'Utilities & System';
}

function getAppIconName(category, name) {
  const n = name.toLowerCase();
  if (n.includes('whiteboard')) return 'Layout';
  if (n.includes('mongo') || n.includes('sql') || n.includes('database') || n.includes('dbeaver')) return 'Database';
  if (n.includes('code') || n.includes('pycharm') || n.includes('sublime')) return 'Code2';
  if (n.includes('terminal') || n.includes('powershell') || n.includes('bash')) return 'Terminal';
  if (n.includes('chrome') || n.includes('edge') || n.includes('brave') || n.includes('firefox')) return 'Globe';
  if (n.includes('teams') || n.includes('slack') || n.includes('discord') || n.includes('zoom') || n.includes('telegram')) return 'MessageSquare';
  if (n.includes('spotify') || n.includes('music') || n.includes('vlc')) return 'Music';
  if (n.includes('word') || n.includes('onenote') || n.includes('notes') || n.includes('to do')) return 'BookOpen';
  return 'Laptop';
}

function detectInstalledApps() {
  return new Promise((resolve) => {
    // Query Windows Get-StartApps
    const psCmd = `powershell.exe -NoProfile -Command "Get-StartApps | Select-Object Name, AppID | ConvertTo-Json -Compress"`;

    exec(psCmd, { maxBuffer: 1024 * 1024 * 10, windowsHide: true }, (err, stdout) => {
      let rawApps = [];
      if (!err && stdout) {
        try {
          const parsed = JSON.parse(stdout.trim());
          rawApps = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          console.error('Failed to parse Get-StartApps JSON:', e);
        }
      }

      // Filter out unwanted uninstallers / documentation shortcuts
      const filtered = rawApps.filter((app) => {
        if (!app || !app.Name) return false;
        const name = app.Name.toLowerCase();
        if (name.startsWith('uninstall ') || name.includes(' manual') || name.includes('concepts guide') || name.includes('reset preferences') || name.endsWith('.url')) {
          return false;
        }
        return true;
      });

      // Deduplicate and format
      const seen = new Set();
      const result = [];

      // Check if ThunderBoard v3 is available
      try {
        const { getThunderboardExe } = require('./thunderboard.cjs');
        const tbExe = getThunderboardExe();
        if (tbExe) {
          seen.add('thunderboard v3');
          seen.add('thunderboard');
          result.push({
            id: 'app-thunderboard-v3',
            name: 'ThunderBoard v3',
            appId: tbExe,
            path: tbExe,
            isUwp: false,
            isThunderboard: true,
            category: 'Design & Whiteboard',
            icon: 'Layout',
            installed: true,
          });
        }
      } catch (tbErr) {
        console.error('Failed to detect ThunderBoard:', tbErr);
      }

      for (const app of filtered) {
        const key = app.Name.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        const isTb = key.includes('thunderboard');
        const category = isTb ? 'Design & Whiteboard' : categorizeApp(app.Name, app.AppID);
        const icon = isTb ? 'Layout' : getAppIconName(category, app.Name);

        result.push({
          id: `app-${Buffer.from(app.Name).toString('hex').substr(0, 10)}`,
          name: app.Name,
          appId: app.AppID,
          path: app.AppID.includes('\\') || app.AppID.endsWith('.exe') ? app.AppID : `shell:AppsFolder\\${app.AppID}`,
          isUwp: !app.AppID.endsWith('.exe') && !app.AppID.includes('\\'),
          isThunderboard: isTb,
          category,
          icon,
          installed: true,
        });
      }

      // Sort alphabetically with popular categories at top
      result.sort((a, b) => a.name.localeCompare(b.name));

      resolve(result);
    });
  });
}

module.exports = {
  detectInstalledApps,
  resolveEnvVars,
};
