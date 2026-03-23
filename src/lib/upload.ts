import fs from "fs/promises";
import path from "path";

// Abstraction layer for file uploads.
// To migrate to S3, replace uploadFile/deleteFile with AWS SDK calls.

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./public/uploads";

/** Single-segment folder name under uploads; blocks path traversal. */
export function sanitizeUploadSubdir(subdir: string): string {
  const s = subdir.trim().replace(/\\/g, "/");
  if (!s || s.includes("..") || s.includes("/")) return "misc";
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(s)) return "misc";
  return s;
}

export async function ensureUploadDir(subdir = "") {
  const safe = subdir ? sanitizeUploadSubdir(subdir) : "";
  const dir = safe ? path.join(UPLOAD_DIR, safe) : UPLOAD_DIR;
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function uploadFile(
  file: File,
  subdir = "misc"
): Promise<string> {
  const safeSubdir = sanitizeUploadSubdir(subdir);
  const dir = await ensureUploadDir(safeSubdir);
  const ext = path.extname(file.name);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const filepath = path.join(dir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filepath, buffer);
  return `/uploads/${safeSubdir}/${filename}`;
}

export async function deleteFile(publicPath: string) {
  if (!publicPath) return;
  const rel = publicPath.startsWith("/uploads/")
    ? publicPath.slice("/uploads/".length)
    : publicPath;
  if (!rel.trim()) return;
  const normalized = path.normalize(rel);
  if (normalized.startsWith("..") || path.isAbsolute(normalized)) return;
  const abs = path.join(UPLOAD_DIR, normalized);
  const resolved = path.resolve(abs);
  const root = path.resolve(UPLOAD_DIR);
  if (!resolved.startsWith(root + path.sep) && resolved !== root) return;
  try {
    await fs.unlink(resolved);
  } catch {
    // ignore if file doesn't exist
  }
}
