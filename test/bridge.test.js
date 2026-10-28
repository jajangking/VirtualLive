'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { server, handleTikTokComment, handleTikTokGift, handleTikTokMember, handleTikTokFollow, handleTikTokSocial, eventClients } = require('../server');

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


test('host status endpoint reports readiness without exposing the API key', async t => {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  t.after(() => new Promise(resolve => server.close(resolve)));
  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}/api/host/status`);
  assert.equal(response.status, 200);
  const status = await response.json();
  assert.equal(typeof status.configured, 'boolean');
  assert.equal(status.textLanguage, 'id-ID');
  assert.equal(status.speech, 'browser-speechSynthesis');
  assert.equal(Object.hasOwn(status, 'apiKey'), false);
});
