export function isModerationEnabled() {
  return false;
}

export function verifyAdminCode(request) {
  const expected = String(process.env.GALLERY_ADMIN_CODE || "").trim();
  if (!expected) {
    return false;
  }
  const header = String(request.headers.get("x-admin-code") || "").trim();
  const url = new URL(request.url);
  const query = String(url.searchParams.get("code") || "").trim();
  return header === expected || query === expected;
}

export function getVoteCloseTime() {
  return process.env.VOTE_CLOSE_TIME || "2026-05-30T21:00:00-07:00";
}

export function isVoteClosed() {
  return Date.now() >= new Date(getVoteCloseTime()).getTime();
}
