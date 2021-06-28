// Variables
let numberOfNotes = 0
let sessionOpen = 0
let channelName = ""
let videoTitle = ""

// Functions
// async function executeScript(tab, func) /* Runs js in specified chrome tab*/{
//   await chrome.scripting.executeScript({target: {tabId: tab}, function: func})
//   if(func.name) {
//     console.log("following function injected: " + func.name)
//   }
//   else {
//     console.log("invalid function / no function.name found")
//   }
// }

async function storeVideoInfo() {
  channelName = document.querySelector("#upload-info a")
  videoTitle = document.querySelector("#info-contents h1")
  let today = new Date()
  console.log("retrieving video info")

  try {
    await chrome.storage.local.set({
      "video_info": {
        "video_title": videoTitle.innerText,
        "channel_name": channelName.innerText,
        "time_saved": {
          "timezone": today.getTimezoneOffset(),
          "time": today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds(),
          "day": today.getDate(),
          "month": today.getMonth() + 1,
          "year": today.getFullYear(),
        }
      }
    })
    await chrome.storage.local.get(["video_info"], (result) => {console.log("video info stored successfully\n","data saved to storage:", result)})
  }
  catch(err) {
    alert("error: video info not stored")
  }
}

async function generatePopup() {
  await chrome.storage.local.get(["video_info"], (result) => {
    console.log("Generating popup...\n Data Retrieved:")
    console.log(result)

    let popupElem = document.createElement("div")
    popupElem.classList.add("ytclipper-popup-container")
    popupElem.innerHTML =`<div class="popup-title">${result.video_info.video_title}</div><textarea name="" class="note-input" placeholder="start typing..."></textarea><div class="footer flex-container"><div class="toolbar"><ul class="tools flex-container"><li class="tool-icon-wrap"><button class="tool-icon-button bold-icon">B</button></li><li class="tool-icon-wrap"><button class="tool-icon-button italic-icon">I</button></li><li class="tool-icon-wrap"><button class="tool-icon-button strikethrough-icon">S</button></li><li class="tool-icon-wrap"><button class="tool-icon-button code-icon">C</button></li><li class="tool-icon-wrap"><button class="tool-icon-button link-icon">L</button></li><li class="tool-icon-wrap"><button class="tool-icon-button ol-icon">1.</button></li><li class="tool-icon-wrap"><button class="tool-icon-button ul-icon">&#8226;</button></li><li class="tool-icon-wrap"><button class="tool-icon-button quote-icon">"</button></li><li class="tool-icon-wrap"><button class="tool-icon-button codeblock-icon">[]</button></li></ul></div><input type="submit" value="enter"></div>`
    document.body.appendChild(popupElem)
  })
  console.log("popup generated")
}

function toggleDisplay() {
  let popupElem = document.querySelector(".ytclipper-popup-container")
  popupElem.classList.toggle("display-none")
  console.log("toggling display-none on popup")
}
// Functionality
storeVideoInfo()
console.log(`YouTube Video Opened:\n  Channel: ${channelName.innerText}\n  Video Title: ${videoTitle.innerText}`)

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(`Message Receieved: ${message.txt}`)
  if(message.txt == "popup") {
    if (!sessionOpen) {
      generatePopup()
      sessionOpen = 1
    }
    else {
      toggleDisplay()
    }
  }
})