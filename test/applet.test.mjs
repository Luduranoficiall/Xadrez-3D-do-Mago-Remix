import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const ROOT = process.cwd();

test('Simplified Single-Player HUD in src/App.tsx excludes speed sliders, notation script bar, and multiplayer lobby', () => {
  const appTsx = fs.readFileSync(path.join(ROOT, 'src/App.tsx'), 'utf-8');

  // Must include simplified game & camera controls
  for (const requiredId of [
    'btn-side-toggle',
    'btn-ai-move',
    'btn-reset',
    'btn-cam-player',
    'btn-cam-top',
    'btn-cam-side',
    'btn-cam-wide',
    'btn-hide-ui',
    'controls-hint',
    'captured-tray'
  ]) {
    assert.ok(appTsx.includes(`id="${requiredId}"`), `Missing required HUD control #${requiredId}`);
  }

  // Must NOT include camera speed sliders, script mode bar, or multiplayer lobby
  for (const forbiddenId of [
    'cam-speed-wrap',
    'input-cam-speed',
    'rot-speed-wrap',
    'input-rot-speed',
    'script-bar',
    'btn-script-modal',
    'btn-script-prev',
    'btn-script-next',
    'btn-lobby',
    'lobby-modal',
    'room-pill',
    'btn-checkmate-stepback'
  ]) {
    assert.ok(!appTsx.includes(forbiddenId), `Forbidden UI element #${forbiddenId} found in App.tsx`);
  }
});

test('All 7 compressed 3D assets (.glb.gz.b64) decode and gunzip to valid glTF 2.0 binary models', () => {
  const expectedModels = [
    'option8_cathedral',
    'pawn_white',
    'rook_white',
    'knight_white',
    'bishop_white',
    'queen_white',
    'king_white'
  ];

  for (const name of expectedModels) {
    const b64Path = path.join(ROOT, 'public/assets/glb', `${name}.glb.gz.b64`);
    assert.ok(fs.existsSync(b64Path), `Missing 3D asset ${b64Path}`);
    const b64Text = fs.readFileSync(b64Path, 'utf-8').trim();
    assert.ok(b64Text.length > 1000, `Asset ${name}.glb.gz.b64 is unexpectedly small`);

    const gzBuf = Buffer.from(b64Text, 'base64');
    const glbBuf = zlib.gunzipSync(gzBuf);

    const magic = glbBuf.toString('ascii', 0, 4);
    const version = glbBuf.readUInt32LE(4);
    const totalLen = glbBuf.readUInt32LE(8);
    assert.equal(magic, 'glTF', `Invalid glTF magic header for ${name}`);
    assert.equal(version, 2, `Invalid glTF version for ${name}`);
    assert.equal(totalLen, glbBuf.length, `Mismatched glTF byte length for ${name}`);
  }
});

test('Difficulty levels (Fácil, Médio, Difícil, Hard Master) are present in App.tsx and wizardChessEngine.js', () => {
  const appTsx = fs.readFileSync(path.join(ROOT, 'src/App.tsx'), 'utf-8');
  for (const diffId of [
    'hud-diff-badge',
    'btn-diff-facil',
    'btn-diff-medio',
    'btn-diff-dificil',
    'btn-diff-hardmaster'
  ]) {
    assert.ok(appTsx.includes(`id="${diffId}"`), `Missing difficulty UI control #${diffId}`);
  }

  const engineJs = fs.readFileSync(path.join(ROOT, 'src/wizardChessEngine.js'), 'utf-8');
  assert.ok(engineJs.includes('facil'), 'Missing facil difficulty in wizardChessEngine.js');
  assert.ok(engineJs.includes('medio'), 'Missing medio difficulty in wizardChessEngine.js');
  assert.ok(engineJs.includes('dificil'), 'Missing dificil difficulty in wizardChessEngine.js');
  assert.ok(engineJs.includes('hard_master'), 'Missing hard_master difficulty in wizardChessEngine.js');
  assert.ok(engineJs.includes('minimaxAlphaBeta'), 'Missing minimaxAlphaBeta in wizardChessEngine.js');
});

