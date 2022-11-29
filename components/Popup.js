import React from 'react';
import { useState } from 'react';

const Popup = () => {
  const [videoInfo, updateVideoInfo] = useState({
    videoTitle: "",
    videoChannel: "",
    firstSaved: new Date(),
    notes: []
  })

  return (
    <div className="ytclipper-popup-container rounded-2xl px-4 py-2 flex flex-col gap-y-2">
      <Logo />
      <Header />
      <NoteInput />
      <Notes />
      <ExportBtn />
    </div>
  )
}