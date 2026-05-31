/**
 * Approve pending gallery metadata and register orphaned blob uploads.
 * Usage: node --env-file=.env.local scripts/refresh-gallery.js
 */
import { list, put } from "@vercel/blob";

const EXT_TO_TYPE = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
  avi: "video/x-msvideo",
};

function inferFromPath(pathname) {
  const ext = String(pathname || "")
    .split(".")
    .pop()
    ?.toLowerCase();
  return EXT_TO_TYPE[ext] || "";
}

function mediaTypeFor(contentType) {
  return String(contentType || "").startsWith("video/") ? "video" : "image";
}

function isMediaPath(pathname) {
  if (!pathname || pathname.endsWith(".json")) {
    return false;
  }
  const type = inferFromPath(pathname);
  return type.startsWith("image/") || type.startsWith("video/");
}

async function loadMetadata(metaBlob) {
  const response = await fetch(metaBlob.url);
  if (!response.ok) {
    return null;
  }
  return response.json();
}

async function listAllBlobs() {
  const all = [];
  let cursor;

  do {
    const page = await list({ cursor, limit: 1000 });
    all.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  return all;
}

async function main() {
  const blobs = await listAllBlobs();
  const metaBlobs = blobs.filter(
    (blob) => blob.pathname.startsWith("gallery/") && blob.pathname.endsWith(".json")
  );
  const mediaBlobs = blobs.filter(
    (blob) => blob.pathname.startsWith("gallery/") && isMediaPath(blob.pathname)
  );

  let approved = 0;
  let enriched = 0;
  let registered = 0;

  const referencedUrls = new Set();

  for (const metaBlob of metaBlobs) {
    const photo = await loadMetadata(metaBlob);
    if (!photo || !photo.url) {
      console.warn("Skipping unreadable metadata:", metaBlob.pathname);
      continue;
    }

    referencedUrls.add(photo.url);
    let changed = false;

    if (photo.status === "pending") {
      photo.status = "approved";
      changed = true;
      approved += 1;
    }

    if (!photo.contentType) {
      photo.contentType = inferFromPath(photo.url) || inferFromPath(metaBlob.pathname);
      if (photo.contentType) {
        changed = true;
        enriched += 1;
      }
    }

    if (!photo.mediaType && photo.contentType) {
      photo.mediaType = mediaTypeFor(photo.contentType);
      changed = true;
    }

    if (changed) {
      await put(metaBlob.pathname, JSON.stringify(photo), {
        access: "public",
        contentType: "application/json",
        addRandomSuffix: false,
      });
      console.log("Updated", metaBlob.pathname, "->", photo.status, photo.url);
    }
  }

  for (const mediaBlob of mediaBlobs) {
    if (referencedUrls.has(mediaBlob.url)) {
      continue;
    }

    const contentType = inferFromPath(mediaBlob.pathname);
    if (!contentType) {
      continue;
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const metadata = {
      id,
      url: mediaBlob.url,
      name: "Anonymous",
      caption: "",
      contentType,
      mediaType: mediaTypeFor(contentType),
      uploadedAt: mediaBlob.uploadedAt || new Date().toISOString(),
      status: "approved",
    };

    await put(`gallery/${id}.json`, JSON.stringify(metadata), {
      access: "public",
      contentType: "application/json",
    });

    referencedUrls.add(mediaBlob.url);
    registered += 1;
    console.log("Registered orphan", mediaBlob.pathname, "->", metadata.url);
  }

  console.log(
    JSON.stringify({ approved, enriched, registered, totalMedia: mediaBlobs.length, totalMeta: metaBlobs.length })
  );
}

main().catch(function (error) {
  console.error(error);
  process.exit(1);
});
