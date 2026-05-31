export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024 * 1024;

export const MULTIPART_THRESHOLD_BYTES = 100 * 1024 * 1024;

export const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
];

export function isAllowedContentType(type) {
  return ALLOWED_CONTENT_TYPES.includes(String(type || "").toLowerCase());
}

export function mediaTypeFor(contentType) {
  return String(contentType || "").startsWith("video/") ? "video" : "image";
}

export function maxUploadLabel() {
  return "5 GB";
}

export function allowedTypesLabel() {
  return "Photos (JPEG, PNG, WebP, GIF, HEIC) or videos (MP4, MOV, WebM)";
}
