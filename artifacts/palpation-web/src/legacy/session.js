// Demo cleanup only; real sessions must also expire and revoke on the server.
export function createSession(startedAt) {
  let lastActivity = startedAt;
  let ended = false;
  return {
    active(now) {
      if (now < lastActivity || now - lastActivity >= 300000 || now - startedAt >= 1800000) ended = true;
      return !ended;
    },
    touch(now) {
      if (!this.active(now)) return false;
      lastActivity = now;
      return true;
    },
  };
}
