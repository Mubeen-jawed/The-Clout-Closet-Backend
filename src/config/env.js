import dotenv from "dotenv";
dotenv.config(); // loads from project root .env

function must(name) {
  const v = process.env[name];
  if (!v) throw new Error(`[ENV] Missing ${name}`);
  return v;
}

export const ENV = {
  R2_ENDPOINT: must("R2_ENDPOINT"),
  R2_ACCESS_KEY_ID: must("R2_ACCESS_KEY_ID"),
  R2_SECRET_ACCESS_KEY: must("R2_SECRET_ACCESS_KEY"),
  R2_BUCKET: must("R2_BUCKET"),
  R2_PUBLIC_BASE_URL: process.env.R2_PUBLIC_BASE_URL || "",
};
