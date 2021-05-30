// Variables
let popupTitle = document.querySelector(".popup-title")


// Functions
async function injectScript(tab, func) {
  await chrome.scripting.executeScript({target: {tabId: tab}, function: func})
  if(func.displayName) {
    console.log("Following function injected: " + func.displayName)
  }
  else {
    console.log("No function name found")
  }
}

// async function retrievePageDetails() {
//   console.log("retrieving page details")
//   await chrome.storage.local.set({
//     "url": location.href,
//     "page_title": document.title
//   })
//   await chrome.storage.local.get(["url", "page_title"], (result) => {
//     console.log("data retrieved:\n", result)
//   })
// }

// async function initialise() {
//   let [tab] = await chrome.tabs.query({active: true, currentWindow: true
// });
//   console.log("tab info: ", tab)
//   await injectScript(tab.id, retrievePageDetails)
// }

// Functionality
// initialise()

// chrome.storage.local.get(["url", "page_title"], async (result) => {
//   popupTitle.innerHTML = await popupTitle.innerHTML.replace("Sample Text", result.page_title)
//   console.log("Title refreshed")
// })