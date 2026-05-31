(function (global) {
  "use strict";

  global.CTP_UPLOAD = {
    MAX_BYTES: 5 * 1024 * 1024 * 1024,
    MAX_LABEL: "5 GB",
    MULTIPART_BYTES: 100 * 1024 * 1024,
    COMPRESS_SKIP_BYTES: 50 * 1024 * 1024,
    ACCEPT:
      "image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,video/mp4,video/quicktime,video/webm,video/x-msvideo",
    HINT: "Photos or videos · up to 5 GB",
  };
})(window);
