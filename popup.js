// バックグラウンドスクリプトにメッセージを送信して、動画のURLを取得
chrome.runtime.sendMessage({action: "getVideoUrls", tabUrl: tabUrl}, function(response) {
 // 現在のタブの情報を取得する
 chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  // 現在のタブのURLを変数に代入する
  var tabUrl = tabs[0].url;
  // バックグラウンドスクリプトにメッセージを送る
  chrome.runtime.sendMessage({action: "getVideoUrls", tabUrl: tabUrl}, function(response) {
    // 省略
  });
});

    // 動画のURLがある場合
    if (response.videoUrls.length > 0) {
   
      // 動画のURLごとにリストアイテムを作成
      for (var i = 0; i < response.videoUrls.length; i++) {
        var videoUrl = response.videoUrls[i];
   
        // リストアイテムの要素を作成
        var listItem = document.createElement("li");
   
        // ダウンロードリンクの要素を作成
        var downloadLink = document.createElement("a");
        downloadLink.href = videoUrl;
        downloadLink.textContent = videoUrl;
   
        // リストアイテムにダウンロードリンクを追加
        listItem.appendChild(downloadLink);
   
        // リストにリストアイテムを追加
        videoList.appendChild(listItem);
      }
    }
   
    // 動画のURLがない場合
    else {
   
      // リストアイテムの要素を作成
      var listItem = document.createElement("li");
   
      // エラーメッセージの要素を作成
      var errorMessage = document.createElement("p");
      errorMessage.textContent = "No videos found on this page.";
   
      // リストアイテムにエラーメッセージを追加
      listItem.appendChild(errorMessage);
   
      // リストにリストアイテムを追加
      videoList.appendChild(listItem);
    }
   });
   
   
