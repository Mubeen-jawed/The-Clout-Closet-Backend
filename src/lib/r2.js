import { S3Client } from "@aws-sdk/client-s3";
import { ENV } from "../config/env.js";

export const r2 = new S3Client({
  region: "auto",
  endpoint: ENV.R2_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: ENV.R2_ACCESS_KEY_ID,
    secretAccessKey: ENV.R2_SECRET_ACCESS_KEY,
  },
});

export const R2_BUCKET = ENV.R2_BUCKET;
export const R2_ENDPOINT = ENV.R2_ENDPOINT;
export const R2_PUBLIC_BASE_URL = ENV.R2_PUBLIC_BASE_URL;

export const publicUrlForKey = (key) => {
  const base = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
  // If public base is set, don't include bucket in path
  return base
    ? `${base}/${key}`
    : `${process.env.R2_ENDPOINT.replace(/\/$/, "")}/${
        process.env.R2_BUCKET
      }/${key}`;
};
