const fs = require('fs');
const path = require('path');

function getThunderboardExe() {
  const candidatePaths = [
    'D:\\sharief\\smart-board\\release-v3\\win-unpacked\\ThunderBoard v3.exe',
    'D:\\sharief\\smart-board\\release-v3\\ThunderBoard v3 3.0.0.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Programs', 'ThunderBoard v3', 'ThunderBoard v3.exe'),
    path.join(process.env.ProgramFiles || '', 'ThunderBoard v3', 'ThunderBoard v3.exe'),
    path.join(process.env['ProgramFiles(x86)'] || '', 'ThunderBoard v3', 'ThunderBoard v3.exe'),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

function getThunderboardWorkspacePath() {
  const appData = process.env.APPDATA || path.join(process.env.USERPROFILE || '', 'AppData', 'Roaming');
  return path.join(appData, 'ThunderBoard v3', 'boards', 'workspace_data.json');
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

  const wsPath = getThunderboardWorkspacePath();
  if (!fs.existsSync(wsPath)) {
    return { success: false, error: 'ThunderBoard workspace_data.json not found' };
  }

  try {
    const content = fs.readFileSync(wsPath, 'utf-8');
    const data = JSON.parse(content);

    if (!Array.isArray(data.batches) || data.batches.length === 0) {
      return { success: false, error: 'No batches found in ThunderBoard' };
    }

    const target = data.batches.find(
      (b) => b.id === batchIdOrName || (b.name && b.name.toLowerCase() === String(batchIdOrName).toLowerCase())
    );

    if (!target) {
      return { success: false, error: `Batch "${batchIdOrName}" not found in ThunderBoard` };
    }

    data.activeBatchId = target.id;

    // Atomic write
    const tmpPath = `${wsPath}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
    try {
      fs.renameSync(tmpPath, wsPath);
    } catch (renameErr) {
      fs.writeFileSync(wsPath, JSON.stringify(data, null, 2), 'utf-8');
      if (fs.existsSync(tmpPath)) {
        try { fs.unlinkSync(tmpPath); } catch (e) {}
      }
    }

    console.log(`[WorkEasy] Switched ThunderBoard active batch to: "${target.name}" (${target.id})`);
    return { success: true, batchId: target.id, batchName: target.name };
  } catch (err) {
    console.error('[WorkEasy] Error setting ThunderBoard active batch:', err);
    return { success: false, error: err.message };
  }
}

module.exports = {
  getThunderboardExe,
  getThunderboardWorkspacePath,
  getThunderboardInfo,
  setActiveThunderboardBatch,
};
