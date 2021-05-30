// Variables
let channelName = document.querySelector("#upload-info a")
let videoTitle = document.querySelector("#info-contents h1")

console.log(channelName, videoTitle)

// Functions
async function storeVideoInfo() {
  console.log("retrieving video info")

  try {
    await chrome.storage.local.set({
      "video_title": videoTitle.innerText,
      "channel_name": channelName.innerText
    })
    await chrome.storage.local.get(["video_title", "channel_name"], (result) => {
      console.log("data retrieved:\n", result)
    })
  }
  catch(err) {
    alert("error: video info not stored")
  }
}

// Functionality
console.log("YouTube video opened")

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message.txt)
  if(message.txt === "storeVideoInfo") {
    storeVideoInfo()
  }
})