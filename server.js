'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname);
const PORT = Number.parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const TIKTOK_USERNAME = String(process.env.TIKTOK_USERNAME || 'disepillya').replace(/^@/, '').trim();
const TIKTOK_BRIDGE_ENABLED = process.env.TIKTOK_BRIDGE_ENABLED === 'true';
const GROQ_API_KEY = String(process.env.GROQ_API_KEY || '').trim();
const GROQ_MODEL = String(process.env.GROQ_MODEL || 'llama-3.1-8b-instant').trim();
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
const PUBLIC_FILES = new Map([
  ['/', 'index.html'], ['/index.html', 'index.html'], ['/styles.css', 'styles.css'], ['/app.js', 'app.js'], ['/answer-gate.js', 'answer-gate.js'],
]);
const eventClients = new Set();
const seenMessageIds = new Map();
const hostRequestWindows = new Map();
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
  if (eventId && duplicateMessage(`comment:${eventId}`)) return;
  broadcast('comment', {
    username,
    userId: String(user.id || user.userId || ''),
    comment,
    eventId: String(eventId),
    receivedAt: Date.now(),
  });
}

function handleTikTokMember(event) {
  const user = event?.user || event?.member || event?.viewer || {};
  const username = String(user.nickname || user.displayId || user.uniqueId || event?.nickname || 'PENONTON').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 40) || 'PENONTON';
  const eventId = event?.common?.msgId || event?.msgId || event?.eventId || '';
  if (eventId && duplicateMessage(`member:${eventId}`)) return;
  broadcast('host_event', {
    kind: 'member', username,
    userId: String(user.userId || user.id || user.uid || ''),
    eventId: String(eventId), receivedAt: Date.now(),
  });
}

function handleTikTokFollow(event) {
  const user = event?.user || event?.followInfo?.user || event?.viewer || {};
  const username = String(user.nickname || user.displayId || user.uniqueId || event?.nickname || 'PENONTON').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 40) || 'PENONTON';
  const eventId = event?.common?.msgId || event?.msgId || event?.eventId || '';
  if (eventId && duplicateMessage(`follow:${eventId}`)) return;
  broadcast('host_event', {
    kind: 'follow', username,
    userId: String(user.userId || user.id || user.uid || ''),
    eventId: String(eventId), receivedAt: Date.now(),
  });
}

function handleTikTokSocial(event) {
  const action = [event?.displayType, event?.label, event?.action, event?.type, event?.followInfo?.displayType]
    .filter(value => value !== undefined && value !== null).join(' ').toLowerCase();
  if (/follow|followed|ikuti|mengikuti/.test(action)) handleTikTokFollow(event);
}

function hostPrompt({ kind, username, giftName, count }) {
  const who = String(username || 'penonton').slice(0, 40);
  if (kind === 'member') return `Sapa singkat penonton baru bernama ${who} yang baru bergabung ke LIVE.`;
  if (kind === 'follow') return `Ucapkan terima kasih singkat kepada ${who} yang baru mengikuti akun LIVE.`;
  return `Ucapkan terima kasih singkat kepada ${who} atas gift ${String(giftName || 'gift').slice(0, 50)}${Number(count) > 1 ? ` sebanyak ${Math.min(9999, Number(count))} kali` : ''}.`;
}

async function readJsonBody(req, maxBytes = 2048) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) throw Object.assign(new Error('Request terlalu besar.'), { statusCode: 413 });
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw Object.assign(new Error('Format JSON tidak valid.'), { statusCode: 400 }); }
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(body);
}

function allowHostRequest(req) {
  const ip = req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const window = hostRequestWindows.get(ip);
  if (!window || now - window.startedAt >= 60_000) {
    hostRequestWindows.set(ip, { startedAt: now, count: 1 });
    return true;
  }
  if (window.count >= 10) return false;
  window.count++;
  return true;
}

