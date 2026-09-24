import { NextResponse } from "next/server";
import ImageKit, { toFile } from "@imagekit/nodejs";

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "/yoga-jam";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Convert Node Buffer to an ImageKit Uploadable File object
    const ikFile = await toFile(buffer, file.name);

    const result = await imagekit.files.upload({
      file: ikFile,
      fileName: file.name,
      folder: folder,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("ImageKit upload error:", error);
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}
