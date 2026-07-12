#!/usr/bin/env node
// driver.mjs — render a static study HTML page in headless Chrome and save a
// full-page PNG screenshot. Dependency-free: uses the installed Chrome plus
// Node's built-in global WebSocket (Node >= 22) to talk the DevTools Protocol.
//
// Usage:
//   node driver.mjs [input.html] [output.png]
//
// Defaults: input  = first *.html in the unit dir (two levels up from skill)
//           output = <input basename>.png next to this driver (render-<name>.png)
//
// Exit codes: 0 ok, 1 setup/launch error, 2 render error.

import { spawn } from 'node:child_process';
import { existsSync, readdirSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve, basename, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const UNIT = resolve(HERE, '..', '..', '..'); // .claude/skills/run-* -> unit root

function findChrome() {
  const cands = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ].filter(Boolean);
  for (const c of cands) if (existsSync(c)) return c;
  console.error('[driver] No Chrome/Edge found. Set CHROME_PATH to the .exe.');
  process.exit(1);
}

function resolveInput(arg) {
  if (arg) return resolve(arg);
  const html = readdirSync(UNIT).filter((f) => f.toLowerCase().endsWith('.html'));
  if (!html.length) {
    console.error(`[driver] No input given and no *.html found in ${UNIT}`);
    process.exit(1);
  }
  return resolve(UNIT, html[0]);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForDevtools(port, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (r.ok) return (await r.json()).webSocketDebuggerUrl;
    } catch { /* not up yet */ }
    await sleep(150);
  }
  throw new Error('Chrome DevTools endpoint never came up');
}

// Minimal CDP client over the browser-level WebSocket using sessions (flatten).
function makeCdp(ws) {
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve: res, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : res(msg.result);
    }
  });
  return (method, params = {}, sessionId) =>
    new Promise((res, reject) => {
      const mid = ++id;
      pending.set(mid, { resolve: res, reject });
      ws.send(JSON.stringify({ id: mid, method, params, sessionId }));
    });
}

async function main() {
  const chrome = findChrome();
  const input = resolveInput(process.argv[2]);
  if (!existsSync(input)) { console.error(`[driver] input not found: ${input}`); process.exit(1); }
  const out = process.argv[3]
    ? resolve(process.argv[3])
    : join(HERE, `render-${basename(input, extname(input))}.png`);
  const url = pathToFileURL(input).href;

  const port = 9200 + Math.floor(Math.random() * 300);
  const profile = mkdtempSync(join(tmpdir(), 'rv-chrome-'));
  const child = spawn(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    'about:blank',
  ], { stdio: 'ignore' });

  let ws;
  const cleanup = () => {
    try { ws?.close(); } catch {}
    try { child.kill(); } catch {}
    try { rmSync(profile, { recursive: true, force: true }); } catch {}
  };

  try {
    const wsUrl = await waitForDevtools(port);
    ws = new WebSocket(wsUrl);
    await new Promise((res, rej) => {
      ws.addEventListener('open', res, { once: true });
      ws.addEventListener('error', () => rej(new Error('ws error')), { once: true });
    });
    const cdp = makeCdp(ws);

    const { targetId } = await cdp('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await cdp('Target.attachToTarget', { targetId, flatten: true });

    await cdp('Page.enable', {}, sessionId);
    // Render at a comfortable reading width so wide vocab tables aren't cramped
    // (headless defaults to an 800px viewport). Height is auto-grown by the
    // full-page capture below, so the value here only sets the initial viewport.
    await cdp('Emulation.setDeviceMetricsOverride', {
      width: Number(process.env.RV_WIDTH) || 1200, height: 1000,
      deviceScaleFactor: 1, mobile: false,
    }, sessionId);
    await cdp('Page.navigate', { url }, sessionId);
    await sleep(800); // let layout + fonts settle (local file, no network wait needed)

    const { cssContentSize } = await cdp('Page.getLayoutMetrics', {}, sessionId);
    const clip = {
      x: 0, y: 0,
      width: Math.ceil(cssContentSize.width),
      height: Math.ceil(cssContentSize.height),
      scale: 1,
    };
    const { data } = await cdp('Page.captureScreenshot', {
      format: 'png', captureBeyondViewport: true, clip,
    }, sessionId);

    writeFileSync(out, Buffer.from(data, 'base64'));
    console.log(`[driver] OK ${clip.width}x${clip.height} -> ${out}`);
    cleanup();
    process.exit(0);
  } catch (err) {
    console.error(`[driver] render failed: ${err.message}`);
    cleanup();
    process.exit(2);
  }
}

main();
