let mainButton = document.getElementById("mainButton");
let videoNameHeader = document.getElementById("videoNameHeader");
let urlDisplay = document.getElementById("urlDisplay");

function retrievePageDetails() {
  console.log('loaded retrieve.js script')
  chrome.storage.local.set({
    "url": location.href,
    "page_title": document.title
  }, (data) => {
    console.log(data)
  })
}


mainButton.addEventListener("click", async () => {
  console.log('button clicked')
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    function: retrievePageDetails
  })

  chrome.storage.local.get(["url", "page_title"], (result) => {
    urlDisplay.innerHTML = urlDisplay.innerHTML.replace("placeholder", `<a href=${result.url}>${result.page_title}</a>`)
  })
})

