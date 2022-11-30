// Variables
let currentVideo = "";
let currentVideoInfo = {};
let youtubeLeftControls, youtubeVideoPlayer, titleElem, channelElem;

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
      const noteBtn = document.createElement("img");
      noteBtn.src = chrome.runtime.getURL("assets/bookmark.png");
      noteBtn.className = "ytp-button " + "note-btn";
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


const editNote = () => {
  
}

const deleteNote = () => {
  
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

const generatePopup = () => {
  const documentBody = document.getElementsByTagName("body")[0];
  
  const containerElem = document.createElement("div");
  const titleElem = document.createElement("h1");
  const channelElem = document.createElement("div");
  const formElem = document.createElement("form");
  const noteInputElem = document.createElement("input");
  const submitElem = document.createElement("button");
  const submitIconElem = document.createElement("img")
  const exportElem = document.createElement("button");
  const notesContainer = document.createElement("div");
  
  containerElem.className = "ytclipper-popup-container"
  
  titleElem.className = "popup-title"
  titleElem.textContent = currentVideoInfo.videoTitle
  
  channelElem.textContent = currentVideoInfo.videoChannel
  
  noteInputElem.type = "text"
  noteInputElem.className = "note-input"
  
  submitIconElem.src = chrome.runtime.getURL("/assets/play.png")
  
  submitElem.appendChild(submitIconElem)
  
  formElem.appendChild(noteInputElem)
  formElem.appendChild(submitElem)
  formElem.addEventListener("submit", newNote)

  
  containerElem.appendChild(titleElem)
  containerElem.appendChild(channelElem)
  containerElem.appendChild(formElem)

  exportElem.textContent =  "Export Notes";
  exportElem.addEventListener("click", copyNotes);
  containerElem.appendChild(exportElem);

  notesContainer.className = "notes-container";
  for(i in currentVideoInfo.notes) {
    addNoteElement(notesContainer, currentVideoInfo.notes[i])
  }

  containerElem.appendChild(notesContainer);
  
  documentBody.appendChild(containerElem)
  noteInputElem.focus()
}

const newNote = (event) => {
  event.preventDefault()
  const notesContainer = document.getElementsByClassName("notes-container")[0];
  const timestamp = youtubeVideoPlayer.currentTime
  const noteInputElem = document.getElementsByClassName("note-input")[0]
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

  noteBodyElem.className = "note-body";
  noteBodyElem.textContent = `${getTime(note.timestamp)} - ${note.noteBody}`

  noteControlsElem.className = "note-controls";
  setBookmarkAttributes("play", onPlay, noteControlsElem);
  setBookmarkAttributes("edit", onEdit, noteControlsElem);
  setBookmarkAttributes("delete", onDelete, noteControlsElem);

  noteContainerElem.id = "note-" + note.timestamp;
  noteContainerElem.className = "note";
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
  const noteContainer = e.target.parentNode.parentNode
  const noteTimestamp = noteContainer.getAttribute("timestamp")
  const noteBody = noteContainer.firstChild;
  
  const noteEditInput = document.createElement("input");
  noteEditInput.type = "text";
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
  const controlElem = document.createElement("img");
  controlElem.src = chrome.runtime.getURL("/assets/" + src + ".png")
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