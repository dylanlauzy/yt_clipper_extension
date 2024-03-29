// Variables 
let currentVideo = "";
let currentVideoInfo = {};
let youtubeLeftControls, youtubeVideoPlayer, titleElem, channelElem, noteInputElem;

// Constants
const iconData = {
  "play": {
    html: `<svg class="fill-green-500 w-5 h-5 cursor-pointer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path class="pointer-events-none" d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>`,
  },
  "edit": {
    html: `<svg class="fill-blue-500 w-5 h-5 cursor-pointer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path class="pointer-events-none" d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z"/></svg>`,
  },
  "delete": {
    html: `<svg class="fill-red-500 w-5 h-5 cursor-pointer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path class="pointer-events-none" d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>`,
  }
}

// Message Responses
chrome.runtime.onMessage.addListener((obj, sender, response) => {
  const {type, videoId} = obj;

  if(type === "LINK_LOADED") {
    console.log("link loaded")
    const popupExists = document.getElementsByClassName("ytclipper-popup-container")[0]
    
    if (popupExists) {
      // prevents popup remaining when navigating between YouTube videos
      popupExists.remove()
    }

    if (videoId) {
      currentVideo = videoId
      videoLoaded()
    }
  }

  if(type === "EXTENSION_KEY_PRESSED") {
    togglePopup()
  }
})

// Handlers

const videoLoaded = async () => {
  const noteBtnExists = document.getElementsByClassName("note-btn")[0];

  if (!noteBtnExists) {
      const noteBtn = document.createElement("button");
      noteBtn.innerHTML = `<svg class="w-5 m0 m-auto fill-zinc-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H288V368c0-26.5 21.5-48 48-48H448V96c0-35.3-28.7-64-64-64H64zM448 352H402.7 336c-8.8 0-16 7.2-16 16v66.7V480l32-32 64-64 32-32z"/></svg>`
      noteBtn.className = "ytp-button note-btn flex";
      noteBtn.title = "click to start taking notes";

      youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
      youtubeVideoPlayer = document.getElementsByClassName("video-stream")[0];

      youtubeLeftControls.appendChild(noteBtn);

      noteBtn.addEventListener("click", togglePopup);
  }
}

const fetchVideoData = async () => {
  titleElem = document.querySelector("#info-contents h1 yt-formatted-string")
  channelElem = document.querySelector("#channel-name a")

  return new Promise((resolve) => {
    chrome.storage.sync.get([currentVideo], (obj) => {
        resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]): {
          videoTitle: titleElem.textContent,
          videoChannel: channelElem.textContent,
          firstSaved: new Date(),
          notes: []
        })
    })
  })
}

const togglePopup = async () => {
  currentVideoInfo = await fetchVideoData()
  console.log(currentVideoInfo)
  
  const popupExists = document.getElementsByClassName("ytclipper-popup-container")[0]
  
  if (popupExists) {
    console.log("removing popup")
    popupExists.remove()
  } else {
    console.log("generating popup...")
    generatePopup()
  }
}

const generateLogoElem = () => {
  const logoContainer = document.createElement("div");
  logoContainer.className = "logo flex gap-x-1"
  logoContainer.innerHTML = `<svg class="w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"/></svg>
  <div class="text-sm font-semibold">clippit</div>`
  return logoContainer
}

const generateTitleElem = (title, channel) => {
  const titleContainer = document.createElement("div");
  titleContainer.className = "rounded-2xl bg-slate-200 px-4 py-2";
  titleContainer.innerHTML = `
  <div class="flex gap-x-4">
    <div class="flex justify-center align-center w-14 h-11 self-center bg-emerald-100 rounded-xl">
      <svg class="w-6 fill-emerald-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M0 128C0 92.7 28.7 64 64 64H320c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128zM559.1 99.8c10.4 5.6 16.9 16.4 16.9 28.2V384c0 11.8-6.5 22.6-16.9 28.2s-23 5-32.9-1.6l-96-64L416 337.1V320 192 174.9l14.2-9.5 96-64c9.8-6.5 22.4-7.2 32.9-1.6z"/></svg>
    </div>
    <div>
      <h1 class="text-xl font-bold">${channel}</h1>
      <h2 class="text-sm font-medium">${title}</h2>
    </div>
  </div>`

  return titleContainer
}

const generateFormElem = () => {
  const formElem = document.createElement("form");
  formElem.className = "flex h-12 gap-x-2"
  formElem.innerHTML = `
    <textarea class="note-input border-2 grow resize-none"></textarea>
    <button>
      <div class="flex justify-center align-center w-12 h-12 rounded-xl bg-blue-100">
        <svg class="fill-blue-400 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M0 48V487.7C0 501.1 10.9 512 24.3 512c5 0 9.9-1.5 14-4.4L192 400 345.7 507.6c4.1 2.9 9 4.4 14 4.4c13.4 0 24.3-10.9 24.3-24.3V48c0-26.5-21.5-48-48-48H48C21.5 0 0 21.5 0 48z"/></svg>
      </div>
    </button>`
  formElem.addEventListener("submit", newNote)
  return formElem
}

const generateExportButton = () => {
  const exportElem = document.createElement("button");
  exportElem.className = "bg-purple-400 text-white rounded-2xl py-2 text-sm font-medium";
  exportElem.textContent =  "Export Notes";
  exportElem.addEventListener("click", copyNotes);
  return exportElem;
}

