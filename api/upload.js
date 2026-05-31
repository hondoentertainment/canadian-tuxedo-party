import { put } from "@vercel/blob";
import { handleUpload } from "@vercel/blob/client";
import { isModerationEnabled } from "./_lib/admin.js";
import {
  ALLOWED_CONTENT_TYPES,
  MAX_UPLOAD_BYTES,
  isAllowedContentType,
  mediaTypeFor,
} from "./_lib/upload-config.js";

/** Vercel serverless request body limit (~4.5 MB). Stay under for direct uploads. */
const SERVER_MAX_BYTES = 4 * 1024 * 1024;

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

function inferContentType(file) {
  const fromFile = String(file.type || "").toLowerCase();
  if (fromFile) {
    return fromFile;
  }
  const ext = String(file.name || "")
    .split(".")
    .pop()
    ?.toLowerCase();
  return EXT_TO_TYPE[ext] || "";
}

function safeExt(file, contentType) {
  const fromName = String(file.name || "")
    .split(".")
    .pop()
    ?.toLowerCase();
  if (fromName && EXT_TO_TYPE[fromName]) {
    return fromName;
  }
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/png") return "png";
  if (contentType === "video/mp4") return "mp4";
  if (contentType === "video/quicktime") return "mov";
  if (contentType === "video/webm") return "webm";
  return "bin";
}

async function saveGalleryEntry({ id, url, name, caption, contentType }) {
  const moderated = isModerationEnabled();
  const mediaType = mediaTypeFor(contentType);
  const metadata = {
    id,
    url,
    name,
    caption,
    contentType,
    mediaType,
    uploadedAt: new Date().toISOString(),
    status: moderated ? "pending" : "approved",
  };

  await put(`gallery/${id}.json`, JSON.stringify(metadata), {
    access: "public",
    contentType: "application/json",
  });

  return {
    ...metadata,
    pending: moderated,
    message: moderated
      ? "Upload submitted for review — it will appear once approved."
      : mediaType === "video"
        ? "Video added to the gallery!"
        : "Photo added to the gallery!",
  };
}

async function handleMultipartUpload(request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const name = String(formData.get("name") || "").trim() || "Anonymous";
  const caption = String(formData.get("caption") || "").trim();

  if (!file || typeof file === "string") {
    return Response.json(
      { error: "Please choose a photo or video to upload." },
      { status: 400 }
    );
  }

  const contentType = inferContentType(file);
  if (!isAllowedContentType(contentType)) {
    return Response.json(
      { error: "Please upload a supported photo or video format." },
      { status: 400 }
    );
  }

  if (file.size > SERVER_MAX_BYTES) {
    return Response.json(
      {
        error:
          "This file is too large for a direct upload. The page will retry using a large-file upload.",
        code: "USE_CLIENT_UPLOAD",
      },
      { status: 413 }
    );
  }

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const ext = safeExt(file, contentType);
  const blob = await put(`gallery/${id}.${ext}`, file, {
    access: "public",
    contentType,
  });

  const result = await saveGalleryEntry({
    id,
    url: blob.url,
    name,
    caption,
    contentType,
  });

  return Response.json(result);
}

async function handleClientUpload(request) {
  const body = await request.json();
  const jsonResponse = await handleUpload({
    body,
    request,
    onBeforeGenerateToken: async () => ({
      allowedContentTypes: ALLOWED_CONTENT_TYPES,
      maximumSizeInBytes: MAX_UPLOAD_BYTES,
      addRandomSuffix: true,
    }),
  });

  return Response.json(jsonResponse);
}

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      return await handleMultipartUpload(request);
    }

    return await handleClientUpload(request);
  } catch (error) {
    console.error("Upload failed:", error);
    return Response.json(
      { error: error.message || "Could not start upload." },
      { status: 400 }
    );
  }
}
