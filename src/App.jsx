import { useState, useRef, useEffect } from "react";
import "./index.css";

export default function App() {
  const [caption, setCaption] = useState("");
  const [translated, setTranslated] = useState("");
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef(null);
  const [targetLang, setTargetLang] = useState("es"); // default Spanish

  // Translation using MyMemory API (English as source)
  const translateText = async (text, lang) => {
    if (!text) return;
    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
          text
        )}&langpair=en|${lang}`
      );
      const data = await res.json();
      if (data.responseData?.translatedText) {
        setTranslated(data.responseData.translatedText);
      }
    } catch (err) {
      console.error("Translation error:", err);
    }
  };

  const startTalking = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert(
        "Your browser does not support Speech Recognition. Use Chrome or Edge."
      );
      return;
    }

    setRecording(true);
    setCaption("");
    setTranslated("");

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US"; // only English input works
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setCaption(transcript);
      translateText(transcript, targetLang); // translate live
    };

    recognition.onend = () => {
      if (recording) recognition.start(); // auto-restart
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopTalking = () => {
    setRecording(false);
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  // Re-translate when targetLang changes
  useEffect(() => {
    if (caption) {
      translateText(caption, targetLang);
    }
  }, [targetLang]);

  return (
    <div id="app-container">
      <h1>🌏 AI Translator</h1>

      <div className="lang-select">
        <label>
          Translate to:
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
          >
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="hi">Hindi</option>
            <option value="zh-CN">Chinese</option>
            <option value="ko">Korean</option>
            <option value="ja">Japanese</option>
            <option value="it">Italian</option>
            <option value="ru">Russian</option>
            <option value="ar">Arabic</option>

          </select>
        </label>
      </div>

      <button
        onMouseDown={startTalking}
        onMouseUp={stopTalking}
        className={recording ? "recording" : ""}
      >
        {recording ? "Recording..." : "🎙 Hold to Talk"}
      </button>

      <div className={`box transcription-box ${recording ? "recording" : ""}`}>
        <strong>Transcription:</strong>
        <p>{caption || "..."}</p>
      </div>

      <div className={`box translation-box ${recording ? "recording" : ""}`}>
        <strong>Translation:</strong>
        <p>{translated || "..."}</p>
      </div>
    </div>
  );
}