const generatePopup = () => {
  const documentBody = document.getElementsByTagName("body")[0];
  
  const containerElem = document.createElement("div");
  const notesContainer = document.createElement("div");
  
  containerElem.className = "ytclipper-popup-container rounded-2xl px-4 py-2 flex flex-col gap-y-2"
  containerElem.appendChild(generateLogoElem());
  containerElem.appendChild(generateTitleElem(currentVideoInfo.videoTitle, currentVideoInfo.videoChannel));
  containerElem.appendChild(generateFormElem());

  notesContainer.className = "notes-container max-h-20 overflow-y-scroll flex flex-col gap-y-2";
  for(i in currentVideoInfo.notes) {
    addNoteElement(notesContainer, currentVideoInfo.notes[i])
  }
  containerElem.appendChild(notesContainer);
  
  containerElem.appendChild(generateExportButton());
  
  documentBody.appendChild(containerElem)
  noteInputElem = document.getElementsByClassName("note-input")[0]
  noteInputElem.focus()
}

const newNote = (event) => {
  event.preventDefault()
  const notesContainer = document.getElementsByClassName("notes-container")[0];
  const timestamp = youtubeVideoPlayer.currentTime
  const newNote =  newNoteObj(timestamp, noteInputElem.value, new Date())

  saveNote(newNote)
  noteInputElem.value = ""
  addNoteElement(notesContainer, newNote)
}

const saveNote = (noteObj) => {
  currentVideoInfo["notes"] = [...currentVideoInfo["notes"], noteObj]
  chrome.storage.sync.set({[currentVideo]: JSON.stringify(currentVideoInfo)})
}

const addNoteElement = (parentElem, note) => {
  const noteContainerElem = document.createElement("div");
  const noteBodyElem = document.createElement("div");
  const noteControlsElem = document.createElement("div");

  noteBodyElem.className = "note-body flex-auto";
  noteBodyElem.textContent = `${getTime(note.timestamp)} - ${note.noteBody}`

  noteControlsElem.className = "flex gap-x-1 items-center justify-self-end";
  setBookmarkAttributes("play", onPlay, noteControlsElem);
  setBookmarkAttributes("edit", onEdit, noteControlsElem);
  setBookmarkAttributes("delete", onDelete, noteControlsElem);

  noteContainerElem.id = "note-" + note.timestamp;
  noteContainerElem.className = "flex gap-x-1 flex-row bg-slate-100 px-4 py-2 rounded-2xl w-full";
  noteContainerElem.setAttribute("timestamp", note.timestamp);
  
  noteContainerElem.appendChild(noteBodyElem);
  noteContainerElem.appendChild(noteControlsElem);
  parentElem.appendChild(noteContainerElem);
}

const newNoteObj = (timestamp, noteBody, firstCreated) => {
  return {
    timestamp: timestamp,
    noteBody: noteBody, 
    firstCreated: firstCreated
  }
}

const onPlay = async e => {
  youtubeVideoPlayer.currentTime = e.target.parentNode.parentNode.getAttribute("timestamp")
};

const onEdit = async e => {
  const noteContainer = e.target.parentNode.parentNode;
  const noteTimestamp = noteContainer.getAttribute("timestamp")
  const noteBody = noteContainer.firstChild;
  
  const noteEditInput = document.createElement("input");
  noteEditInput.type = "text";
  noteEditInput.className = "flex-auto"
  noteEditInput.value = noteBody.textContent.substring(noteBody.textContent.indexOf("-") + 2)

  noteBody.style.display = "none";
  noteContainer.insertBefore(noteEditInput, noteBody);

  noteEditInput.focus();
  noteEditInput.select();
  noteEditInput.addEventListener('focusout', (e) => {
    let replaceIndex =  currentVideoInfo["notes"].findIndex((elem) => elem.timestamp == noteTimestamp);
    currentVideoInfo["notes"][replaceIndex]["noteBody"] = noteEditInput.value;
    chrome.storage.sync.set({[currentVideo]: JSON.stringify(currentVideoInfo)});

    noteBody.textContent = `${getTime(noteTimestamp)} - ${noteEditInput.value}`
    noteEditInput.remove();
    noteBody.style.display = "block";
  })
}

const onDelete = async e => {
  const noteToDelete = e.target.parentNode.parentNode
  const noteTimestamp = noteToDelete.getAttribute("timestamp")
  noteToDelete.remove()

  currentVideoInfo["notes"] = currentVideoInfo["notes"].filter((note) => note.timestamp != noteTimestamp)
  chrome.storage.sync.set({[currentVideo]: JSON.stringify(currentVideoInfo)})
};

const setBookmarkAttributes =  (src, eventListener, controlParentElem) => {
  let controlElem = document.createElement("div");
  controlElem.innerHTML = iconData[src].html;
  controlElem = controlElem.firstChild
  controlElem.title = src;
  controlElem.addEventListener("click", eventListener);
  controlParentElem.appendChild(controlElem);
};

const getTime = (seconds) => {
  let date = new Date(0);
  date.setSeconds(seconds);
  
  return seconds >= 3600 ? date.toISOString().substring(11, 19) : date.toISOString().substring(14, 19);
}

const copyNotes = () => {
  let outputString = "";

  for (i in currentVideoInfo.notes) {
    outputString = outputString.concat(formatNote(currentVideoInfo.notes[i]) + "\n\n");
  }

  console.log("copied notes to clipboard:\n" + outputString);

  navigator.clipboard.writeText(outputString);
}

const formatNote = (noteObj) => {
  let timestamp = noteObj.timestamp;
  let noteContent = noteObj.noteBody;
  return `${getTime(timestamp)} ${noteContent}`
}