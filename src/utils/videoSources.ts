/**
 * Centralized utility for video source and thumbnail generation.
 * Supports Cloudinary adaptive delivery and universal fallback streams,
 * as well as generic/direct video URLs.
 */

export interface VideoSources {
  primaryUrl: string;
  fallbackUrl: string;
  thumbnailUrl?: string;
}

/**
 * Generate a Cloudinary video thumbnail/poster URL.
 * Extracts a frame at seekSeconds with auto-quality JPEG.
 */
export const getCloudinaryThumbnail = (videoUrl: string, seekSeconds = 5): string | undefined => {
  if (!videoUrl || !videoUrl.includes('res.cloudinary.com')) return undefined;
  
  const uploadIndex = videoUrl.indexOf('/upload/');
  if (uploadIndex === -1) return undefined;
  
  const baseUrl = videoUrl.substring(0, uploadIndex + 8);
  const restUrl = videoUrl.substring(uploadIndex + 8);
  const jpgUrl = restUrl.replace(/\.[^/.]+$/, ".jpg");
  
  // Add transformation: seek to seekSeconds, width 800px, auto quality
  return `${baseUrl}so_${seekSeconds},w_800,q_auto/${jpgUrl}`;
};

/**
 * Generates primary and fallback video sources from a given video URL.
 * 
 * - Primary: Cloudinary browser-adaptive format and auto quality (`f_auto,q_auto`).
 *   Delivers modern codecs (AV1, VP9, or MP4/HLS) depending on client capabilities.
 * 
 * - Fallback: Universal H.264 baseline profile MP4 container (`f_mp4,vc_h264,q_auto`).
 *   Guarantees playback compatibility across older browsers, mobile WebViews, and restrictive network proxies.
 */
export function getVideoSources(videoUrlOrItem: string | { video_url?: string; videoSrc?: string }): VideoSources {
  const url = typeof videoUrlOrItem === "string" 
    ? videoUrlOrItem 
    : (videoUrlOrItem?.video_url || videoUrlOrItem?.videoSrc || "");

  if (!url) {
    return {
      primaryUrl: "",
      fallbackUrl: "",
      thumbnailUrl: undefined,
    };
  }

  // If not a Cloudinary upload URL, return the original URL for both sources
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return {
      primaryUrl: url,
      fallbackUrl: url,
      thumbnailUrl: undefined,
    };
  }

  const uploadIndex = url.indexOf("/upload/");
  const baseUrl = url.substring(0, uploadIndex + 8); // includes '/upload/'
  const restUrl = url.substring(uploadIndex + 8);

  // Strip existing file extension to safely apply video codec / format transformations
  const restWithoutExt = restUrl.replace(/\.[^/.]+$/, "");
  const mp4RestUrl = `${restWithoutExt}.mp4`;

  // Primary source: adaptive format & quality
  const primaryUrl = restUrl.startsWith("f_auto")
    ? `${baseUrl}${restUrl}`
    : `${baseUrl}f_auto,q_auto/${mp4RestUrl}`;

  // Fallback source: strictly forced H.264 video codec in MP4 container
  const fallbackUrl = `${baseUrl}f_mp4,vc_h264,q_auto/${mp4RestUrl}`;

  return {
    primaryUrl,
    fallbackUrl,
    thumbnailUrl: getCloudinaryThumbnail(url, 5),
  };
}
