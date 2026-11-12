const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

let electronShell = null;
let electronApp = null;
try {
  const electron = require('electron');
  electronShell = electron.shell;
  electronApp = electron.app;
} catch (e) {}

function resolveEnvVars(str) {
  if (!str) return str;
  return str.replace(/%([^%]+)%/g, (_, n) => process.env[n] || '');
}

function categorizeApp(name, appId) {
  const n = (name + ' ' + (appId || '')).toLowerCase();

  if (n.includes('thunderboard') || n.includes('whiteboard') || n.includes('figma') || n.includes('canva') || n.includes('paint') || n.includes('draw') || n.includes('photoshop')) {
    return 'Design & Whiteboard';
  }
  if (n.includes('word') || n.includes('excel') || n.includes('powerpoint') || n.includes('onenote') || n.includes('to do') || n.includes('notion') || n.includes('obsidian') || n.includes('copilot') || n.includes('notes')) {
    return 'Productivity & Office';
  }
  if (n.includes('code') || n.includes('studio') || n.includes('pycharm') || n.includes('intellij') || n.includes('eclipse') || n.includes('antigravity') || n.includes('idle') || n.includes('sublime') || n.includes('vim') || n.includes('notepad++') || n.includes('webstorm') || n.includes('atom') || n.includes('cursor')) {
    return 'IDE & Code Editors';
  }
  if (n.includes('mongo') || n.includes('dbeaver') || n.includes('mysql') || n.includes('sql') || n.includes('oracle') || n.includes('postgres') || n.includes('redis') || n.includes('database') || n.includes('datagrip')) {
    return 'Databases & Tools';
  }
  if (n.includes('postman') || n.includes('insomnia') || n.includes('terminal') || n.includes('powershell') || n.includes('bash') || n.includes('cmd') || n.includes('docker') || n.includes('git') || n.includes('spidy')) {
    return 'Developer & Terminal';
  }
  if (n.includes('teams') || n.includes('discord') || n.includes('slack') || n.includes('skype') || n.includes('telegram') || n.includes('whatsapp') || n.includes('zoom')) {
    return 'Communication';
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
  if (n.includes('thunderboard') || n.includes('whiteboard')) return 'Layout';
  if (n.includes('mongo') || n.includes('sql') || n.includes('oracle') || n.includes('database') || n.includes('dbeaver')) return 'Database';
  if (n.includes('code') || n.includes('pycharm') || n.includes('eclipse') || n.includes('antigravity') || n.includes('sublime') || n.includes('notepad++') || n.includes('idle')) return 'Code2';
  if (n.includes('terminal') || n.includes('powershell') || n.includes('bash')) return 'Terminal';
  if (n.includes('chrome') || n.includes('edge') || n.includes('brave') || n.includes('firefox')) return 'Globe';
  if (n.includes('teams') || n.includes('slack') || n.includes('discord') || n.includes('zoom') || n.includes('whatsapp') || n.includes('telegram')) return 'MessageSquare';
  if (n.includes('spotify') || n.includes('music') || n.includes('vlc')) return 'Music';
  if (n.includes('word') || n.includes('excel') || n.includes('onenote') || n.includes('notes') || n.includes('to do')) return 'BookOpen';
  return 'Laptop';
}

function getDesktopDirs() {
  const rawDirs = [];
  try {
    if (electronApp && typeof electronApp.getPath === 'function') {
      rawDirs.push(electronApp.getPath('desktop'));
    }
  } catch (e) {}

  const userProfile = process.env.USERPROFILE || '';
  if (userProfile) {
    rawDirs.push(path.join(userProfile, 'Desktop'));
    rawDirs.push(path.join(userProfile, 'OneDrive', 'Desktop'));
  }
  if (process.env.OneDrive) {
    rawDirs.push(path.join(process.env.OneDrive, 'Desktop'));
  }
  if (process.env.OneDriveCommercial) {
    rawDirs.push(path.join(process.env.OneDriveCommercial, 'Desktop'));
  }
  rawDirs.push(path.join(process.env.PUBLIC || 'C:\\Users\\Public', 'Desktop'));

  const uniqueDirs = [];
  const seenDirs = new Set();
  for (const d of rawDirs) {
    if (!d) continue;
    const resolved = path.resolve(d);
    const norm = resolved.toLowerCase();
    if (!seenDirs.has(norm) && fs.existsSync(resolved)) {
      seenDirs.add(norm);
      uniqueDirs.push(resolved);
    }
  }
  return uniqueDirs;
}

function detectDesktopApps() {
  const desktopDirs = getDesktopDirs();
  const desktopApps = [];
  const allowedExts = new Set(['.lnk', '.exe', '.bat', '.cmd', '.url']);

  for (const dir of desktopDirs) {
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
      continue;
    }

    for (const entry of entries) {
      if (entry.isDirectory()) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (!allowedExts.has(ext)) continue;

      const baseName = path.basename(entry.name, ext).trim();
      if (!baseName) continue;

      const lowerName = baseName.toLowerCase();
      if (lowerName.startsWith('uninstall ') || lowerName.includes('uninstaller')) continue;

      const fullPath = path.join(dir, entry.name);
      let targetPath = fullPath;
      let args = '';
      let cwd = dir;
      let shortcutPath = '';

      if (ext === '.lnk') {
        shortcutPath = fullPath;
        if (electronShell && typeof electronShell.readShortcutLink === 'function') {
          try {
            const sc = electronShell.readShortcutLink(fullPath);
            if (sc && sc.target) {
              // Skip desktop shortcuts pointing purely to a plain folder
              try {
                if (fs.existsSync(sc.target) && fs.statSync(sc.target).isDirectory()) {
                  continue;
                }
              } catch (e) {}
              targetPath = sc.target;
              args = sc.args || '';
              cwd = sc.cwd || path.dirname(sc.target);
            }
          } catch (e) {
            // Advertised or special Windows shortcut: fallback to launching the .lnk file directly
            targetPath = fullPath;
          }
        }
      } else if (ext === '.url') {
        shortcutPath = fullPath;
      }

      const isTb = lowerName.includes('thunderboard') || (targetPath && targetPath.toLowerCase().includes('thunderboard'));
      const category = categorizeApp(baseName, targetPath);
      const icon = getAppIconName(category, baseName);

      desktopApps.push({
        id: `desktop-${Buffer.from(fullPath).toString('hex').substr(0, 12)}`,
        name: baseName,
        appId: targetPath,
        path: targetPath,
        args,
        cwd,
        shortcutPath,
        isUwp: false,
        isDesktopApp: true,
        isThunderboard: isTb,
        category,
        icon,
        installed: true,
      });
    }
  }

  return desktopApps;
}

function detectInstalledApps() {
  return new Promise((resolve) => {
    const desktopApps = detectDesktopApps();

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

      // Deduplicate and format (Desktop shortcuts take priority for exact .exe/args/cwd)
      const seen = new Set();
      const result = [];

      for (const dApp of desktopApps) {
        const key = dApp.name.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        result.push(dApp);
      }

      // Ensure ThunderBoard is included even if not on Desktop
      try {
        const { getThunderboardExe } = require('./thunderboard.cjs');
        const tbExe = getThunderboardExe();
        if (tbExe && !result.some((a) => a.isThunderboard)) {
          const tbName = path.basename(tbExe, '.exe');
          seen.add(tbName.toLowerCase());
          seen.add('thunderboard');
          result.push({
            id: 'app-thunderboard',
            name: tbName,
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

      // Sort alphabetically
      result.sort((a, b) => a.name.localeCompare(b.name));

      resolve(result);
    });
  });
}

module.exports = {
  detectInstalledApps,
  detectDesktopApps,
  resolveEnvVars,
};
