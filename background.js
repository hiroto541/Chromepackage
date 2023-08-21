
// Use this line to ensure compatibility between browsers
var browser = browser || chrome;

// A function to get the video url from a web page and download it
function downloadVideoFromTab(tab) {
 // Use the browser.scripting API to execute a content script in the tab
 browser.scripting.executeScript({
   target: { tabId: tab.id },
   files: ["content.js"]
 })
   .then((results) => {
     // The content script returns an array of results, one for each frame
     // We only care about the result from the top-level frame
     let result = results[0].result;
     // Check if the result is a valid url or a media object
     if (result && (result.startsWith("http") || result instanceof MediaStream || result instanceof MediaSource)) {
       // Use the fetch API to get the video url from the web page
       fetch(result)
         .then((response) => {
           // Check if the response is ok
           if (response.ok) {
             // Get the file name and extension from the response header
             let contentDisposition = response.headers.get("Content-Disposition");
             let fileName = contentDisposition ? contentDisposition.split("=").pop() : "video.mp4";
             let fileExt = fileName.split(".").pop() || "mp4";
             // Create a download request with the response and a filename
             let request = {
               url: result,
               filename: fileName,
               saveAs: true // Ask the user where to save the file
             };
             // Use the browser.downloads API to download the file
             browser.downloads.download(request)
               .then((downloadId) => {
                 // The download has started, show a notification with a progress bar
                 browser.notifications.create({
                   type: "progress",
                   iconUrl: "icons_icon_48.png", // パスを修正しました
                   title: "Video Downloader",
                   message: "Downloading video from " + result,
                   progress: 0
                 });
                 // Add a listener for the download progress event
                 browser.downloads.onProgress.addListener((delta) => {
                   // Update the notification with the current progress
                   browser.notifications.update({
                     progress: Math.round(delta.bytesReceived / delta.totalBytes * 100)
                   });
                 });
                 // Add a listener for the download complete event
                 browser.downloads.onChanged.addListener((downloadDelta) => {
                   // Check if the download is complete and successful
                   if (downloadDelta.state && downloadDelta.state.current === "complete" && downloadDelta.error === undefined) {
                     // Show a notification with an option to open the file
                     browser.notifications.create({
                       type: "basic",
                       iconUrl: "icons_icon_48.png", // パスを修正しました
                       title: "Video Downloader",
                       message: "Downloaded video from " + result,
                       buttons: [{
                         title: "Open file"
                       }]
                     });
                     // Add a listener for the notification button click event
                     browser.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
                       // Check if the user clicked the open file button
                       if (buttonIndex === 0) {
                         // Use the browser.downloads API to open the file
                         browser.downloads.open(downloadId);
                       }
                     });
                   } else {
                     // Something went wrong, show an error message with the reason
                     browser.notifications.create({
                       type: "basic",
                       iconUrl: "icons_icon_48.png", // パスを修正しました
                       title: "Video Downloader",
                       message: "Failed to download video from " + result + "\nReason: " + downloadDelta.error.current
                     });
                   }
                 });
               })
               .catch((error) => {
                 // Something went wrong, show an error message
                 console.error(error);
                 browser.notifications.create({
                   type: "basic",
                   iconUrl: "icons_icon_48.png", // パスを修正しました
                   title: "Video Downloader",
                   message: "Failed to download video from " + result
                 });
               });
           } else {
             // The response is not ok, show an error message with the status code
             browser.notifications.create({
               type: "basic",
               iconUrl: "icons_icon_48.png", // パスを修正しました
               title: "Video Downloader",
               message: "Failed to get video url from " + result + "\nStatus code: " + response.status
             });
           }
         })
         .catch((error) => {
           // Something went wrong, show an error message
           console.error(error);
           browser.notifications.create({
             type: "basic",
             iconUrl: "icons_icon_48.png", // パスを修正しました
             title: "Video Downloader",
             message: "Failed to get video url from " + result
           });
         });
     } else {
       // The result is not a valid url or a media object, show an error message
       browser.notifications.create({
         type: "basic",
         iconUrl: "icons_icon_48.png", // パスを修正しました
         title: "Video Downloader",
         message: "No video found on this page"
       });
     }
   })
   .catch((error) => {
     // Something went wrong, show an error message
     console.error(error);
     browser.notifications.create({
       type: "basic",
       iconUrl: "icons_icon_48.png", // パスを修正しました
       title: "Video Downloader",
       message: "Failed to execute content script on this page"
     });
   });
}

// Add a listener for the browser action click event
browser.action.onClicked.addListener(downloadVideoFromTab);

// A function to get the video urls from a web page and send them to the popup script
function getVideoUrlsFromTab(tab) {
 // Use the browser.scripting API to execute a content script in the tab
 browser.scripting.executeScript({
   target: { tabId: tab.id },
   files: ["content.js"]
 })
   .then((results) => {
     // The content script returns an array of results, one for each frame
     // We only care about the result from the top-level frame
     let result = results[0].result;
     // Check if the result is a valid url or a media object
     if (result && (result.startsWith("http") || result instanceof MediaStream || result instanceof MediaSource)) {
       // Send a message to the popup script with the ok status and the video url as an array
       return {ok: true, videoUrls: [result]};
     } else {
       // Send a message to the popup script with the error status and a message
       return {ok: false, message: "No video found on this page"};
     }
   })
   .catch((error) => {
     // Something went wrong, send a message to the popup script with the error status and a message
     console.error(error);
     return {ok: false, message: "Failed to execute content script on this page"};
   });
}

// Add a listener for the runtime message event
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
 // Check if the message action is getVideoUrls and the sender is a popup script
 if (message.action === "getVideoUrls" && sender.url.endsWith("popup.html")) {
   // Get the current tab information and call the getVideoUrlsFromTab function with it
   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
     // The getVideoUrlsFromTab function returns a promise, so we use .then() and .catch() to handle it
     getVideoUrlsFromTab(tabs[0])
       .then((response) => {
         // Send the response to the popup script
         sendResponse(response);
       })
       .catch((error) => {
         // Something went wrong, send an error message to the popup script
         console.error(error);
         sendResponse({ok: false, message: "Failed to get video urls from this page"});
       });
   });
   // Return true to indicate that the response will be sent asynchronously
   return true;
 }
});