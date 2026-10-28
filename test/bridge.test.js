'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const testGroqKeyFile = path.join(os.tmpdir(), `virtuallive-groq-test-${process.pid}`);
process.env.GROQ_KEY_FILE = testGroqKeyFile;
const { server, handleTikTokComment, handleTikTokGift, handleTikTokMember, handleTikTokFollow, handleTikTokSocial, describeEdgeTtsError, isTrustedRequestOrigin, isSecureConfigRequest, validateQuizQuestionSet, groqFailureMessage, eventClients } = require('../server');

test('forwards a TikTok chat event as an SSE comment with the quiz fields', () => {
  const chunks = [];
  const client = { write: chunk => chunks.push(chunk) };
  eventClients.add(client);
  try {
    handleTikTokComment({
      common: { msgId: 'mock-event-forward-001' },
      user: { nickname: 'Quiz Viewer', id: 'user-42' },
      content: 'jawab B',
    });
    assert.equal(chunks.length, 1);
    assert.match(chunks[0], /^event: comment\ndata: /);
    const data = JSON.parse(chunks[0].split('\n')[1].slice('data: '.length));
    assert.equal(data.username, 'Quiz Viewer');
    assert.equal(data.userId, 'user-42');
    assert.equal(data.comment, 'jawab B');
    assert.equal(data.eventId, 'mock-event-forward-001');
    assert.equal(typeof data.receivedAt, 'number');
  } finally {
    eventClients.delete(client);
  }
});

test('does not forward duplicate message IDs or empty comments', () => {
  const chunks = [];
  const client = { write: chunk => chunks.push(chunk) };
  eventClients.add(client);
  try {
    const event = { common: { msgId: 'mock-event-duplicate-002' }, user: { displayId: 'viewer' }, content: 'A' };
    handleTikTokComment(event);
    handleTikTokComment(event);
    handleTikTokComment({ common: { msgId: 'mock-event-empty-003' }, content: '   ' });
    assert.equal(chunks.length, 1);
  } finally {
    eventClients.delete(client);
  }
});

test('forwards completed TikTok gift combos to the browser', () => {
  const chunks = [];
  const client = { write: chunk => chunks.push(chunk) };
  eventClients.add(client);
  try {
    handleTikTokGift({
      msgId: 'mock-gift-001',
      user: { nickname: 'Gift Giver' },
      giftId: 5655,
      giftDetails: { giftName: 'Rose', giftType: 1, diamondCount: 1 },
      repeatCount: 5,
      repeatEnd: 1,
    });
    assert.equal(chunks.length, 1);
    assert.match(chunks[0], /^event: gift\ndata: /);
    const data = JSON.parse(chunks[0].split('\n')[1].slice('data: '.length));
    assert.equal(data.username, 'Gift Giver');
    assert.equal(data.giftName, 'Rose');
    assert.equal(data.repeatCount, 5);
    assert.equal(data.diamondCount, 1);
  } finally {
    eventClients.delete(client);
  }
});

test('waits for the final event in a TikTok combo gift streak', () => {
  const chunks = [];
  const client = { write: chunk => chunks.push(chunk) };
  eventClients.add(client);
  try {
    handleTikTokGift({ msgId: 'mock-gift-streak-002', user: { nickname: 'Viewer' }, giftDetails: { giftName: 'Rose', giftType: 1 }, repeatCount: 2, repeatEnd: 0 });
    handleTikTokGift({ msgId: 'mock-gift-streak-003', user: { nickname: 'Viewer' }, giftDetails: { giftName: 'Rose', giftType: 1 }, repeatCount: 3, repeatEnd: 1 });
    assert.equal(chunks.length, 1);
  } finally {
    eventClients.delete(client);
  }
});


test('forwards TikTok member join events for host greetings', () => {
  const chunks = [];
  const client = { write: chunk => chunks.push(chunk) };
  eventClients.add(client);
  try {
    handleTikTokMember({ common: { msgId: 'mock-member-001' }, user: { nickname: 'New Viewer', id: 'viewer-17' } });
    assert.equal(chunks.length, 1);
    assert.match(chunks[0], /^event: host_event\ndata: /);
    const data = JSON.parse(chunks[0].split('\n')[1].slice('data: '.length));
    assert.equal(data.kind, 'member');
    assert.equal(data.username, 'New Viewer');
    assert.equal(data.userId, 'viewer-17');
    assert.equal(data.eventId, 'mock-member-001');
  } finally {
    eventClients.delete(client);
  }
});