test('Move History Log drawer, toggle button, and SAN notation generator exist in App.tsx and wizardChessEngine.js', () => {
  const appTsx = fs.readFileSync(path.join(ROOT, 'src/App.tsx'), 'utf-8');
  for (const historyId of [
    'btn-history-toggle',
    'history-drawer',
    'history-move-count',
    'btn-copy-history',
    'btn-history-close',
    'history-moves-list',
    'history-empty-placeholder',
    'history-footer-status'
  ]) {
    assert.ok(appTsx.includes(`id="${historyId}"`), `Missing history log UI control #${historyId}`);
  }

  const engineJs = fs.readFileSync(path.join(ROOT, 'src/wizardChessEngine.js'), 'utf-8');
  assert.ok(engineJs.includes('formatMoveToSAN'), 'Missing formatMoveToSAN in wizardChessEngine.js');
  assert.ok(engineJs.includes('getHistoryPGN'), 'Missing getHistoryPGN in wizardChessEngine.js');
  assert.ok(engineJs.includes('updateMoveHistoryLogUI'), 'Missing updateMoveHistoryLogUI in wizardChessEngine.js');
  assert.ok(engineJs.includes('toggleHistoryDrawer'), 'Missing toggleHistoryDrawer in wizardChessEngine.js');

  const stylesCss = fs.readFileSync(path.join(ROOT, 'src/styles.css'), 'utf-8');
  assert.ok(stylesCss.includes('.history-drawer'), 'Missing .history-drawer in styles.css');
  assert.ok(stylesCss.includes('.history-row'), 'Missing .history-row in styles.css');
});

test('Move Duration Indicator: active turn duration tracking, formatMoveDuration helper, and clean PGN export', () => {
  const engineJs = fs.readFileSync(path.join(ROOT, 'src/wizardChessEngine.js'), 'utf-8');
  const stylesCss = fs.readFileSync(path.join(ROOT, 'src/styles.css'), 'utf-8');

  // Verify durationSec tracking and formatMoveDuration in engine
  assert.ok(engineJs.includes('formatMoveDuration'), 'formatMoveDuration function missing in engine');
  assert.ok(engineJs.includes('currentTurnStartTime'), 'currentTurnStartTime state missing in engine');
  assert.ok(engineJs.includes('durationSec:'), 'durationSec missing in move history records');
  assert.ok(engineJs.includes('move-duration-badge'), 'move-duration-badge class missing in history rendering');

  // Verify CSS badge styling
  assert.ok(stylesCss.includes('.move-duration-badge'), 'Missing .move-duration-badge rule in styles.css');
  assert.ok(stylesCss.includes('tabular-nums'), 'Missing tabular-nums for duration badges in styles.css');

  // Extract and unit-test formatMoveDuration logic directly
  const match = engineJs.match(/function formatMoveDuration\(sec\) \{([\s\S]*?)\n    \}/);
  assert.ok(match, 'Could not extract formatMoveDuration function');
  const formatMoveDuration = new Function('sec', match[1]);

  assert.equal(formatMoveDuration(0.4), '+<1s');
  assert.equal(formatMoveDuration(2.2), '+2s');
  assert.equal(formatMoveDuration(14), '+14s');
  assert.equal(formatMoveDuration(60), '+1m');
  assert.equal(formatMoveDuration(75), '+1m 15s');
  assert.equal(formatMoveDuration(130), '+2m 10s');
  assert.equal(formatMoveDuration(-1), '');
  assert.equal(formatMoveDuration(null), '');

  // Verify PGN export remains standard (does not include duration badges)
  const pgnMatch = engineJs.match(/function getHistoryPGN\(\) \{([\s\S]*?)\n    \}/);
  assert.ok(pgnMatch, 'Could not extract getHistoryPGN function');
  assert.ok(!pgnMatch[1].includes('move-duration-badge'), 'PGN export must not be polluted with badge HTML');
  assert.ok(!pgnMatch[1].includes('formatMoveDuration'), 'PGN export must remain standard algebraic notation');
});



