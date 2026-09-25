const url = "https://res.cloudinary.com/demo/video/upload/v12345/yogajam/events/past_videos/test_video.mp4";
const urlParts = url.split('/');
const uploadIndex = urlParts.indexOf('upload');
let pathParts = urlParts.slice(uploadIndex + 1);
if (pathParts[0].startsWith('v') && !isNaN(parseInt(pathParts[0].substring(1)))) {
    pathParts.shift();
}
let publicIdWithExtension = pathParts.join('/');
const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.')) || publicIdWithExtension;
console.log("Public ID:", publicId);
console.log("Resource Type:", url.includes('/video/') ? 'video' : 'image');
