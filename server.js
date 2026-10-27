'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname);
const PORT = Number.parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const TIKTOK_USERNAME = String(process.env.TIKTOK_USERNAME || 'disepillya').replace(/^@/, '').trim();
const TIKTOK_BRIDGE_ENABLED = process.env.TIKTOK_BRIDGE_ENABLED === 'true';
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
const PUBLIC_FILES = new Map([
  ['/', 'index.html'], ['/index.html', 'index.html'], ['/styles.css', 'styles.css'], ['/app.js', 'app.js'],
]);
const eventClients = new Set();
const seenMessageIds = new Map();
let bridgeState = { status: TIKTOK_BRIDGE_ENABLED ? 'starting' : 'disabled', username: TIKTOK_USERNAME, updatedAt: Date.now() };
let activeConnection = null;
let shuttingDown = false;

function setBridgeState(status, extra = {}) {
  bridgeState = { status, username: TIKTOK_USERNAME, updatedAt: Date.now(), ...extra };
  broadcast('status', bridgeState);
  console.log(`[TikTok bridge] ${status}${extra.roomId ? ` (room ${extra.roomId})` : ''}`);
}

function broadcast(eventName, payload) {
  const message = `event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const res of eventClients) {
    try { res.write(message); } catch { eventClients.delete(res); }
  }
}

function duplicateMessage(messageId) {
  if (!messageId) return false;
  const id = String(messageId);
  if (seenMessageIds.has(id)) return true;
  seenMessageIds.set(id, Date.now());
  if (seenMessageIds.size > 5000) {
    const oldest = seenMessageIds.keys().next().value;
    seenMessageIds.delete(oldest);
  }
  return false;
}

function handleTikTokComment(event) {
  const user = event?.user || {};
  const username = String(user.nickname || user.displayId || user.uniqueId || 'PENONTON').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 40) || 'PENONTON';
  const comment = String(event?.content ?? event?.comment ?? '').trim().slice(0, 300);
  if (!comment) return;
  const eventId = event?.common?.msgId || event?.msgId || '';
  if (duplicateMessage(eventId)) return;
  broadcast('comment', {
    username,
    userId: String(user.id || user.userId || ''),
    comment,
    eventId: String(eventId),
    receivedAt: Date.now(),
  });
}

const delay = ms => new Promise(resolve => {
  const timer = setTimeout(resolve, ms);
  timer.unref?.();
});

async function runTikTokBridge() {
  if (!TIKTOK_BRIDGE_ENABLED) {
    setBridgeState('disabled');
    return;
  }

  let connector;
  try {
    connector = await import('tiktok-live-connector');
  } catch (error) {
    console.error('[TikTok bridge] Connector package could not be loaded:', error?.message || 'unknown error');
    setBridgeState('error');
    return;
  }

  const { TikTokLiveConnection, WebcastEvent, ControlEvent } = connector;
  let retrySeconds = 20;
  while (!shuttingDown) {
    const connection = new TikTokLiveConnection(TIKTOK_USERNAME, { processInitialData: false });
    activeConnection = connection;
    let disconnected;
    const disconnectedPromise = new Promise(resolve => { disconnected = resolve; });

    connection.on(ControlEvent.DISCONNECTED, () => disconnected?.());
    connection.on(ControlEvent.ERROR, () => {
      console.warn('[TikTok bridge] Connection reported an error; it will retry if disconnected.');
    });
    connection.on(WebcastEvent.CHAT, handleTikTokComment);

    setBridgeState('connecting');
    try {
      const state = await connection.connect();
      retrySeconds = 20;
      setBridgeState('connected', { roomId: String(state?.roomId || '') });
      await disconnectedPromise;
      if (!shuttingDown) setBridgeState('waiting');
    } catch (error) {
      const isOffline = error?.name === 'UserOfflineError';
      setBridgeState(isOffline ? 'waiting' : 'error');
      console.warn(`[TikTok bridge] ${isOffline ? 'Account is not live yet.' : 'Connection failed.'} Retrying in ${retrySeconds}s.`);
    } finally {
      if (activeConnection === connection) activeConnection = null;
      try { await connection.disconnect(); } catch { /* Already disconnected. */ }
    }

    if (!shuttingDown) {
      await delay(retrySeconds * 1000);
      retrySeconds = Math.min(60, retrySeconds + 10);
    }
  }
}

const server = http.createServer((req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end('Bad Request'); return; }

  if (pathname === '/api/status') {
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow: 'GET, HEAD' }).end(); return; }
    const body = JSON.stringify(bridgeState);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : body);
    return;
  }

  if (pathname === '/api/events') {
    if (req.method !== 'GET') { res.writeHead(405, { Allow: 'GET' }).end(); return; }
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.write(': quiz event stream connected\n\n');
    res.write(`event: status\ndata: ${JSON.stringify(bridgeState)}\n\n`);
    eventClients.add(res);
    const heartbeat = setInterval(() => { try { res.write(': keep-alive\n\n'); } catch { /* Client closed. */ } }, 20000);
    heartbeat.unref?.();
    req.on('close', () => { clearInterval(heartbeat); eventClients.delete(res); });
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end('Method Not Allowed');
    return;
  }

  const publicFile = PUBLIC_FILES.get(pathname);
  if (!publicFile) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not Found'); return; }
  const file = path.join(ROOT, publicFile);
  fs.stat(file, (statError, stat) => {
    if (statError || !stat.isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not Found'); return; }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache, must-revalidate',
    });
    if (req.method === 'HEAD') res.end();
    else fs.createReadStream(file).pipe(res);
  });
});

async function startServer() {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(PORT, HOST, resolve);
  });
  console.log(`VirtualLive serving ${ROOT} at http://${HOST}:${PORT}`);
  void runTikTokBridge();
}

async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const res of eventClients) { try { res.end(); } catch { /* Ignore closed clients. */ } }
  eventClients.clear();
  if (activeConnection) { try { await activeConnection.disconnect(); } catch { /* Ignore disconnect errors. */ } }
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 3000).unref();
}
if (require.main === module) {
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, shutdown);
  startServer().catch(error => {
    console.error('VirtualLive server failed to start:', error);
    process.exitCode = 1;
  });
}

module.exports = { server, startServer, handleTikTokComment, eventClients, getBridgeState: () => ({ ...bridgeState }) };
