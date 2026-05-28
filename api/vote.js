import { list, put } from "@vercel/blob";

function normalizeName(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "votes/", limit: 1000 });
    const votes = await Promise.all(
      blobs
        .filter(function (blob) {
          return blob.pathname.endsWith(".json");
        })
        .map(async function (blob) {
          const response = await fetch(blob.url);
          if (!response.ok) {
            return null;
          }
          return response.json();
        })
    );

    const valid = votes.filter(Boolean);
    const tally = {};

    valid.forEach(function (vote) {
      const nominee = vote.nominee;
      if (!nominee) {
        return;
      }
      if (!tally[nominee]) {
        tally[nominee] = { nominee, count: 0 };
      }
      tally[nominee].count += 1;
    });

    const results = Object.values(tally).sort(function (a, b) {
      return b.count - a.count || a.nominee.localeCompare(b.nominee);
    });

    return Response.json({ results, totalVotes: valid.length });
  } catch (error) {
    console.error("Vote results failed:", error);
    return Response.json({ results: [], totalVotes: 0 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const voter = normalizeName(body.voter);
    const nominee = normalizeName(body.nominee);

    if (!voter) {
      return Response.json({ error: "Please enter your name." }, { status: 400 });
    }

    if (!nominee) {
      return Response.json({ error: "Please enter who you're voting for." }, { status: 400 });
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const vote = {
      id,
      voter,
      nominee,
      votedAt: new Date().toISOString(),
    };

    await put(`votes/${id}.json`, JSON.stringify(vote), {
      access: "public",
      contentType: "application/json",
    });

    return Response.json({ ok: true, message: "Vote recorded — thanks!" });
  } catch (error) {
    console.error("Vote submission failed:", error);
    return Response.json({ error: "Could not record your vote. Please try again." }, { status: 500 });
  }
}
