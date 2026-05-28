import { list, put } from "@vercel/blob";
import { verifyAdminCode } from "./_lib/admin.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const dates = Array.isArray(body.dates) ? body.dates.map(String) : [];
    const feedback = String(body.feedback || "").trim();

    if (dates.length === 0) {
      return Response.json({ error: "Please pick at least one date." }, { status: 400 });
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const entry = {
      id,
      name: name || "Anonymous",
      email,
      dates,
      feedback,
      submittedAt: new Date().toISOString(),
    };

    await put(`poll/${id}.json`, JSON.stringify(entry), {
      access: "public",
      contentType: "application/json",
    });

    return Response.json({ ok: true, message: "Thanks — your poll response was saved!" });
  } catch (error) {
    console.error("Poll submission failed:", error);
    return Response.json({ error: "Could not save your response. Please try again." }, { status: 500 });
  }
}

export async function GET(request) {
  const url = new URL(request.url);
  if (url.searchParams.get("admin") !== "1") {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  if (!verifyAdminCode(request)) {
    return Response.json({ error: "Invalid admin code." }, { status: 401 });
  }

  try {
    const { blobs } = await list({ prefix: "poll/", limit: 1000 });
    const entries = await Promise.all(
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

    const valid = entries.filter(Boolean);
    valid.sort(function (a, b) {
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });

    const dateCounts = {};
    valid.forEach(function (entry) {
      entry.dates.forEach(function (date) {
        dateCounts[date] = (dateCounts[date] || 0) + 1;
      });
    });

    const rankedDates = Object.entries(dateCounts)
      .map(function (pair) {
        return { date: pair[0], count: pair[1] };
      })
      .sort(function (a, b) {
        return b.count - a.count || a.date.localeCompare(b.date);
      });

    return Response.json({ entries: valid, dateCounts, rankedDates, totalResponses: valid.length });
  } catch (error) {
    console.error("Poll results failed:", error);
    return Response.json({ entries: [], dateCounts: {}, rankedDates: [], totalResponses: 0 });
  }
}