async function generateHostLine(input) {
  if (!GROQ_API_KEY) throw Object.assign(new Error('AI host belum dikonfigurasi di server.'), { statusCode: 503 });
  const kind = ['member', 'follow', 'gift'].includes(input?.kind) ? input.kind : '';
  if (!kind) throw Object.assign(new Error('Jenis sapaan tidak valid.'), { statusCode: 400 });
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: 'Kamu host LIVE berbahasa Indonesia yang hangat dan ringkas. Buat SATU kalimat lisan natural, maksimal 18 kata. Jangan gunakan emoji, tag, tanda kutip, atau menyebut informasi yang tidak diberikan. Balas hanya kalimat yang akan diucapkan.' },
        { role: 'user', content: hostPrompt({ kind, username: input.username, giftName: input.giftName, count: input.count }) },
      ],
      temperature: 0.65,
      max_tokens: 72,
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) {
    const error = new Error(response.status === 429 ? 'Batas permintaan AI Groq tercapai.' : 'AI Groq sedang tidak bisa dihubungi.');
    error.statusCode = response.status === 429 ? 429 : 502;
    throw error;
  }
  const data = await response.json();
  const text = String(data?.choices?.[0]?.message?.content || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/[“”"']/g, '').replace(/\s+/g, ' ').trim().slice(0, 180);
  if (!text) throw Object.assign(new Error('AI Groq tidak mengembalikan sapaan.'), { statusCode: 502 });
  return text;
}

function handleTikTokGift(event) {
  const user = event?.user || {};
  const username = String(user.nickname || user.displayId || user.uniqueId || event?.nickname || 'PENONTON').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 40) || 'PENONTON';
  const details = event?.giftDetails || event?.extendedGiftInfo || event || {};
  const giftName = String(details.giftName || event?.giftName || event?.extendedGiftInfo?.name || 'TikTok Gift').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 50) || 'TikTok Gift';
  const giftType = Number(details.giftType ?? event?.giftType ?? event?.gift?.gift_type ?? 0);
  const repeatEnd = event?.repeatEnd === true || Number(event?.repeatEnd) === 1 || event?.gift?.repeat_end === 1;
  if (giftType === 1 && !repeatEnd) return; // Wait for the end of combo gifts to avoid duplicate bursts.
  const eventId = event?.common?.msgId || event?.msgId || event?.groupId || '';
  if (eventId && duplicateMessage(`gift:${eventId}`)) return;
  const repeatCount = Math.min(9999, Math.max(1, Number(event?.repeatCount ?? event?.gift?.repeat_count ?? 1) || 1));
  const diamondCount = Math.max(0, Number(details.diamondCount ?? event?.diamondCount ?? 0) || 0);
  broadcast('gift', {
    username,
    giftName,
    giftId: String(event?.giftId ?? event?.gift?.gift_id ?? ''),
    repeatCount,
    diamondCount,
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
    if (WebcastEvent.GIFT) connection.on(WebcastEvent.GIFT, handleTikTokGift);
    connection.on(WebcastEvent.MEMBER || 'member', handleTikTokMember);
    const followEvents = new Set([WebcastEvent.FOLLOW || 'follow', 'follow']);
    for (const eventName of followEvents) connection.on(eventName, handleTikTokFollow);
    const socialEvent = WebcastEvent.SOCIAL || 'social';
    if (!followEvents.has(socialEvent)) connection.on(socialEvent, handleTikTokSocial);

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

  if (pathname === '/api/host/status') {
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow: 'GET, HEAD' }).end(); return; }
    const body = JSON.stringify({ configured: Boolean(GROQ_API_KEY), model: GROQ_MODEL, textLanguage: 'id-ID', speech: 'browser-speechSynthesis' });
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : body);
    return;
  }

  if (pathname === '/api/host/line') {
    if (req.method !== 'POST') { res.writeHead(405, { Allow: 'POST' }).end(); return; }
    if (!allowHostRequest(req)) { sendJson(res, 429, { error: 'Terlalu banyak permintaan host. Coba lagi sebentar.' }); return; }
    const origin = req.headers.origin;
    if (origin) {
      try { if (new URL(origin).host !== req.headers.host) { sendJson(res, 403, { error: 'Origin tidak diizinkan.' }); return; } }
      catch { sendJson(res, 403, { error: 'Origin tidak valid.' }); return; }
    }
    readJsonBody(req).then(generateHostLine).then(text => sendJson(res, 200, { text }))
      .catch(error => sendJson(res, error.statusCode || 502, { error: error.statusCode ? error.message : 'Gagal membuat sapaan AI.' }));
    return;
  }

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

module.exports = { server, startServer, handleTikTokComment, handleTikTokGift, handleTikTokMember, handleTikTokFollow, handleTikTokSocial, generateHostLine, eventClients, getBridgeState: () => ({ ...bridgeState }) };
