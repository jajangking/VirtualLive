'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createFirstAnswerGate } = require('../answer-gate');

test('accepts one first answer per participant and resets for the next round', () => {
  const gate = createFirstAnswerGate();
  assert.equal(gate.accept('user-1'), true);
  assert.equal(gate.accept('user-1'), false);
  assert.equal(gate.accept('user-2'), true);
  assert.equal(gate.size, 2);
  gate.reset();
  assert.equal(gate.accept('user-1'), true);
  assert.equal(gate.size, 1);
});

test('ignores missing participant identifiers', () => {
  const gate = createFirstAnswerGate();
  assert.equal(gate.accept(''), false);
  assert.equal(gate.accept(null), false);
  assert.equal(gate.size, 0);
});
