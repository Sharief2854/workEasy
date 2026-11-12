const fs = require('fs');
const path = require('path');

function getThunderboardExe() {
  const candidatePaths = [
    'D:\\sharief\\smart-board\\release-v4\\win-unpacked\\ThunderBoard v4.exe',
    'D:\\sharief\\smart-board\\release-v4\\ThunderBoard v4 4.0.0.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Programs', 'ThunderBoard v4', 'ThunderBoard v4.exe'),
    path.join(process.env.ProgramFiles || '', 'ThunderBoard v4', 'ThunderBoard v4.exe'),
    'D:\\sharief\\smart-board\\release-v3\\win-unpacked\\ThunderBoard v3.exe',
    'D:\\sharief\\smart-board\\release-v3\\ThunderBoard v3 3.0.0.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Programs', 'ThunderBoard v3', 'ThunderBoard v3.exe'),
    path.join(process.env.ProgramFiles || '', 'ThunderBoard v3', 'ThunderBoard v3.exe'),
    path.join(process.env['ProgramFiles(x86)'] || '', 'ThunderBoard v3', 'ThunderBoard v3.exe'),
  ];

  for (const p of candidatePaths) {
    if (p && fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

function getThunderboardWorkspacePaths() {
  const appData = process.env.APPDATA || path.join(process.env.USERPROFILE || '', 'AppData', 'Roaming');
  return [
    path.join(appData, 'ThunderBoard v4', 'boards', 'workspace_data.json'),
    path.join(appData, 'ThunderBoard v3', 'boards', 'workspace_data.json'),
  ].filter((p) => fs.existsSync(p));
}

function getThunderboardWorkspacePath() {
  const paths = getThunderboardWorkspacePaths();
  if (paths.length > 0) return paths[0];
  const appData = process.env.APPDATA || path.join(process.env.USERPROFILE || '', 'AppData', 'Roaming');
  return path.join(appData, 'ThunderBoard v4', 'boards', 'workspace_data.json');
}

function getThunderboardInfo() {
  const exePath = getThunderboardExe();
  const wsPath = getThunderboardWorkspacePath();

  let activeBatchId = null;
  let batches = [];

  if (fs.existsSync(wsPath)) {
    try {
      const content = fs.readFileSync(wsPath, 'utf-8');
      const data = JSON.parse(content);
      activeBatchId = data.activeBatchId || null;
      if (Array.isArray(data.batches)) {
        batches = data.batches.map((b) => ({
          id: b.id,
          name: b.name || 'Untitled Batch',
          pageCount: Array.isArray(b.pages) ? b.pages.length : 0,
          updatedAt: b.updatedAt || 0,
          isCurrentActive: b.id === activeBatchId,
        }));
      }
    } catch (err) {
      console.error('[WorkEasy] Failed to parse ThunderBoard workspace_data.json:', err);
    }
  }

  return {
    installed: !!exePath,
    exePath: exePath || '',
    workspaceExists: fs.existsSync(wsPath),
    activeBatchId,
    batches,
  };
}

function setActiveThunderboardBatch(batchIdOrName) {
  if (!batchIdOrName) return { success: false, error: 'No batch ID or name provided' };

  const wsPaths = getThunderboardWorkspacePaths();
  if (wsPaths.length === 0) {
    return { success: false, error: 'ThunderBoard workspace_data.json not found' };
  }

  let switchedResult = null;
  let lastError = null;

  for (const wsPath of wsPaths) {
    try {
      const content = fs.readFileSync(wsPath, 'utf-8');
      const data = JSON.parse(content);

      if (!Array.isArray(data.batches) || data.batches.length === 0) {
        continue;
      }

      const target = data.batches.find(
        (b) => b.id === batchIdOrName || (b.name && b.name.toLowerCase() === String(batchIdOrName).toLowerCase())
      );

      if (!target) {
        continue;
      }

      data.activeBatchId = target.id;

      // Compact atomic write for fast performance even on large workspaces
      const tmpPath = `${wsPath}.tmp`;
      const serialized = JSON.stringify(data);
      fs.writeFileSync(tmpPath, serialized, 'utf-8');
      try {
        fs.renameSync(tmpPath, wsPath);
      } catch (renameErr) {
        fs.writeFileSync(wsPath, serialized, 'utf-8');
        if (fs.existsSync(tmpPath)) {
          try { fs.unlinkSync(tmpPath); } catch (e) {}
        }
      }

      console.log(`[WorkEasy] Switched ThunderBoard active batch to: "${target.name}" (${target.id}) in ${wsPath}`);
      switchedResult = { success: true, batchId: target.id, batchName: target.name };
    } catch (err) {
      console.error(`[WorkEasy] Error setting ThunderBoard active batch in ${wsPath}:`, err);
      lastError = err.message;
    }
  }

  if (switchedResult) return switchedResult;
  return { success: false, error: lastError || `Batch "${batchIdOrName}" not found in ThunderBoard` };
}

module.exports = {
  getThunderboardExe,
  getThunderboardWorkspacePath,
  getThunderboardInfo,
  setActiveThunderboardBatch,
};
