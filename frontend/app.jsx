import React, { useState } from "react";

function App() {
  const [recording, setRecording] = useState(false);
  const [response, setResponse] = useState("");
  const [transcript, setTranscript] = useState("");

  let mediaRecorder;
  let audioChunks = [];

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();
    audioChunks = [];

    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.onstop = async () => {
      const blob = new Blob(audioChunks, { type: 'audio/wav' });
      const formData = new FormData();
      formData.append('audio', blob, 'recording.wav');

      const res = await fetch("http://localhost:8000/assistant/", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setTranscript(data.transcription);
      setResponse(data.response);

      const audio = new Audio(`http://localhost:8000${data.audio_url}`);
      audio.play();
    };

    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.stop();
    setRecording(false);
  };

  return (
    <div>
      <h1>Phone Assistant</h1>
      <button onClick={recording ? stopRecording : startRecording}>
        {recording ? "Stop" : "Start"} Recording
      </button>
      <p><strong>You said:</strong> {transcript}</p>
      <p><strong>Assistant:</strong> {response}</p>
    </div>
  );
}

export default App;
