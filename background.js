// Listeners
chrome.runtime.onInstalled.addListener(() => {
  console.log('YouTube clipper extension installed')
})

chrome.action.onClicked.addListener((tab) => {
  console.log("extension button clicked")
  chrome.tabs.sendMessage(tab.id, msg = {txt: "popup"})
})