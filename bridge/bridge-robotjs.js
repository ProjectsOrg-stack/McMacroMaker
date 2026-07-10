// bridge-robotjs.js
// Local WebSocket bridge that accepts a sequence of DSL commands and simulates mouse/keyboard.
// Usage:
//   cd bridge
//   npm install
//   node bridge-robotjs.js

const WebSocket = require('ws');
let robot
try {
  robot = require('robotjs');
} catch (e) {
  console.error('robotjs failed to load:', e.message || e)
}

const wss = new WebSocket.Server({ port: 8080, host: '127.0.0.1' });
console.log('Bridge listening at ws://127.0.0.1:8080 (localhost only)');

let currentRun = { cancelled: false };

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', async (data) => {
    try {
      const raw = typeof data === 'string' ? data : data.toString('utf-8');
      const msg = JSON.parse(raw);
      if (!msg) return;

      if (msg.type === 'ping') {
        ws.send(JSON.stringify({ event: 'pong', ready: !!robot, platform: process.platform, note: robot ? 'robotjs loaded' : 'robotjs missing' }))
        return
      }

      if (msg.type === 'stop') {
        currentRun.cancelled = true;
        ws.send(JSON.stringify({ event: 'stopped' }));
        return;
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
