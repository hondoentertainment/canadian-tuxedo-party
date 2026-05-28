export function isModerationEnabled() {
  return Boolean(process.env.GALLERY_ADMIN_CODE);
}

export function verifyAdminCode(request) {
  const expected = process.env.GALLERY_ADMIN_CODE;
  if (!expected) {
    return false;
  }
  const header = request.headers.get("x-admin-code");
  const url = new URL(request.url);
  const query = url.searchParams.get("code");
  return header === expected || query === expected;
}

export function getVoteCloseTime() {
  return process.env.VOTE_CLOSE_TIME || "2026-05-30T22:00:00-07:00";
}

export function isVoteClosed() {
  return Date.now() >= new Date(getVoteCloseTime()).getTime();
}
