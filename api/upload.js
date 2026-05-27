import { put } from "@vercel/blob";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const name = String(formData.get("name") || "").trim() || "Anonymous";
    const caption = String(formData.get("caption") || "").trim();

    if (!file || typeof file === "string") {
      return Response.json({ error: "Please choose a photo to upload." }, { status: 400 });
    }

    if (!ALLOWED.has(file.type)) {
      return Response.json(
        { error: "Please upload a JPEG, PNG, WebP, or GIF image." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return Response.json({ error: "Photo must be 10 MB or smaller." }, { status: 400 });
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const imagePath = `gallery/${id}.${ext}`;

    const imageBlob = await put(imagePath, file, {
      access: "public",
      contentType: file.type,
    });

    const metadata = {
      id,
      url: imageBlob.url,
      name,
      caption,
      uploadedAt: new Date().toISOString(),
    };

    await put(`gallery/${id}.json`, JSON.stringify(metadata), {
      access: "public",
      contentType: "application/json",
    });

    return Response.json(metadata);
  } catch (error) {
    console.error("Upload failed:", error);
    return Response.json(
      { error: "Upload failed. Make sure Vercel Blob storage is connected." },
      { status: 500 }
    );
  }
}
