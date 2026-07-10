// bridge-robotjs.js
// Local WebSocket bridge that accepts a sequence of DSL commands and simulates mouse/keyboard.
// Also supports global hotkey registration for running macros without the browser.
// Usage:
//   cd bridge
//   npm install
//   node bridge-robotjs.js

const util = require('util');
if (!util.isObject) util.isObject = (arg) => typeof arg === 'object' && arg !== null;
if (!util.isFunction) util.isFunction = (arg) => typeof arg === 'function';
if (!util.isString) util.isString = (arg) => typeof arg === 'string';
if (!util.isNumber) util.isNumber = (arg) => typeof arg === 'number';
if (!util.isBoolean) util.isBoolean = (arg) => typeof arg === 'boolean';
if (!util.isUndefined) util.isUndefined = (arg) => arg === undefined;
if (!util.isNull) util.isNull = (arg) => arg === null;
if (!util.isArray) util.isArray = Array.isArray;

const WebSocket = require('ws');
let robot
try {
  robot = require('robotjs');
} catch (e) {
  console.error('robotjs failed to load:', e.message || e)
}

let keyListener = null
try {
  const { GlobalKeyboardListener } = require('node-global-key-listener')
  keyListener = new GlobalKeyboardListener()
} catch (e) {
  console.error('node-global-key-listener failed to load:', e.message || e)
  console.log('Global hotkeys will not be available. Run: npm install')
}

const wss = new WebSocket.Server({ port: 8080, host: '127.0.0.1' });
console.log('Bridge listening at ws://127.0.0.1:8080 (localhost only)');

let currentRun = { cancelled: false };
const registeredHotkeys = new Map();
let recording = false;

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

function broadcast(obj) {
  const msg = JSON.stringify(obj)
  wss.clients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      try { ws.send(msg) } catch {}
    }
  })
}

// --- Global hotkey listener ---
if (keyListener) {
  keyListener.addListener((e) => {
    if (recording && e.state === 'DOWN') {
      broadcast({
        event: 'recordedKey',
        key: e.name,
        state: e.state,
        alt: e.altKey,
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        meta: e.metaKey,
      })
      return
    }

    if (e.state === 'DOWN') {
      for (const [id, reg] of registeredHotkeys) {
        const hk = reg.hotkey
        if (
          e.name?.toUpperCase() === hk.key?.toUpperCase() &&
          !!e.ctrlKey === !!hk.ctrl &&
          !!e.shiftKey === !!hk.shift &&
          !!e.altKey === !!hk.alt &&
          !!e.metaKey === !!hk.meta
        ) {
          console.log(`Hotkey triggered: ${id}`)
          runHotkeyMacro(id, reg.steps)
          return
        }
      }
    }
  })
  console.log('Global hotkey listener active')
}

async function runHotkeyMacro(id, steps) {
  if (!robot) {
    broadcast({ event: 'error', error: 'robotjs not available', hotkeyId: id })
    return
  }
  currentRun = { cancelled: false }
  broadcast({ event: 'hotkeyStart', hotkeyId: id })

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]
    if (currentRun.cancelled) {
      broadcast({ event: 'stopped', hotkeyId: id, index: i })
      break
    }
    broadcast({ event: 'stepStart', index: i, cmd: step.cmd, hotkeyId: id })
    try {
      await handleLine(step.cmd)
      broadcast({ event: 'stepDone', index: i, cmd: step.cmd, hotkeyId: id })
    } catch (e) {
      broadcast({ event: 'error', index: i, error: String(e), hotkeyId: id })
    }
    if (step.delay) await wait(step.delay)
  }
  broadcast({ event: 'done', hotkeyId: id })
}

