// frontend/src/App.tsx
import { useState, useEffect, useRef } from 'react';

type Role = "user" | "assistant";

type Message = {
  role: Role;
  content: string;
};

function compareStrings(a: string, b: string): number {
  const tokenize = (str: string) =>
    str.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(" ").filter(Boolean);

  const tokensA = tokenize(a);
  const tokensB = tokenize(b);

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  const intersection = [...setA].filter(word => setB.has(word));
  const totalWords = new Set([...tokensA, ...tokensB]).size;

  return totalWords === 0 ? 0 : intersection.length / totalWords;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const pitchProfileRef = useRef<number[]>([]);
  const baselinePitchRef = useRef<number | null>(null);
  const isSpeakingRef = useRef(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognitionRef.current = recognition;

    recognition.onresult = async (event: any) => {
      const result = event.results[event.resultIndex];
      const transcript = result[0].transcript.trim();

      if (isSpeakingRef.current) {
        window.speechSynthesis.cancel();
        isSpeakingRef.current = false;
        if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
      }

      if (result.isFinal && transcript !== "") {
        if (!verifySpeakerMatch()) {
          console.log("Speaker does not match initial profile. Ignoring.");
          return;
        }

        const lastAssistantMessage = messages.filter(m => m.role === "assistant").at(-1)?.content ?? "";
        const similarity = compareStrings(transcript, lastAssistantMessage);
        if (similarity > 0.8) {
          console.log("Ignored: user input is too similar to last assistant response.");
          return;
        }

        const lastUserMessage = messages.filter(m => m.role === "user").at(-1)?.content;
        if (transcript === lastUserMessage) {
          console.log("Duplicate input ignored.");
          return;
        }

        const userMsg: Message = { role: "user", content: transcript };
        setMessages(prev => [...prev, userMsg]);

        if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = setTimeout(() => {
          loadAIResponse([...messages, userMsg]);
        }, 3000);
      }
    };

    recognition.onerror = (e: any) => {
      console.error("Speech recognition error:", e);
      setIsListening(false);
    };

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    setupVoiceAnalyzer();
  }, [messages]);

  const setupVoiceAnalyzer = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    source.connect(analyser);
    analyser.fftSize = 2048;
    const bufferLength = analyser.fftSize;
    const dataArray = new Float32Array(bufferLength);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    sourceRef.current = source;

    const capturePitch = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getFloatTimeDomainData(dataArray);
      const rms = Math.sqrt(dataArray.reduce((sum, v) => sum + v * v, 0) / bufferLength);
      pitchProfileRef.current.push(rms);
      if (pitchProfileRef.current.length === 20 && baselinePitchRef.current === null) {
        baselinePitchRef.current = pitchProfileRef.current.reduce((a, b) => a + b) / pitchProfileRef.current.length;
        console.log("Baseline pitch locked at:", baselinePitchRef.current);
      }
      requestAnimationFrame(capturePitch);
    };
    capturePitch();
  };

  const verifySpeakerMatch = () => {
    if (!analyserRef.current || baselinePitchRef.current === null) return true;
    const bufferLength = analyserRef.current.fftSize;
    const dataArray = new Float32Array(bufferLength);
    analyserRef.current.getFloatTimeDomainData(dataArray);
    const rms = Math.sqrt(dataArray.reduce((sum, v) => sum + v * v, 0) / bufferLength);
    return Math.abs(rms - baselinePitchRef.current) < 0.02;
  };

  const loadAIResponse = async (chat: Message[]) => {
    if (isSpeakingRef.current) window.speechSynthesis.cancel();

    const lastUser = chat[chat.length - 1];
    if (!lastUser.content.trim()) return;

    const res = await fetch("https://super-guacamole-j74qr67xrj62gv9-8000.app.github.dev/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: lastUser.content })
    });

    const data = await res.json();
    const aiMsg: Message = { role: "assistant", content: data.response };
    setMessages(prev => [...prev, aiMsg]);

    const utterance = new SpeechSynthesisUtterance(data.response);
    utterance.lang = "en-US";
    isSpeakingRef.current = true;

    if (isListening) recognitionRef.current?.stop();

    utterance.onend = () => {
      isSpeakingRef.current = false;
      recognitionRef.current?.start();
    };

    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      if (isSpeakingRef.current) window.speechSynthesis.cancel();
      recognition.start();
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🎙️ Speaker-Locked Conversational AI</h1>
      <button onClick={toggleListening}>
        {isListening ? "🛑 Stop" : "🎤 Start Talking"}
      </button>
      <div style={{ marginTop: "2rem" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: "1rem", color: msg.role === "user" ? "#000" : "#0077cc" }}>
            <strong>{msg.role === "user" ? "You" : "Assistant"}:</strong> {msg.content}
          </div>
        ))}
      </div>
    </div>
  );
}