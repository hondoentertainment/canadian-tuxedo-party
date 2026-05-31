import { handleUpload } from "@vercel/blob/client";
import {
  ALLOWED_CONTENT_TYPES,
  MAX_UPLOAD_BYTES,
} from "./_lib/upload-config.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_CONTENT_TYPES,
        maximumSizeInBytes: MAX_UPLOAD_BYTES,
      }),
    });

    return Response.json(jsonResponse);
  } catch (error) {
    console.error("Upload token failed:", error);
    return Response.json(
      { error: error.message || "Could not start upload." },
      { status: 400 }
    );
  }
}
