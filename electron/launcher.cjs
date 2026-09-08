const { spawn, exec } = require('child_process');
const { shell } = require('electron');
const fs = require('fs');
const path = require('path');
const { resolveEnvVars } = require('./appDetector.cjs');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
        const formattedUrl = urlStr.startsWith('http://') || urlStr.startsWith('https://') 
          ? urlStr 
          : `https://${urlStr}`;
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
        if (!appPath) throw new Error('Executable path is empty');
        
        // If file exists at direct path
        if (fs.existsSync(appPath)) {
          const args = item.args ? item.args.split(' ').filter(Boolean) : [];
          const proc = spawn(appPath, args, {
            detached: true,
            stdio: 'ignore',
            cwd: path.dirname(appPath),
          });
          proc.unref();
          return { success: true, name, type, message: `Started ${name}` };
        }

        // Fallback: Try launching via shell start (e.g. system commands like code, wt, notepad)
        const cmdStr = item.args ? `start "" "${appPath}" ${item.args}` : `start "" "${appPath}"`;
        exec(cmdStr, { shell: 'cmd.exe' });
        return { success: true, name, type, message: `Dispatched ${name}` };
      }

      case 'command': {
        const command = item.path?.trim();
        if (!command) throw new Error('Command is empty');
        const workDir = item.workingDir ? resolveEnvVars(item.workingDir.trim()) : undefined;

        // Open in a new Windows PowerShell or CMD terminal window so the user can see output (e.g. npm run dev)
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
  const delay = options.staggerDelayMs || template.staggerDelayMs || 500;

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

    // Delay between launches unless it's the last item
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