test('forwards follow events and filters unrelated social activity', () => {
  const chunks = [];
  const client = { write: chunk => chunks.push(chunk) };
  eventClients.add(client);
  try {
    handleTikTokFollow({ common: { msgId: 'mock-follow-001' }, user: { uniqueId: 'follower', nickname: 'New Follower' } });
    handleTikTokSocial({ common: { msgId: 'mock-share-001' }, user: { nickname: 'Sharer' }, displayType: 'share' });
    handleTikTokSocial({ common: { msgId: 'mock-follow-001' }, user: { nickname: 'New Follower' }, displayType: 'follow' });
    assert.equal(chunks.length, 1);
    const first = JSON.parse(chunks[0].split('\n')[1].slice('data: '.length));
    assert.equal(first.kind, 'follow');
    assert.equal(first.username, 'New Follower');
  } finally {
    eventClients.delete(client);
  }
});


test('validates generated quiz batches and rejects ambiguous or duplicate choices', () => {
  const batch = [{ category: 'Geografi', question: 'Apa ibu kota Jepang?', options: ['Tokyo', 'Osaka', 'Kyoto', 'Nara'], correct: 0 }];
  assert.deepEqual(validateQuizQuestionSet({ questions: batch }, 1), batch);
  assert.throws(() => validateQuizQuestionSet({ questions: batch }, 2), /jumlah soal/);
  assert.throws(() => validateQuizQuestionSet([{ ...batch[0], options: ['Tokyo', 'Tokyo', 'Kyoto', 'Nara'] }], 1), /Format soal/);
  assert.throws(() => validateQuizQuestionSet([{ ...batch[0], question: 'apa ibu kota jepang?' } , batch[0]], 2), /duplikat/);
});

test('reports actionable Groq model, key, and quota failures', async () => {
  const originalWarn = console.warn;console.warn = () => {};
  try {
    const unauthorized = await groqFailureMessage(new Response(JSON.stringify({ error: { message: 'invalid api key' } }), { status: 401 }), 'quiz');
    assert.match(unauthorized, /API key.*401/);
    const modelError = await groqFailureMessage(new Response(JSON.stringify({ error: { message: 'model_decommissioned' } }), { status: 400 }), 'quiz');
    assert.match(modelError, /HTTP 400.*model_decommissioned/);
    const missingModel = await groqFailureMessage(new Response(JSON.stringify({ error: { message: 'model not found' } }), { status: 404 }), 'quiz');
    assert.match(missingModel, /Model Groq.*tidak ditemukan \(HTTP 404\)/);
    const quotaError = await groqFailureMessage(new Response(JSON.stringify({ error: { message: 'quota exceeded' } }), { status: 429 }), 'quiz');
    assert.match(quotaError, /kuota Groq.*429/);
  } finally { console.warn = originalWarn; }
});

