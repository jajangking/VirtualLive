(function registerAnswerGate(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.VirtualLiveAnswerGate = api;
})(globalThis, function createAnswerGateModule() {
  function createFirstAnswerGate() {
    const participants = new Set();
    return {
      accept(participantId) {
        const key = String(participantId || '').trim();
        if (!key || participants.has(key)) return false;
        participants.add(key);
        return true;
      },
      reset() { participants.clear(); },
      get size() { return participants.size; },
    };
  }
  return { createFirstAnswerGate };
});
