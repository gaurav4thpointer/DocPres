import fs from "fs/promises";
import path from "path";

// Abstraction layer for file uploads.
// To migrate to S3, replace uploadFile/deleteFile with AWS SDK calls.

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./public/uploads";

export async function ensureUploadDir(subdir = "") {
  const dir = subdir ? path.join(UPLOAD_DIR, subdir) : UPLOAD_DIR;
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function uploadFile(
  file: File,
  subdir = "misc"
): Promise<string> {
  const dir = await ensureUploadDir(subdir);
  const ext = path.extname(file.name);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const filepath = path.join(dir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filepath, buffer);
  return `/uploads/${subdir}/${filename}`;
}

export async function deleteFile(publicPath: string) {
  if (!publicPath) return;
  const rel = publicPath.startsWith("/uploads/")
    ? publicPath.slice("/uploads/".length)
    : publicPath;
  const abs = path.join(UPLOAD_DIR, rel);
  try {
    await fs.unlink(abs);
  } catch {
    // ignore if file doesn't exist
  }
}
