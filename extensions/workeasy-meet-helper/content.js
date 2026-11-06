// WorkEasy Google Meet Auto-Join Extension
(function () {
  'use strict';

  console.log('[WorkEasy] Google Meet Helper initializing on:', window.location.href);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Clean, single-click dispatcher
  function singleClick(el) {
    if (!el) return false;
    try {
      el.scrollIntoView?.({ block: 'center', inline: 'center' });
      
      const opts = { bubbles: true, cancelable: true, view: window };
      el.dispatchEvent(new MouseEvent('mousedown', opts));
      el.dispatchEvent(new MouseEvent('mouseup', opts));
      el.dispatchEvent(new MouseEvent('click', opts));
      el.click?.();
      return true;
    } catch (e) {
      try {
        el.click?.();
        return true;
      } catch (err) {
        return false;
      }
    }
  }

  // Parse trigger params with sessionStorage persistence
  function getWorkEasyParams() {
    const raw = window.location.hash || window.location.search;
    if (raw) {
      const clean = raw.replace(/^[#?]/, '');
      const params = new URLSearchParams(clean);

      if (params.get('workeasy') === '1' || params.get('we') === '1') {
        const parsed = {
          autoJoin: params.get('join') !== '0',
          muteMic: params.get('mic') === '1',
          muteCam: params.get('cam') === '1',
          timestamp: Date.now(),
        };
        try {
          sessionStorage.setItem('workeasy_meet_config', JSON.stringify(parsed));
        } catch (e) {}
        return parsed;
      }
    }

    try {
      const stored = sessionStorage.getItem('workeasy_meet_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() - (parsed.timestamp || 0) < 300000) { // Valid for 5 minutes
          return parsed;
        }
      }
    } catch (e) {}

    return null;
  }

  const config = getWorkEasyParams();
  if (!config) {
    return; // Not launched via WorkEasy
  }

  console.log('[WorkEasy] Automation Config Active:', config);

  try {
    if (window.location.hash.includes('workeasy=')) {
      const cleanUrl = window.location.origin + window.location.pathname + window.location.search;
      window.history.replaceState(null, '', cleanUrl);
    }
  } catch (e) {}

  // Floating Status HUD (Snackbar)
  let hudEl = null;
  function showHUD(message, isError = false) {
    if (!hudEl) {
      hudEl = document.createElement('div');
      hudEl.id = 'workeasy-hud-snackbar';
      hudEl.style.position = 'fixed';
      hudEl.style.top = '16px';
      hudEl.style.right = '16px';
      hudEl.style.zIndex = '9999999';
      hudEl.style.background = '#0c1017';
      hudEl.style.border = '1.5px solid #ea580c';
      hudEl.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.8), 0 0 14px rgba(234, 88, 12, 0.4)';
      hudEl.style.color = '#ffffff';
      hudEl.style.fontFamily = 'Inter, Segoe UI, system-ui, sans-serif';
      hudEl.style.fontSize = '12px';
      hudEl.style.fontWeight = '600';
      hudEl.style.padding = '10px 16px';
      hudEl.style.borderRadius = '12px';
      hudEl.style.display = 'flex';
      hudEl.style.alignItems = 'center';
      hudEl.style.gap = '10px';
      hudEl.style.maxWidth = '420px';
      hudEl.style.transition = 'all 0.3s ease';
      document.body.appendChild(hudEl);
    }

    hudEl.style.borderColor = isError ? '#ef4444' : '#ea580c';
    hudEl.innerHTML = `
      <span style="display:inline-block; width:9px; height:9px; border-radius:50%; background:${isError ? '#ef4444' : '#ea580c'}; box-shadow:0 0 8px ${isError ? '#ef4444' : '#ea580c'}; flex-shrink:0;"></span>
      <span id="we-hud-msg" style="flex:1;">${message}</span>
      <button id="we-hud-close" style="background:none; border:none; color:#94a3b8; font-size:16px; cursor:pointer; margin-left:6px; line-height:1;">&times;</button>
    `;

    const closeBtn = hudEl.querySelector('#we-hud-close');
    if (closeBtn) {
      closeBtn.onclick = () => closeAllSnackbars(0);
    }
  }

  // Dismiss both WorkEasy HUD and Google Meet's native bottom snackbar
  function closeAllSnackbars(delayMs = 1500) {
    setTimeout(() => {
      // 1. Close WorkEasy HUD
      if (hudEl) {
        hudEl.style.opacity = '0';
        hudEl.style.transform = 'translateY(-10px)';
        setTimeout(() => {
          hudEl?.remove();
          hudEl = null;
        }, 400);
      }

      // 2. Dismiss Google Meet's bottom notification bar
      try {
        const dismissButtons = Array.from(document.querySelectorAll('button, div[role="button"]')).filter((b) => {
          const text = (b.textContent || '').trim().toLowerCase();
          const label = (b.getAttribute('aria-label') || '').toLowerCase();
          return text === 'dismiss' || text === 'close' || label.includes('dismiss');
        });
        dismissButtons.forEach((btn) => btn.click());
      } catch (e) {}

      try {
        sessionStorage.removeItem('workeasy_meet_config');
      } catch (e) {}
    }, delayMs);
  }

  showHUD('WorkEasy: Google Meet Assistant Active');

  // Helper: Poll for element
  function waitFor(predicate, timeoutMs = 20000, intervalMs = 250) {
    const startTime = Date.now();
    return new Promise((resolve) => {
      const timer = setInterval(() => {
        try {
          const res = predicate();
          if (res) {
            clearInterval(timer);
            resolve(res);
          } else if (Date.now() - startTime > timeoutMs) {
            clearInterval(timer);
            resolve(null);
          }
        } catch (err) {
          clearInterval(timer);
          resolve(null);
        }
      }, intervalMs);
    });
  }

  // 1. Lobby Automation: Mic / Cam toggling & Join
  async function handleLobby() {
    showHUD('WorkEasy: Preparing to Join...');
    await sleep(1500);

    if (config.muteMic) {
      const micBtn = document.querySelector('div[role="button"][aria-label*="microphone" i], button[aria-label*="microphone" i]');
      if (micBtn && (micBtn.getAttribute('data-is-muted') === 'false' || micBtn.getAttribute('aria-label')?.toLowerCase().includes('turn off microphone'))) {
        singleClick(micBtn);
      }
    }

    if (config.muteCam) {
      const camBtn = document.querySelector('div[role="button"][aria-label*="camera" i], button[aria-label*="camera" i]');
      if (camBtn && (camBtn.getAttribute('data-is-muted') === 'false' || camBtn.getAttribute('aria-label')?.toLowerCase().includes('turn off camera'))) {
        singleClick(camBtn);
      }
    }

    // Locate "Join now" or "Ask to join"
    const joinBtn = await waitFor(() => {
      const buttons = Array.from(document.querySelectorAll('button, div[role="button"]'));
      return buttons.find((b) => {
        const text = (b.textContent || '').trim().toLowerCase();
        const label = (b.getAttribute('aria-label') || '').toLowerCase();
        return (
          text === 'join now' ||
          text === 'ask to join' ||
          label.includes('join now') ||
          label.includes('ask to join')
        );
      });
    }, 20000);

    if (joinBtn) {
      showHUD('WorkEasy: Joining call...');
      await sleep(800);
      singleClick(joinBtn);
      console.log('[WorkEasy] Clicked Join Button');
    }

    await handleInsideMeeting();
  }

  // 2. In-Meeting Automation: Detect Call & Dismiss HUD
  async function handleInsideMeeting() {
    showHUD('WorkEasy: Connecting to meeting room...');

    // Wait for in-call indicator: Leave call button or bottom toolbar
    const inCallIndicator = await waitFor(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find((b) => {
        const label = (b.getAttribute('aria-label') || '').toLowerCase();
        return label.includes('leave call') || label.includes('leave meeting') || label.includes('more options');
      });
    }, 45000);

    if (!inCallIndicator) {
      console.log('[WorkEasy] In-call controls not detected within timeout.');
      closeAllSnackbars(1000);
      return;
    }

    console.log('[WorkEasy] Inside meeting room.');
    showHUD('WorkEasy: Connected to Meeting! 🟢');
    closeAllSnackbars(1500);
  }

  // Execute
  handleLobby();
})();