test('host status endpoint reports readiness without exposing the API key', async t => {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    try { fs.unlinkSync(testGroqKeyFile); } catch { /* No saved test key. */ }
  });
  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}/api/host/status`);
  assert.equal(response.status, 200);
  const status = await response.json();
  assert.equal(typeof status.configured, 'boolean');
  assert.equal(status.textLanguage, 'id-ID');
  assert.equal(status.speech, 'edge-tts');
  assert.equal(status.voice, 'en-US-BrianMultilingualNeural');
  assert.equal(status.speechLanguage, 'multilingual-auto');
  if (!process.env.GROQ_MODEL || process.env.GROQ_MODEL === 'llama-3.1-8b-instant') assert.equal(status.model, 'openai/gpt-oss-20b');
  assert.equal(Object.hasOwn(status, 'apiKey'), false);
  if (status.keySource === 'none') {
    const unavailableGenerator = await fetch(`http://127.0.0.1:${address.port}/api/quiz/generate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ count: 1 }),
    });
    assert.equal(unavailableGenerator.status, 503);
    assert.match((await unavailableGenerator.json()).error, /Groq API belum dikonfigurasi/);
    const key = 'gsk_test_key_for_unit_test_123456';
    const saved = await fetch(`http://127.0.0.1:${address.port}/api/host/config`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ apiKey: key }),
    });
    assert.equal(saved.status, 200);
    assert.deepEqual(await saved.json(), { configured: true, keySource: 'ui' });
    const configured = await fetch(`http://127.0.0.1:${address.port}/api/host/status`).then(response => response.json());
    assert.equal(configured.configured, true);
    assert.equal(configured.keySource, 'ui');
    assert.equal(JSON.stringify(configured).includes(key), false);
    assert.equal(fs.readFileSync(testGroqKeyFile, 'utf8'), key);
    assert.equal(fs.statSync(testGroqKeyFile).mode & 0o777, 0o600);
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, options) => {
      if (String(url).startsWith('https://api.groq.com/')) {
        assert.equal(options.headers.Authorization, `Bearer ${key}`);
        const request = JSON.parse(options.body);
        const configuredModel = String(process.env.GROQ_MODEL || '').trim();
        assert.equal(request.model, !configuredModel || configuredModel === 'llama-3.1-8b-instant' ? 'openai/gpt-oss-20b' : configuredModel);
        assert.equal(request.reasoning_format, 'hidden');
        assert.equal(request.response_format.type, 'json_object');
        return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ questions: [{ category: 'Geografi', question: 'Apa ibu kota Jepang?', options: ['Tokyo', 'Osaka', 'Kyoto', 'Nara'], correct: 0 }] }) } }] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return originalFetch(url, options);
    };
    try {
      const generated = await globalThis.fetch(`http://127.0.0.1:${address.port}/api/quiz/generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ count: 1, category: 'Geografi', difficulty: 'mudah' }),
      });
      assert.equal(generated.status, 200);
      assert.deepEqual(await generated.json(), { questions: [{ category: 'Geografi', question: 'Apa ibu kota Jepang?', options: ['Tokyo', 'Osaka', 'Kyoto', 'Nara'], correct: 0 }] });
    } finally { globalThis.fetch = originalFetch; }
    const cleared = await fetch(`http://127.0.0.1:${address.port}/api/host/config`, { method: 'DELETE' });
    assert.equal(cleared.status, 200);
    assert.equal(fs.existsSync(testGroqKeyFile), false);
  }
  const rejectedSpeech = await fetch(`http://127.0.0.1:${address.port}/api/host/speech`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: '' }),
  });
  assert.equal(rejectedSpeech.status, 400);
  assert.match((await rejectedSpeech.json()).error, /1–220/);
});


test('accepts forwarded same-site origins but rejects cross-site origins', () => {
  assert.equal(isTrustedRequestOrigin({ headers: { origin: 'https://live.example', host: '127.0.0.1:3000', 'x-forwarded-host': 'live.example' } }), true);
  assert.equal(isTrustedRequestOrigin({ headers: { origin: 'https://live.example', host: '127.0.0.1:3000', 'sec-fetch-site': 'same-origin' } }), true);
  assert.equal(isTrustedRequestOrigin({ headers: { origin: 'https://attacker.example', host: 'live.example', 'sec-fetch-site': 'cross-site' } }), false);
  assert.equal(isTrustedRequestOrigin({ headers: { origin: 'not a url', host: 'live.example' } }), false);
  assert.equal(isSecureConfigRequest({ headers: { host: 'example.com', origin: 'http://example.com' }, socket: {} }), false);
  assert.equal(isSecureConfigRequest({ headers: { host: '127.0.0.1:3000' }, socket: {} }), true);
  assert.equal(isSecureConfigRequest({ headers: { host: '127.0.0.1:3000', 'x-forwarded-proto': 'https' }, socket: {} }), true);
});


test('Edge TTS errors explain network and upstream rejection cases', () => {
  const originalError = console.error;
  console.error = () => {};
  try {
    assert.match(describeEdgeTtsError(Object.assign(new Error('module missing'), { code: 'EDGE_TTS_NOT_INSTALLED' })), /install-edge-tts\.sh/);
    assert.match(describeEdgeTtsError(Object.assign(new Error('socket hang up'), { code: 'ECONNRESET' })), /koneksi keluar/);
    assert.match(describeEdgeTtsError(new Error('WebSocket closed before turn.end (code 1008)')), /Periksa voice\/bahasa/);
    assert.match(describeEdgeTtsError(new Error('Unexpected server response: 200')), /HTTP 200/);
  } finally { console.error = originalError; }
});
