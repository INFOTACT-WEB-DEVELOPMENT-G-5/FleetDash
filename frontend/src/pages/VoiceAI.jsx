import { useState, useRef } from "react";
import Layout from "../components/Layout/Layout";
import { aiAPI } from "../services/api";
import "./VoiceAI.css";

function VoiceAI() {
  const [command, setCommand] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef(null);

  const handleCommand = async () => {
    if (!command.trim()) return;

    const userMsg = { type: "user", text: command };
    setConversation(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await aiAPI.voiceCommand(command);
      const aiMsg = { type: "ai", text: res.data.message, data: res.data };
      setConversation(prev => [...prev, aiMsg]);
      setResponse(res.data);
    } catch (err) {
      const errMsg = { type: "ai", text: "Sorry, I couldn't process that command." };
      setConversation(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
      setCommand("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleCommand();
  };

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in your browser. Please type your command.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setCommand(transcript);
      // Auto-submit
      setTimeout(() => {
        setCommand(transcript);
        aiAPI.voiceCommand(transcript).then(res => {
          const userMsg = { type: "user", text: transcript };
          const aiMsg = { type: "ai", text: res.data.message, data: res.data };
          setConversation(prev => [...prev, userMsg, aiMsg]);
          setResponse(res.data);
        }).catch(() => {}).finally(() => setLoading(false));
      }, 500);
    };

    recognition.start();
  };

  const getResponseIcon = (type) => {
    switch (type) {
      case "vehicles": return "🚛";
      case "maintenance": return "🔧";
      case "report": return "📊";
      case "drivers": return "👤";
      case "health": return "💚";
      default: return "🤖";
    }
  };

  return (
    <Layout>
      <div className="voice-ai-page">
        <div className="voice-header">
          <div>
            <h1>🎙️ Voice AI Assistant</h1>
            <p>Ask questions about your fleet using voice or text commands</p>
          </div>
        </div>

        <div className="voice-suggestions">
          <span className="suggestion-label">Try asking:</span>
          <button className="suggestion-chip" onClick={() => { setCommand("Show offline vehicles"); }}>
            "Show offline vehicles"
          </button>
          <button className="suggestion-chip" onClick={() => { setCommand("Which vehicles need service?"); }}>
            "Which vehicles need service?"
          </button>
          <button className="suggestion-chip" onClick={() => { setCommand("Generate today's report"); }}>
            "Generate today's report"
          </button>
          <button className="suggestion-chip" onClick={() => { setCommand("Show risky drivers"); }}>
            "Show risky drivers"
          </button>
          <button className="suggestion-chip" onClick={() => { setCommand("What is fleet health?"); }}>
            "What is fleet health?"
          </button>
        </div>

        <div className="voice-conversation">
          {conversation.length === 0 && (
            <div className="voice-welcome">
              <div className="welcome-avatar">🤖</div>
              <h3>Hello! I'm your FleetDash AI Assistant</h3>
              <p>Ask me about your fleet using the microphone button or type a command below.</p>
            </div>
          )}

          {conversation.map((msg, i) => (
            <div key={i} className={`voice-message ${msg.type}`}>
              <div className="msg-avatar">
                {msg.type === "user" ? "👤" : "🤖"}
              </div>
              <div className="msg-content">
                {msg.type === "ai" && <div className="msg-icon">{getResponseIcon(msg.data?.type)}</div>}
                <div className="msg-text">{msg.text}</div>
                {msg.type === "ai" && msg.data?.data && Array.isArray(msg.data.data) && msg.data.data.length > 0 && (
                  <div className="msg-data">
                    {msg.data.data.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="msg-item">
                        {item.vehicleId || item.driver || item.name || `Item ${idx + 1}`}
                      </div>
                    ))}
                    {msg.data.data.length > 3 && <div className="msg-more">+{msg.data.data.length - 3} more</div>}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="voice-message ai">
              <div className="msg-avatar">🤖</div>
              <div className="msg-content">
                <div className="msg-thinking">
                  <span className="thinking-dot"></span>
                  <span className="thinking-dot"></span>
                  <span className="thinking-dot"></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="voice-input-bar">
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a command or click the microphone..."
            className="voice-input"
          />
          <button className={`voice-mic-btn ${isListening ? "listening" : ""}`} onClick={startListening} title="Click to speak">
            🎤
          </button>
          <button className="voice-send-btn" onClick={handleCommand} disabled={loading || !command.trim()}>
            Send
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default VoiceAI;