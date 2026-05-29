import { getVoteCloseTime, isModerationEnabled, isVoteClosed } from "./_lib/admin.js";

export async function GET() {
  return Response.json({
    moderationEnabled: isModerationEnabled(),
    voteClosed: isVoteClosed(),
    voteCloseTime: getVoteCloseTime(),
  });
}
