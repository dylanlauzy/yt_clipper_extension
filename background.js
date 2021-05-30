chrome.runtime.onInstalled.addListener(() => {
  console.log('YouTube clipper extension installed')
})

chrome.action.onClicked.addListener((tab) => {
  console.log("button clicked")
  chrome.tabs.sendMessage(tab.id, msg = {
    "txt": "storeVideoInfo"
  })
})

console.log("hi")