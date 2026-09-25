import { NextResponse } from "next/server";
import ImageKit from "@imagekit/nodejs";

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
});

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // Extract filename from URL (remove query params first)
    const urlWithoutParams = url.split('?')[0];
    const filename = urlWithoutParams.split('/').pop();

    if (!filename) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    console.log(`[ImageKit] Searching for file: ${filename}`);

    // Search for the file in ImageKit
    const files = await imagekit.assets.list({
      searchQuery: `name="${filename}"`,
    });

    if (!files || files.length === 0) {
      console.log(`[ImageKit] File "${filename}" not found in media library (might already be deleted).`);
      return NextResponse.json({ success: true, message: "File not found or already deleted" });
    }

    // Delete the file using its fileId
    const firstMatch = files[0] as any;
    if (!firstMatch.fileId) {
      console.log(`[ImageKit] Failed: Found item is a folder.`);
      return NextResponse.json({ error: "Found item is a folder, not a file" }, { status: 400 });
    }
    
    console.log(`[ImageKit] Deleting fileId: ${firstMatch.fileId}`);
    await imagekit.files.delete(firstMatch.fileId);

    // After deleting the file, we must purge it from ImageKit's CDN cache 
    console.log(`[ImageKit] Purging CDN cache for: ${urlWithoutParams}`);
    await imagekit.cache.invalidation.create({
      url: urlWithoutParams
    });

    console.log(`[ImageKit] Successfully deleted and purged: ${filename}`);
    return NextResponse.json({ success: true, fileId: firstMatch.fileId });
  } catch (error: any) {
    console.error("ImageKit delete error:", error);
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}