// --- WebSocket handler ---
wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', async (data) => {
    try {
      const raw = typeof data === 'string' ? data : data.toString('utf-8');
      const msg = JSON.parse(raw);
      if (!msg) return;

      if (msg.type === 'ping') {
        ws.send(JSON.stringify({
          event: 'pong',
          ready: !!robot,
          platform: process.platform,
          hotkeys: keyListener ? true : false,
          registered: Array.from(registeredHotkeys.keys()),
          note: robot ? 'robotjs loaded' : 'robotjs missing',
        }))
        return
      }

      if (msg.type === 'stop') {
        currentRun.cancelled = true;
        ws.send(JSON.stringify({ event: 'stopped' }));
        return;
      }

      if (msg.type === 'register') {
        const { id, hotkey, steps } = msg
        if (!id || !hotkey || !steps) {
          ws.send(JSON.stringify({ event: 'error', error: 'register requires id, hotkey, steps' }))
          return
        }
        registeredHotkeys.set(id, { hotkey, steps })
        console.log(`Registered hotkey: ${id} → ${JSON.stringify(hotkey)}`)
        ws.send(JSON.stringify({ event: 'registered', id, hotkey }))
        return
      }

      if (msg.type === 'unregister') {
        registeredHotkeys.delete(msg.id)
        console.log(`Unregistered hotkey: ${msg.id}`)
        ws.send(JSON.stringify({ event: 'unregistered', id: msg.id }))
        return
      }

      if (msg.type === 'listHotkeys') {
        const list = []
        for (const [id, reg] of registeredHotkeys) {
          list.push({ id, hotkey: reg.hotkey })
        }
        ws.send(JSON.stringify({ event: 'hotkeyList', hotkeys: list }))
        return
      }

      if (msg.type === 'startRecording') {
        recording = true
        console.log('Recording started')
        ws.send(JSON.stringify({ event: 'recordingStarted' }))
        return
      }

      if (msg.type === 'stopRecording') {
        recording = false
        console.log('Recording stopped')
        ws.send(JSON.stringify({ event: 'recordingStopped' }))
        return
      }

      if (msg.type === 'sequence' && Array.isArray(msg.steps)) {
        if (!robot) {
          ws.send(JSON.stringify({ event: 'error', error: 'automation library not available on bridge (robotjs missing)' }))
          return
        }
        currentRun = { cancelled: false };
        const steps = msg.steps;
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          if (currentRun.cancelled) {
            ws.send(JSON.stringify({ event: 'stopped', index: i }));
            break;
          }
          ws.send(JSON.stringify({ event: 'stepStart', index: i, cmd: step.cmd }));
          try {
            await handleLine(step.cmd);
            ws.send(JSON.stringify({ event: 'stepDone', index: i, cmd: step.cmd }));
          } catch (e) {
            ws.send(JSON.stringify({ event: 'error', index: i, error: String(e) }));
          }
          if (step.delay) await wait(step.delay);
        }
        ws.send(JSON.stringify({ event: 'done' }));
      } else {
        ws.send(JSON.stringify({ event: 'error', error: 'unknown message' }));
      }
    } catch (err) {
      console.error('Error handling message', err);
      try { ws.send(JSON.stringify({ event: 'error', error: String(err) })); } catch {}
    }
  });
});

async function handleLine(line) {
  if (!line || typeof line !== 'string') return;
  const parts = line.trim().split(/\s+/);
  const cmd = parts[0].toUpperCase();

  if (cmd === 'DELAY') {
    const ms = parseInt(parts[1] || '0', 10) || 0;
    await wait(ms);
    return;
  }

  if (cmd === 'CHAT') {
    const text = line.slice(5);
    robot.typeString(text);
    robot.keyTap('enter');
    return;
  }

  if (cmd === 'KEY') {
    const action = (parts[1] || '').toUpperCase();
    const key = (parts[2] || '').toLowerCase();
    if (action === 'TAP') robot.keyTap(key);
    else if (action === 'DOWN') robot.keyToggle(key, 'down');
    else if (action === 'UP') robot.keyToggle(key, 'up');
    return;
  }

  if (cmd === 'MOUSE_MOVE') {
    const x = parseInt(parts[1], 10) || 0;
    const y = parseInt(parts[2], 10) || 0;
    robot.moveMouseSmooth(x, y);
    return;
  }

  if (cmd === 'MOUSE_CLICK') {
    const btn = (parts[1] || 'left').toLowerCase();
    robot.mouseClick(btn);
    return;
  }

  if (cmd === 'SCROLL') {
    const dx = parseInt(parts[1] || '0', 10) || 0;
    const dy = parseInt(parts[2] || '0', 10) || 0;
    robot.scrollMouse(dx, dy);
    return;
  }

  // Fallback: type the raw line
  robot.typeString(line);
}
