let mainButton = document.getElementById("mainButton");
let videoNameHeader = document.getElementById("videoNameHeader");
let urlDisplay = document.getElementById("urlDisplay");

async function retrievePageDetails() {
  console.log("retrieving page details")
  await chrome.storage.local.set({
    "url": location.href,
    "page_title": document.title
  }, (data) => {
    console.log(data)
  })
}

async function injectScript(tab, func) {
  await chrome.scripting.executeScript({
    target: {tabId: tab},
    function: func
  })
}

mainButton.addEventListener("click", async () => {
  console.log('button clicked')
  let [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  await injectScript(tab=tab.id, func=retrievePageDetails)

  chrome.storage.local.get(["url", "page_title"], (result) => {
    urlDisplay.innerHTML = urlDisplay.innerHTML.replace("placeholder", `<a target="_blank" href=${result.url}>${result.page_title}</a>`)
  })
})

