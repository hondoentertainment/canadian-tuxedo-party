import { list } from "@vercel/blob";

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "gallery/", limit: 1000 });
    const metaBlobs = blobs.filter(function (blob) {
      return blob.pathname.endsWith(".json");
    });

    const photos = await Promise.all(
      metaBlobs.map(async function (metaBlob) {
        const response = await fetch(metaBlob.url);
        if (!response.ok) {
          return null;
        }
        return response.json();
      })
    );

    const validPhotos = photos.filter(Boolean);
    validPhotos.sort(function (a, b) {
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });

    return Response.json({ photos: validPhotos });
  } catch (error) {
    console.error("Failed to list photos:", error);
    return Response.json({ photos: [] });
  }
}
