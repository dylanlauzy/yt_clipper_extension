async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.clear()
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log(changeInfo, tab)
  if(changeInfo.status == "complete" && tab.url) {
    let urlParams
    if (tab.url.includes("youtube.com/watch")) {
      urlParams = new URLSearchParams(tab.url.split("?")[1])
    }

    chrome.tabs.sendMessage(tabId, {
      type: "LINK_LOADED",
      videoId: urlParams ? urlParams.get("v") : 0
    })
  }
})

// Not working
chrome.commands.onCommand.addListener(async (command) => {
  console.log("shortcut pressed", command)
  const currentTab = await getCurrentTab()
  
  chrome.tabs.sendMessage(currentTab.id, {
    type: "EXTENSION_KEY_PRESSED"
  })
})