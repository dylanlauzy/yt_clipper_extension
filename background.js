chrome.storage.sync.clear()
// Functions
function sendMessage(tab, message) {
  chrome.tabs.sendMessage(tab, msg = {txt: message})
}

async function executeScript(tab, script, files=0) {
// injecting script into a tab (for files, pass array of strings; for inline function, pass function)
  if(files) {
    await chrome.scripting.executeScript({
      target: {tabId: tab},
      files: script
    })
  }
  else {
    await chrome.scripting.executeScript({
      target: {tabId: tab},
      function: script
    })
  }
}

// Executable Content Functions
async function storeVideoInfo() {
  let video_id = window.location.href.match(/(\?|&)v=[^&]+/)[0].slice(3)
  let channelName = document.querySelector("#upload-info a")
  let videoTitle = document.querySelector("#info-contents h1")
  let today = new Date()
  
  console.log("retrieving video info for video id: " + video_id)

  let setObj = {}
  setObj[video_id] = {
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
  console.log("setObj:\n", setObj)
  await chrome.storage.sync.set(setObj)
  await chrome.storage.sync.get([video_id], (result) => {console.log("video info stored successfully\n","data saved to storage:", result)})
}

async function togglePopup() {
  let video_id = window.location.href.match(/(\?|&)v=[^&]+/)[0].slice(3)
  let popupElem = document.querySelector(".ytclipper-popup-container")
  if (popupElem) {
    popupElem.remove()
  }
  else {
    await chrome.storage.sync.get([video_id], (data) => {
      console.log("Generating popup...\n Data Retrieved:")
      console.log(data)
  
      let newPopup = document.createElement("div")
      newPopup.classList.add("ytclipper-popup-container")
      newPopup.innerHTML =`<div class="popup-title">${data[video_id].video_title}</div><textarea name="" class="note-input" placeholder="start typing..."></textarea><div class="footer flex-container"><div class="toolbar"><ul class="tools flex-container"><li class="tool-icon-wrap"><button class="tool-icon-button bold-icon">B</button></li><li class="tool-icon-wrap"><button class="tool-icon-button italic-icon">I</button></li><li class="tool-icon-wrap"><button class="tool-icon-button strikethrough-icon">S</button></li><li class="tool-icon-wrap"><button class="tool-icon-button code-icon">C</button></li><li class="tool-icon-wrap"><button class="tool-icon-button link-icon">L</button></li><li class="tool-icon-wrap"><button class="tool-icon-button ol-icon">1.</button></li><li class="tool-icon-wrap"><button class="tool-icon-button ul-icon">&#8226;</button></li><li class="tool-icon-wrap"><button class="tool-icon-button quote-icon">"</button></li><li class="tool-icon-wrap"><button class="tool-icon-button codeblock-icon">[]</button></li></ul></div><input type="submit" value="enter"></div>`
      document.body.appendChild(newPopup)
    })

    console.log("popup generated")
  }
}

// Listeners
chrome.runtime.onInstalled.addListener(() => {
  console.log('YouTube clipper extension installed')
})

chrome.action.onClicked.addListener(async (tab) => {
  await chrome.storage.sync.get(null, (data) => {console.log("extension button clicked\ncurrent data:", data)})
  
  let video_id = tab.url.match(/(\?|&)v=[^&]+/)[0].slice(3)
  let regExp = new RegExp("^https:\/\/www.youtube.com\/watch")
  
  if(regExp.test(tab.url)) {
    console.log("this is a YouTube video")
    chrome.storage.sync.get([video_id], async (data) => {
      if(!Object.keys(data).length) {
        console.log("this video's notes aren't in storage\n saving details...")
        sendMessage(tab.id, "save")
        await executeScript(tab.id, storeVideoInfo)
        chrome.storage.sync.get([video_id], (result) => {console.log("video info stored successfully\n","data saved to storage:", result)})
      }
      else {
        console.log(`video already saved in storage, data retrieved:\n`, data)
      }
      await executeScript(tab.id, togglePopup)
      chrome.scripting.insertCSS({
        target: {tabId: tab.id},
        files: ["./popup/style/style.css"]
      })
      console.log("generating popup")

    })
  }
  else {
    console.log("not a YouTube video")
  }
})