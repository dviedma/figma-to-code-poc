// Token Watcher — plugin sandbox
//
// Why polling instead of documentchange filtering:
// The documentchange event only fires for node/style changes (CREATE, DELETE,
// PROPERTY_CHANGE, STYLE_*). Variable value edits do NOT produce a documentchange
// event. We use a 30s poll as the primary detection mechanism and also run a check
// whenever documentchange fires (so activity during editing gets picked up quickly).

const DEBOUNCE_MS   = 2000;  // wait for designer to stop before checking
const POLL_INTERVAL = 30000; // fallback poll for variable-only changes

figma.showUI(__html__, { width: 320, height: 420, title: 'Token Watcher' });

let lastSnapshot   = null; // { [varName]: { value, resolvedType } }
let debounceTimer  = null;

// ── Snapshot ──────────────────────────────────────────────────────────────────

async function snapshotSemanticTokens() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const semantic    = collections.find(c => c.name === 'Semantic');
  if (!semantic) return null;

  const snapshot = {};
  for (const varId of semantic.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(varId);
    if (!v) continue;
    snapshot[v.name] = {
      value:        v.valuesByMode[semantic.defaultModeId],
      resolvedType: v.resolvedType,
    };
  }
  return snapshot;
}

// ── Diff ──────────────────────────────────────────────────────────────────────

function diffSnapshots(prev, curr) {
  if (!prev) {
    // First run — all tokens are "new"
    return Object.keys(curr).map(name => ({ name, changeType: 'new' }));
  }

  const changes = [];
  for (const [name, data] of Object.entries(curr)) {
    if (!prev[name]) {
      changes.push({ name, changeType: 'created' });
    } else if (JSON.stringify(prev[name].value) !== JSON.stringify(data.value)) {
      changes.push({ name, changeType: 'updated', oldValue: prev[name].value, newValue: data.value });
    }
  }
  for (const name of Object.keys(prev)) {
    if (!curr[name]) changes.push({ name, changeType: 'deleted' });
  }
  return changes;
}

// ── Check & maybe trigger ─────────────────────────────────────────────────────

async function checkAndMaybeTrigger(reason) {
  const current = await snapshotSemanticTokens();
  if (!current) {
    figma.ui.postMessage({ type: 'status', level: 'warn', text: 'No "Semantic" collection found in this file.' });
    return;
  }

  const changes = diffSnapshots(lastSnapshot, current);
  if (changes.length === 0) {
    figma.ui.postMessage({ type: 'idle' });
    return;
  }

  lastSnapshot = Object.assign({}, current);
  figma.ui.postMessage({ type: 'trigger', changes, reason });
}

// ── Listeners ─────────────────────────────────────────────────────────────────

// documentchange fires for node/style edits — use it as an activity signal to
// schedule a variable check once the designer pauses.
figma.on('documentchange', () => {
  console.log(">>>> documentchange");
  figma.ui.postMessage({ type: 'activity' });
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => checkAndMaybeTrigger('documentchange'), DEBOUNCE_MS);
});

// Periodic poll: catches variable-only changes (no documentchange fires for those).
setInterval(() => checkAndMaybeTrigger('poll'), POLL_INTERVAL);

// ── UI messages ───────────────────────────────────────────────────────────────

figma.ui.onmessage = async (msg) => {
  switch (msg.type) {
    case 'save-settings': {
      await figma.clientStorage.setAsync('tw_settings', msg.settings);
      figma.ui.postMessage({ type: 'settings-saved' });
      break;
    }
    case 'manual-trigger': {
      // Force-diff against a null snapshot so every token shows as "new".
      const current = await snapshotSemanticTokens();
      if (current) {
        const changes = diffSnapshots(null, current);
        lastSnapshot = Object.assign({}, current);
        figma.ui.postMessage({ type: 'trigger', changes, reason: 'manual' });
      }
      break;
    }
  }
};

// ── Init ──────────────────────────────────────────────────────────────────────

async function init() {
  console.log("Hello from Token Watcher plugin");
  const settings = await figma.clientStorage.getAsync('tw_settings') || {};
  lastSnapshot   = await snapshotSemanticTokens();
  figma.ui.postMessage({
    type:        'init',
    settings,
    tokenCount:  lastSnapshot ? Object.keys(lastSnapshot).length : 0,
  });
}

init();
