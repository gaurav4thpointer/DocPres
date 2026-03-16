import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadFile } from "@/lib/upload";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const subdir = (formData.get("subdir") as string) ?? "misc";

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const path = await uploadFile(file, subdir);
    return NextResponse.json({ path });
  } catch (err) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
