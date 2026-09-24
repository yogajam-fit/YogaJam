import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  try {
    const token = crypto.randomUUID();
    const expire = Math.floor(Date.now() / 1000) + 60 * 30; // 30 minutes
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || "";
    
    if (!privateKey) {
      throw new Error("Missing IMAGEKIT_PRIVATE_KEY");
    }

    const signature = crypto
      .createHmac('sha1', privateKey)
      .update(token + expire)
      .digest('hex');

    return NextResponse.json({
      token,
      expire,
      signature
    });
  } catch (error: any) {
    console.error("ImageKit Auth Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

