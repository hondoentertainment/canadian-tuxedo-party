import { list } from "@vercel/blob";

async function loadMetadata(metaBlob) {
  const response = await fetch(metaBlob.url);
  if (!response.ok) {
    return null;
  }
  return response.json();
}

function dedupePhotos(photos) {
  const byId = new Map();

  photos.forEach(function (photo) {
    if (!photo || !photo.id) {
      return;
    }

    const existing = byId.get(photo.id);
    if (!existing) {
      byId.set(photo.id, photo);
      return;
    }

    const existingApproved = existing.status === "approved";
    const nextApproved = photo.status === "approved";
    if (nextApproved && !existingApproved) {
      byId.set(photo.id, photo);
      return;
    }

    if (nextApproved === existingApproved) {
      const existingTime = new Date(existing.uploadedAt || 0).getTime();
      const nextTime = new Date(photo.uploadedAt || 0).getTime();
      if (nextTime >= existingTime) {
        byId.set(photo.id, photo);
      }
    }
  });

  return Array.from(byId.values());
}

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "gallery/", limit: 1000 });
    const metaBlobs = blobs.filter(function (blob) {
      return blob.pathname.endsWith(".json");
    });

    const photos = await Promise.all(metaBlobs.map(loadMetadata));
    const visible = dedupePhotos(
      photos.filter(function (photo) {
        if (!photo) {
          return false;
        }
        return photo.status !== "rejected";
      })
    );

    visible.sort(function (a, b) {
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });

    return Response.json({ photos: visible });
  } catch (error) {
    console.error("Failed to list photos:", error);
    return Response.json({ photos: [] });
  }
}
