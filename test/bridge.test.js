'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { handleTikTokComment, eventClients } = require('../server');

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
