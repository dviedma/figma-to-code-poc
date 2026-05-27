// Token Watcher — plugin sandbox
//
// Architecture note (why no REST API):
// The Figma Variables REST API requires the `file_variables:read` token scope,
// which is gated behind paid plans. Instead, the plugin reads variables directly
// via the Plugin API (no scope needed), resolves aliases to formatted CSS values,
// and forwards the complete token map to the workflow via `tokens_data` input.
// The Claude agent then writes tokens.css/tokens.json from that payload — no
// Figma API call required on the CI side.

const DEBOUNCE_MS   = 2000;
const POLL_INTERVAL = 30000;

figma.showUI(__html__, { width: 320, height: 420, title: 'Token Watcher' });

let lastSnapshot = null; // { [varName]: { formatted, resolvedType } }
let debounceTimer = null;

// ── Value resolution ──────────────────────────────────────────────────────────

// Follow VARIABLE_ALIAS chain to the primitive raw value.
// allVars / allCollections must be pre-built (async work done up front).
function resolveAlias(value, allVars, allCollections) {
  const visited = {};
  let current = value;
  while (current && typeof current === 'object' && current.type === 'VARIABLE_ALIAS') {
    if (visited[current.id]) break; // guard against circular refs
    visited[current.id] = true;
    const prim = allVars[current.id];
    if (!prim) break;
    const col = allCollections[prim.variableCollectionId];
    const modeId = col ? col.defaultModeId : Object.keys(prim.valuesByMode)[0];
    current = prim.valuesByMode[modeId];
  }
  return current;
}

// Convert a resolved primitive value to a CSS string.
function formatValue(resolved, resolvedType) {
  if (resolvedType === 'COLOR' && resolved && typeof resolved === 'object') {
    const hex = (n) => Math.round((n || 0) * 255).toString(16).padStart(2, '0');
    return '#' + hex(resolved.r) + hex(resolved.g) + hex(resolved.b);
  }
  if (resolvedType === 'FLOAT' && typeof resolved === 'number') {
    return resolved + 'px';
  }
  return null;
}

// ── Snapshot ──────────────────────────────────────────────────────────────────
// Resolves every Semantic alias down to its formatted CSS value.
// Storing formatted strings (not raw alias objects) means the diff correctly
// catches primitive value changes, not just alias pointer changes.

async function snapshotSemanticTokens() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const semantic = collections.find(c => c.name === 'Semantic');
  if (!semantic) return null;

  // Pre-load all variables and collections into flat lookups
  const allCollections = {};
  const allVars = {};
  for (const col of collections) {
    allCollections[col.id] = col;
    for (const varId of col.variableIds) {
      const v = await figma.variables.getVariableByIdAsync(varId);
      if (v) allVars[v.id] = v;
    }
  }

  const snapshot = {};
  for (const varId of semantic.variableIds) {
    const sv = allVars[varId];
    if (!sv) continue;
    const raw = sv.valuesByMode[semantic.defaultModeId];
    const resolved = resolveAlias(raw, allVars, allCollections);
    const formatted = formatValue(resolved, sv.resolvedType);
    if (formatted !== null) {
      snapshot[sv.name] = { formatted, resolvedType: sv.resolvedType };
    }
  }
  return snapshot;
}

// ── Diff ──────────────────────────────────────────────────────────────────────

function diffSnapshots(prev, curr) {
  if (!prev) {
    return Object.keys(curr).map(name => ({ name, changeType: 'new' }));
  }
  const changes = [];
  for (const [name, data] of Object.entries(curr)) {
    if (!prev[name]) {
      changes.push({ name, changeType: 'created' });
    } else if (prev[name].formatted !== data.formatted) {
      changes.push({ name, changeType: 'updated', oldValue: prev[name].formatted, newValue: data.formatted });
    }
  }
  for (const name of Object.keys(prev)) {
    if (!curr[name]) changes.push({ name, changeType: 'deleted' });
  }
  return changes;
}

// ── Token payload ─────────────────────────────────────────────────────────────
// Builds the `tokens_data` input sent to the GitHub workflow.
// Format: { "--color-brand-primary": { "value": "#3b82f6", "type": "color" } }

function buildTokenPayload(snapshot) {
  const typeMap = [
    ['color/',     'color'],
    ['space/',     'spacing'],
    ['radius/',    'radius'],
    ['font/size/', 'fontSize'],
  ];
  const tokens = {};
  for (const [name, data] of Object.entries(snapshot)) {
    const cssKey = '--' + name.replace(/\//g, '-').toLowerCase();
    let type = 'other';
    for (const [prefix, label] of typeMap) {
      if (name.indexOf(prefix) === 0) { type = label; break; }
    }
    tokens[cssKey] = { value: data.formatted, type };
  }
  return tokens;
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
  figma.ui.postMessage({
    type: 'trigger',
    changes,
    reason,
    tokensPayload: buildTokenPayload(current),
  });
}

// ── Listeners ─────────────────────────────────────────────────────────────────

figma.on('documentchange', () => {
  console.log('>>>> documentchange');
  figma.ui.postMessage({ type: 'activity' });
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => checkAndMaybeTrigger('documentchange'), DEBOUNCE_MS);
});

setInterval(() => checkAndMaybeTrigger('poll'), POLL_INTERVAL);

// ── UI messages ───────────────────────────────────────────────────────────────

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'save-settings') {
    await figma.clientStorage.setAsync('tw_settings', msg.settings);
    figma.ui.postMessage({ type: 'settings-saved' });
  }
  if (msg.type === 'manual-trigger') {
    const current = await snapshotSemanticTokens();
    if (current) {
      const changes = diffSnapshots(null, current);
      lastSnapshot = Object.assign({}, current);
      figma.ui.postMessage({
        type: 'trigger',
        changes,
        reason: 'manual',
        tokensPayload: buildTokenPayload(current),
      });
    }
  }
};

// ── Init ──────────────────────────────────────────────────────────────────────

async function init() {
  console.log('Hello from Token Watcher plugin 2');
  const settings = await figma.clientStorage.getAsync('tw_settings') || {};
  lastSnapshot = await snapshotSemanticTokens();
  figma.ui.postMessage({
    type: 'init',
    settings,
    tokenCount: lastSnapshot ? Object.keys(lastSnapshot).length : 0,
  });
}

init();
