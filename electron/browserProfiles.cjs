const fs = require('fs');
const path = require('path');

function getBrowserExe(browserType) {
  const localAppData = process.env.LOCALAPPDATA || '';
  const programFiles = process.env.ProgramFiles || 'C:\\Program Files';
  const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';

  let candidates = [];
  if (browserType === 'chrome') {
    candidates = [
      path.join(programFiles, 'Google\\Chrome\\Application\\chrome.exe'),
      path.join(programFilesX86, 'Google\\Chrome\\Application\\chrome.exe'),
      path.join(localAppData, 'Google\\Chrome\\Application\\chrome.exe'),
    ];
  } else if (browserType === 'edge') {
    candidates = [
      path.join(programFiles, 'Microsoft\\Edge\\Application\\msedge.exe'),
      path.join(programFilesX86, 'Microsoft\\Edge\\Application\\msedge.exe'),
    ];
  } else if (browserType === 'brave') {
    candidates = [
      path.join(programFiles, 'BraveSoftware\\Brave-Browser\\Application\\brave.exe'),
      path.join(programFilesX86, 'BraveSoftware\\Brave-Browser\\Application\\brave.exe'),
      path.join(localAppData, 'BraveSoftware\\Brave-Browser\\Application\\brave.exe'),
    ];
  }

  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function getBrowserProfiles() {
  const localAppData = process.env.LOCALAPPDATA || '';
  const browsers = [
    {
      type: 'chrome',
      name: 'Google Chrome',
      localStatePath: path.join(localAppData, 'Google\\Chrome\\User Data\\Local State'),
      userDataDir: path.join(localAppData, 'Google\\Chrome\\User Data'),
    },
    {
      type: 'edge',
      name: 'Microsoft Edge',
      localStatePath: path.join(localAppData, 'Microsoft\\Edge\\User Data\\Local State'),
      userDataDir: path.join(localAppData, 'Microsoft\\Edge\\User Data'),
    },
    {
      type: 'brave',
      name: 'Brave Browser',
      localStatePath: path.join(localAppData, 'BraveSoftware\\Brave-Browser\\User Data\\Local State'),
      userDataDir: path.join(localAppData, 'BraveSoftware\\Brave-Browser\\User Data'),
    },
  ];

  const results = [];

  for (const b of browsers) {
    const exePath = getBrowserExe(b.type);
    if (!exePath) continue;

    if (fs.existsSync(b.localStatePath)) {
      try {
        const raw = fs.readFileSync(b.localStatePath, 'utf8');
        const json = JSON.parse(raw);
        const infoCache = json.profile?.info_cache || {};

        for (const dirName of Object.keys(infoCache)) {
          const profile = infoCache[dirName];
          const email = profile.user_name || profile.email || '';
          const profileName = profile.name || dirName;

          let displayLabel = `${b.name}: ${profileName}`;
          if (email) {
            displayLabel = `${b.name}: ${email} (${profileName})`;
          }

          results.push({
            id: `${b.type}-${dirName}`,
            browser: b.type,
            browserName: b.name,
            directory: dirName,
            name: profileName,
            email: email,
            label: displayLabel,
            exePath: exePath,
          });
        }
      } catch (err) {
        console.error(`Error parsing ${b.name} profiles:`, err);
      }
    }
  }

  return results;
}

module.exports = {
  getBrowserProfiles,
  getBrowserExe,
};
