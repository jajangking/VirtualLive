'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { handleTikTokComment, handleTikTokGift, eventClients } = require('../server');

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
