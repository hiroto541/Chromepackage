// content.js
// This script runs in the context of the web page and returns the video url or object

// A function to find a video element in the document
function findVideo() {
  // Get all the video elements in the document
  let videos = document.getElementsByTagName("video");
  // If there are no video elements, return null
  if (videos.length === 0) {
    return null;
  }
  // If there is only one video element, return its current source url or src object
  if (videos.length === 1) {
    return videos[0].currentSrc || videos[0].srcObject;
  }
  // If there are multiple video elements, try to find the one that is visible and playing
  for (let video of videos) {
    // Check if the video is visible and has a positive duration
    if (video.offsetParent !== null && video.duration > 0) {
      // Check if the video is playing or paused
      if (!video.paused || video.currentTime > 0) {
        // Return the current source url or src object of the video
        return video.currentSrc || video.srcObject;
      }
    }
  }
  // If no visible and playing video is found, return null
  return null;
 }

 // Return the result of the findVideo function
 findVideo();
