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

  let videoData = {}
  videoData[video_id] = {
    "video_title": videoTitle.innerText,
    "channel_name": channelName.innerText,
    "time_saved": {
      "timezone": today.getTimezoneOffset(),
      "time": today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds(),
      "day": today.getDate(),
      "month": today.getMonth() + 1,
      "year": today.getFullYear(),
    },
    "notes": []
  }
  await chrome.storage.sync.set(videoData)
  await chrome.storage.sync.get([video_id], (data) => {
    console.log("video info stored successfully\n","data saved to storage:", data)
  })
}

async function togglePopup() {
  let video_id = window.location.href.match(/(\?|&)v=[^&]+/)[0].slice(3)
  let videoPlayer = document.querySelector("video.video-stream")
  let popupElem = document.querySelector(".ytclipper-popup-container")
  if (popupElem) {
    popupElem.remove()
  }
  else {
    await chrome.storage.sync.get([video_id], (data) => {
      console.log("Generating popup...\n Data Retrieved:", data)
      
      let newPopup = document.createElement("div")
      newPopup.classList.add("ytclipper-popup-container")
      newPopup.innerHTML =`<div class="popup-title">${data[video_id].video_title}</div><textarea name="" class="note-input" placeholder="start typing..."></textarea><div class="footer flex-container"><div class="toolbar"><ul class="tools flex-container"><li class="tool-icon-wrap"><button class="tool-icon-button bold-icon">B</button></li><li class="tool-icon-wrap"><button class="tool-icon-button italic-icon">I</button></li><li class="tool-icon-wrap"><button class="tool-icon-button strikethrough-icon">S</button></li><li class="tool-icon-wrap"><button class="tool-icon-button code-icon">C</button></li><li class="tool-icon-wrap"><button class="tool-icon-button link-icon">L</button></li><li class="tool-icon-wrap"><button class="tool-icon-button ol-icon">1.</button></li><li class="tool-icon-wrap"><button class="tool-icon-button ul-icon">&#8226;</button></li><li class="tool-icon-wrap"><button class="tool-icon-button quote-icon">"</button></li><li class="tool-icon-wrap"><button class="tool-icon-button codeblock-icon">[]</button></li></ul></div><button class="enter-btn">enter</button></div>`
      document.body.appendChild(newPopup)
      console.log("popup generated")
      
      let textareaElem = document.querySelector(".note-input")
      let enterBtn = document.querySelector(".enter-btn")
      enterBtn.addEventListener("click", () => {
        console.log("enter clicked")
        let noteInput = textareaElem.value
        if(noteInput != "") {
          let noteData = {}
          let regExp = /.+(?=\n+)/
          noteData.time_stamp = Math.floor(videoPlayer.currentTime)
          if(regExp.test(noteInput)) {
            noteData.header = noteInput.match(regExp)[0].trim()
            noteData.content = noteInput.replace(regExp, "").trim()
          }
          else {
            noteData.content = noteInput
          }
          data[video_id].notes.push(noteData)
          chrome.storage.sync.set(data)
          console.log("note saved:\n", noteData)
        }
      })
      textareaElem.focus()
    })
  }
}

// Listeners
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.clear()
  console.log('YouTube clipper extension installed and sync data cleared')
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