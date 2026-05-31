/**
 * Remove gallery entries by id (metadata + media blobs).
 * Usage: node --env-file=.env.local scripts/remove-gallery-entries.js <id> [id...]
 */
import { del, list } from "@vercel/blob";

async function loadMetadata(metaBlob) {
  const response = await fetch(metaBlob.url);
  if (!response.ok) {
    return null;
  }
  return response.json();
}

async function removeIds(ids) {
  const idSet = new Set(ids);
  const { blobs } = await list({ prefix: "gallery/", limit: 1000 });
  const toDelete = [];

  for (const blob of blobs) {
    if (!blob.pathname.startsWith("gallery/")) {
      continue;
    }

    if (blob.pathname.endsWith(".json")) {
      const photo = await loadMetadata(blob);
      if (photo && idSet.has(photo.id)) {
        toDelete.push(blob.url);
        if (photo.url) {
          toDelete.push(photo.url);
        }
      }
      continue;
    }

    for (const id of ids) {
      if (blob.pathname.includes(id)) {
        toDelete.push(blob.url);
      }
    }
  }

  const unique = [...new Set(toDelete)];
  if (!unique.length) {
    console.log("Nothing to delete for ids:", ids.join(", "));
    return;
  }

  await del(unique);
  console.log("Deleted", unique.length, "blob(s) for ids:", ids.join(", "));
}

const ids = process.argv.slice(2);
if (!ids.length) {
  console.error("Usage: node --env-file=.env.local scripts/remove-gallery-entries.js <id> [id...]");
  process.exit(1);
}

removeIds(ids).catch(function (error) {
  console.error(error);
  process.exit(1);
});
