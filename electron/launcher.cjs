const { spawn, exec } = require('child_process');
const { shell } = require('electron');
const fs = require('fs');
const path = require('path');
const { resolveEnvVars } = require('./appDetector.cjs');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function parseArgs(argStr) {
  if (!argStr || typeof argStr !== 'string') return [];
  const regex = /[^\s"]+|"([^"]*)"/gi;
  const args = [];
  let match;
  while ((match = regex.exec(argStr)) !== null) {
    args.push(match[1] !== undefined ? match[1] : match[0]);
  }
  return args;
}

async function launchItem(item) {
  if (!item || !item.enabled) {
    return { success: false, skipped: true, name: item?.name || 'Unknown' };
  }

  const name = item.name || 'Unnamed Item';
  const type = item.type;

  try {
    switch (type) {
      case 'url': {
        const urlStr = item.path?.trim();
        if (!urlStr) throw new Error('URL path is empty');
        let formattedUrl = urlStr.startsWith('http://') || urlStr.startsWith('https://') 
          ? urlStr 
          : `https://${urlStr}`;

        // Handle Google Meet Automation Triggers
        if (formattedUrl.includes('meet.google.com')) {
          const hashParts = ['workeasy=1'];
          if (item.meetAutoJoin !== false) hashParts.push('join=1');
          if (item.meetMuteMic) hashParts.push('mic=1');
          if (item.meetMuteCam) hashParts.push('cam=1');
          
          if (formattedUrl.includes('#')) {
            formattedUrl += `&${hashParts.join('&')}`;
          } else {
            formattedUrl += `#${hashParts.join('&')}`;
          }
        }

        // If a specific browser profile or Chrome account is selected
        if (item.profileDirectory && item.browserExe) {
          spawn(item.browserExe, [`--profile-directory=${item.profileDirectory}`, formattedUrl], {
            detached: true,
            stdio: 'ignore',
          }).unref();
          return { success: true, name, type, message: `Opened in ${item.profileName || item.profileDirectory}: ${formattedUrl}` };
        } else if (item.profileDirectory) {
          // Fallback: search for Chrome exe
          const { getBrowserExe } = require('./browserProfiles.cjs');
          const chromeExe = getBrowserExe(item.browser || 'chrome');
          if (chromeExe) {
            spawn(chromeExe, [`--profile-directory=${item.profileDirectory}`, formattedUrl], {
              detached: true,
              stdio: 'ignore',
            }).unref();
            return { success: true, name, type, message: `Opened with profile ${item.profileDirectory}: ${formattedUrl}` };
          }
        }

        await shell.openExternal(formattedUrl);
        return { success: true, name, type, message: `Opened ${formattedUrl}` };
      }

      case 'folder': {
        const folderPath = resolveEnvVars(item.path?.trim());
        if (!folderPath || !fs.existsSync(folderPath)) {
          throw new Error(`Folder path does not exist: "${folderPath}"`);
        }

        if (item.openWith === 'vscode') {
          // Open VS Code in this directory
          spawn('cmd.exe', ['/c', 'code', `"${folderPath}"`], {
            windowsVerbatimArguments: true,
            detached: true,
            stdio: 'ignore',
            shell: true,
          }).unref();
          return { success: true, name, type, message: `Opened in VS Code: ${folderPath}` };
        } else {
          // Open in Explorer
          await shell.openPath(folderPath);
          return { success: true, name, type, message: `Opened in Explorer: ${folderPath}` };
        }
      }

      case 'app': {
        const appPath = resolveEnvVars(item.path?.trim());
        if (!appPath && !item.browserExe) throw new Error('Executable / App path is empty');

        // Handle ThunderBoard Automation & Batch Switching
        const isThunderboard = item.isThunderboard ||
          item.name?.toLowerCase().includes('thunderboard') ||
          (appPath && appPath.toLowerCase().includes('thunderboard'));

        if (isThunderboard) {
          try {
            const { setActiveThunderboardBatch, getThunderboardExe } = require('./thunderboard.cjs');
            if (item.thunderboardBatchId || item.thunderboardBatchName) {
              const switchRes = setActiveThunderboardBatch(item.thunderboardBatchId || item.thunderboardBatchName);
              if (switchRes.success) {
                console.log(`[WorkEasy] Pre-activated ThunderBoard batch: ${switchRes.batchName} (${switchRes.batchId})`);
              }
            }
          } catch (tbErr) {
            console.error('[WorkEasy] Failed to pre-set ThunderBoard batch:', tbErr);
          }
        }

        let targetExe = (item.browserExe && fs.existsSync(item.browserExe)) ? item.browserExe : appPath;
        if (isThunderboard && (!targetExe || !fs.existsSync(targetExe))) {
          const { getThunderboardExe } = require('./thunderboard.cjs');
          const fallbackTb = getThunderboardExe();
          if (fallbackTb) targetExe = fallbackTb;
        }

        // If specific browser profile is specified
        if (item.profileDirectory && targetExe && fs.existsSync(targetExe)) {
          let args = parseArgs(item.args);
          if (!args.some(a => a.startsWith('--profile-directory='))) {
            args.unshift(`--profile-directory=${item.profileDirectory}`);
          }
          const proc = spawn(targetExe, args, {
            detached: true,
            stdio: 'ignore',
            cwd: (item.cwd && fs.existsSync(item.cwd)) ? item.cwd : path.dirname(targetExe),
          });
          proc.unref();
          return { success: true, name, type, message: `Started ${name} (${item.profileEmail || item.profileName || item.profileDirectory})` };
        }

        // Check for Windows Modern / UWP / Start Menu AppID (e.g. Microsoft Whiteboard, Teams, etc.)
        if (appPath && (appPath.startsWith('shell:AppsFolder\\') || item.isUwp)) {
          const appsFolderTarget = appPath.startsWith('shell:AppsFolder\\') ? appPath : `shell:AppsFolder\\${appPath}`;
          spawn('explorer.exe', [appsFolderTarget], {
            detached: true,
            stdio: 'ignore',
          }).unref();
          return { success: true, name, type, message: `Launched Windows App: ${name}` };
        }

        // Protocol handlers (e.g. ms-whiteboard-cmd:)
        if (appPath && appPath.includes(':') && !appPath.includes('\\') && !appPath.includes('/')) {
          await shell.openExternal(appPath);
          return { success: true, name, type, message: `Launched protocol ${name}` };
        }
        
        // If file exists at direct path
        if (targetExe && fs.existsSync(targetExe)) {
          const ext = path.extname(targetExe).toLowerCase();

          // Native shortcuts (.lnk, .url) or batch scripts without extra CLI flags
          if (ext === '.lnk' || ext === '.url') {
            await shell.openPath(targetExe);
            return { success: true, name, type, message: `Launched shortcut ${name}` };
          }

          let args = parseArgs(item.args);
          if (item.profileDirectory && !args.some(a => a.startsWith('--profile-directory='))) {
            args.unshift(`--profile-directory=${item.profileDirectory}`);
          }
          if (isThunderboard && item.thunderboardBatchId) {
            args.push(`--batch-id=${item.thunderboardBatchId}`);
            if (item.thunderboardBatchName) {
              args.push(`--batch=${item.thunderboardBatchName}`);
            }
          }

          const workDir = (item.cwd && fs.existsSync(item.cwd)) ? item.cwd : path.dirname(targetExe);

          if (ext === '.bat' || ext === '.cmd') {
            const proc = spawn(`"${targetExe}"`, args, {
              detached: true,
              stdio: 'ignore',
              cwd: workDir,
              shell: true,
            });
            proc.unref();
            return { success: true, name, type, message: `Started script ${name}` };
          }

          const proc = spawn(targetExe, args, {
            detached: true,
            stdio: 'ignore',
            cwd: workDir,
          });
          proc.unref();
          const batchInfo = item.thunderboardBatchName ? ` (Batch: ${item.thunderboardBatchName})` : '';
          return { success: true, name, type, message: `Started ${name}${batchInfo}` };
        }

        // Fallback: if shortcutPath exists, open it directly
        if (item.shortcutPath && fs.existsSync(item.shortcutPath)) {
          await shell.openPath(item.shortcutPath);
          return { success: true, name, type, message: `Launched ${name}` };
        }

        // Fallback: Launch via Windows Shell (cmd start)
        const cmdStr = item.args ? `start "" "${targetExe || appPath}" ${item.args}` : `start "" "${targetExe || appPath}"`;
        exec(cmdStr, { shell: 'cmd.exe' });
        return { success: true, name, type, message: `Dispatched ${name}` };
      }

      case 'command': {
        const command = item.path?.trim();
        if (!command) throw new Error('Command is empty');
        const workDir = item.workingDir ? resolveEnvVars(item.workingDir.trim()) : undefined;

        // Open in a new Windows PowerShell terminal window
        const terminalCmd = `start powershell.exe -NoExit -Command "Write-Host '==> Running: ${command.replace(/"/g, '`"')}'; ${command}"`;
        exec(terminalCmd, {
          cwd: workDir && fs.existsSync(workDir) ? workDir : undefined,
          shell: 'cmd.exe',
        });
        return { success: true, name, type, message: `Executed command: ${command}` };
      }

      default:
        throw new Error(`Unsupported item type: ${type}`);
    }
  } catch (err) {
    console.error(`Error launching item "${name}":`, err);
    return {
      success: false,
      name,
      type,
      error: err.message || 'Unknown execution error',
    };
  }
}

async function launchTemplate(template, options = {}, progressCallback = null) {
  const items = (template.items || []).filter((i) => i.enabled !== false);
  const results = [];
  const delay = options.staggerDelayMs || template.staggerDelayMs || 400;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    if (progressCallback) {
      progressCallback({
        currentIndex: i,
        total: items.length,
        item,
        status: 'launching',
      });
    }

    const result = await launchItem(item);
    results.push(result);

    if (progressCallback) {
      progressCallback({
        currentIndex: i,
        total: items.length,
        item,
        result,
        status: result.success ? 'done' : 'error',
      });
    }

    // Stagger delay between launches
    if (i < items.length - 1 && delay > 0) {
      await sleep(delay);
    }
  }

  return {
    templateId: template.id,
    templateName: template.name,
    total: items.length,
    results,
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  launchItem,
  launchTemplate,
};
