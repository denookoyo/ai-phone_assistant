import React, { useState, useRef } from "react";

function App() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const recognitionRef = useRef(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = e => {
      audioChunksRef.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
      const formData = new FormData();
      formData.append("audio", blob, "recording.wav");

      const res = await fetch("https://super-guacamole-j74qr67xrj62gv9-8000.app.github.dev/assistant/", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setTranscript(data.transcription);
      setResponse(data.response);

      const audio = new Audio(`https://super-guacamole-j74qr67xrj62gv9-8000.app.github.dev${data.audio_url}`);
      audioRef.current = audio;

      audio.play();
      setIsPlaying(true);

      // Only interrupt on "assistant"
      startKeywordRecognition(() => {
        audio.pause();
        setIsPlaying(false);
        console.log("Playback interrupted by saying 'assistant'.");
      });

      audio.onended = () => {
        setIsPlaying(false);
        stopRecognition();
      };
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  const startKeywordRecognition = (onKeywordDetected) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = event => {
      const said = event.results[event.results.length - 1][0].transcript.toLowerCase();
      console.log("Heard:", said);
      if (said.includes("assistant")) {
        onKeywordDetected();
        recognition.stop();
      }
    };

    recognition.onerror = e => console.error("Speech Recognition error:", e);

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopRecognition = () => {
    recognitionRef.current?.stop();
  };

  return (
    <div>
      <h1>Phone Assistant</h1>
      <button onClick={recording ? stopRecording : startRecording}>
        {recording ? "Stop" : "Start"} Recording
      </button>
      <p><strong>You said:</strong> {transcript}</p>
      <p><strong>Assistant:</strong> {response}</p>
      {isPlaying && <p>Assistant is talking... Say "assistant" to interrupt.</p>}
    </div>
  );
}

export default App;
