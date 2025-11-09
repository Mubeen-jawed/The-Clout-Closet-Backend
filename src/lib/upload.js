import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET, publicUrlForKey } from "./r2.js";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import mime from "mime-types";

export async function uploadBufferToR2({
  buffer,
  originalname,
  mimetype,
  userId,
}) {
  const ext =
    path.extname(originalname)?.slice(1) || mime.extension(mimetype) || "bin";
  // GOOD: no bucket in the key
  const key = `listings/${userId}/${Date.now()}-${uuidv4()}.${ext}`;
  // const imageUrl = `https://pub-7d9b17efdbb148d9bace0742c42a532a.r2.dev/cloutcloset-uploads/${key}`;

  // Quick sanity log — should now print your bucket name
  // console.log("Using bucket:", R2_BUCKET);

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimetype || "application/octet-stream",
    })
  );

  return { key, url: publicUrlForKey(key) };
}
