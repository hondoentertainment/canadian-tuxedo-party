import { put } from "@vercel/blob";
import { isModerationEnabled } from "./_lib/admin.js";
import {
  isAllowedContentType,
  mediaTypeFor,
} from "./_lib/upload-config.js";

function isBlobUrl(url) {
  try {
    const host = new URL(url).hostname;
    return host.endsWith(".public.blob.vercel-storage.com");
  } catch (error) {
    return false;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const url = String(body.url || "").trim();
    const name = String(body.name || "").trim() || "Anonymous";
    const caption = String(body.caption || "").trim();
    const contentType = String(body.contentType || "").toLowerCase();

    if (!url || !isBlobUrl(url)) {
      return Response.json({ error: "Invalid upload URL." }, { status: 400 });
    }

    if (!isAllowedContentType(contentType)) {
      return Response.json({ error: "Unsupported file type." }, { status: 400 });
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const moderated = isModerationEnabled();
    const metadata = {
      id,
      url,
      name,
      caption,
      contentType,
      mediaType: mediaTypeFor(contentType),
      uploadedAt: new Date().toISOString(),
      status: moderated ? "pending" : "approved",
    };

    await put(`gallery/${id}.json`, JSON.stringify(metadata), {
      access: "public",
      contentType: "application/json",
    });

    return Response.json({
      ...metadata,
      pending: moderated,
      message: moderated
        ? "Upload submitted for review — it will appear once approved."
        : metadata.mediaType === "video"
          ? "Video added to the gallery!"
          : "Photo added to the gallery!",
    });
  } catch (error) {
    console.error("Gallery register failed:", error);
    return Response.json({ error: "Could not save your upload. Please try again." }, { status: 500 });
  }
}
