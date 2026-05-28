import { list, put } from "@vercel/blob";
import { isModerationEnabled, verifyAdminCode } from "./_lib/admin.js";

async function loadMetadata(metaBlob) {
  const response = await fetch(metaBlob.url);
  if (!response.ok) {
    return null;
  }
  return response.json();
}

export async function GET(request) {
  if (!isModerationEnabled()) {
    return Response.json(
      { error: "Set GALLERY_ADMIN_CODE in Vercel to enable photo moderation." },
      { status: 503 }
    );
  }

  if (!verifyAdminCode(request)) {
    return Response.json({ error: "Invalid admin code." }, { status: 401 });
  }

  try {
    const { blobs } = await list({ prefix: "gallery/", limit: 1000 });
    const metaBlobs = blobs.filter(function (blob) {
      return blob.pathname.endsWith(".json");
    });
    const photos = await Promise.all(metaBlobs.map(loadMetadata));
    const pending = photos
      .filter(function (photo) {
        return photo && photo.status === "pending";
      })
      .sort(function (a, b) {
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      });

    return Response.json({ pending });
  } catch (error) {
    console.error("Failed to list pending photos:", error);
    return Response.json({ pending: [] });
  }
}

export async function POST(request) {
  if (!isModerationEnabled()) {
    return Response.json({ error: "Moderation is not enabled." }, { status: 503 });
  }

  if (!verifyAdminCode(request)) {
    return Response.json({ error: "Invalid admin code." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const id = String(body.id || "").trim();
    const action = String(body.action || "").trim();

    if (!id || !["approve", "reject"].includes(action)) {
      return Response.json({ error: "Provide a photo id and action (approve or reject)." }, { status: 400 });
    }

    const { blobs } = await list({ prefix: `gallery/${id}.json`, limit: 1 });
    const metaBlob = blobs.find(function (blob) {
      return blob.pathname === `gallery/${id}.json`;
    });

    if (!metaBlob) {
      return Response.json({ error: "Photo not found." }, { status: 404 });
    }

    const photo = await loadMetadata(metaBlob);
    if (!photo) {
      return Response.json({ error: "Photo metadata unreadable." }, { status: 500 });
    }

    photo.status = action === "approve" ? "approved" : "rejected";
    photo.reviewedAt = new Date().toISOString();

    await put(`gallery/${id}.json`, JSON.stringify(photo), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });

    return Response.json({ ok: true, photo });
  } catch (error) {
    console.error("Gallery admin action failed:", error);
    return Response.json({ error: "Action failed." }, { status: 500 });
  }
}
