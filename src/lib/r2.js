// src/lib/r2.js
import { S3Client } from "@aws-sdk/client-s3";

export const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT, // e.g. https://<accountid>.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * If you've mapped a custom/public domain (recommended), set:
 * R2_PUBLIC_BASE_URL=https://cdn.yourdomain.com
 * Otherwise you can use the R2 public bucket URL pattern if enabled.
 */
export const R2_BUCKET = process.env.R2_BUCKET;
export const publicUrlForKey = (key) =>
  `${process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "")}/${key}`;
