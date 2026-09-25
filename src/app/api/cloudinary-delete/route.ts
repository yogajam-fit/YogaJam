import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // Example Cloudinary URL: https://res.cloudinary.com/demo/image/upload/v12345/folder/filename.jpg
    const urlParts = url.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex === -1) {
       return NextResponse.json({ error: "Invalid Cloudinary URL" }, { status: 400 });
    }
    
    // Get everything after 'upload/'
    let pathParts = urlParts.slice(uploadIndex + 1);
    
    // Remove the version string if it exists (e.g., 'v1612345678')
    if (pathParts[0].startsWith('v') && !isNaN(parseInt(pathParts[0].substring(1)))) {
       pathParts.shift();
    }
    
    // The public_id doesn't include the file extension for Cloudinary
    let publicIdWithExtension = pathParts.join('/');
    const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.')) || publicIdWithExtension;
    
    // Determine the resource_type based on the URL
    const resourceType = url.includes('/video/') ? 'video' : 'image';

    console.log(`[Cloudinary] Deleting public_id: ${publicId}, resource_type: ${resourceType}`);
    
    // destroy automatically handles cache invalidation if invalidate: true is passed
    const result = await cloudinary.uploader.destroy(publicId, { 
      resource_type: resourceType, 
      invalidate: true 
    });
    
    console.log(`[Cloudinary] Delete result for ${publicId}:`, result);

    if (result.result !== 'ok') {
      console.warn(`[Cloudinary] Warning: File might not have been deleted. Reason: ${result.result}`);
    } else {
      console.log(`[Cloudinary] Successfully deleted and purged: ${publicId}`);
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Cloudinary delete error:", error);
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}
