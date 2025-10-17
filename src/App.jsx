import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [character, setCharacter] = useState("gojo");
  const [bgImage, setBgImage] = useState("");
  const [isActive, setIsActive] = useState(false); // 👈 for glow pulse

  // ✅ Reset chat + background when character changes
  useEffect(() => {
    setMessages([]); // clear old chat

    const basePath = "/character/";

    const defaultImages = {
      gojo: `${basePath}gojo_happy.jpg`,
      levi: `${basePath}levi_calm.jpg`,
      elsa: `${basePath}elsa_kind.jpg`,
    };

    setBgImage(defaultImages[character] || `${basePath}default.jpg`);
  }, [character]);

  // ✅ Update background dynamically based on chat emotion
  useEffect(() => {
    const basePath = "/character/";

    const emotionImages = {
      gojo: {
        happy: `${basePath}gojo_happy.jpg`,
        serious: `${basePath}gojo_serious.jpg`,
        teasing: `${basePath}gojo_teasing.jpg`,
      },
      levi: {
        calm: `${basePath}levi_calm.jpg`,
        angry: `${basePath}levi_angry.jpg`,
        serious: `${basePath}levi_calm.jpg`,
      },
      elsa: {
        kind: `${basePath}elsa_kind.jpg`,
        sad: `${basePath}elsa_sad.jpg`,
        happy: `${basePath}elsa_kind.jpg`,
      },
    };

    const detectEmotion = (text) => {
      const lower = text.toLowerCase();
      if (lower.includes("haha") || lower.includes("fun") || lower.includes("lol"))
        return "teasing";
      if (lower.includes("angry") || lower.includes("mad")) return "angry";
      if (lower.includes("sad") || lower.includes("sorry")) return "sad";
      if (lower.includes("thank") || lower.includes("nice") || lower.includes("great"))
        return "happy";
      return "serious";
    };

    const currentSet = emotionImages[character];

    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1].text;
      const emotion = detectEmotion(lastMsg);
      setBgImage(currentSet[emotion] || Object.values(currentSet)[0]);
    } else {
      setBgImage(Object.values(currentSet)[0]);
    }
  }, [messages, character]);

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: "You", text: input }]);
    setInput("");
    setIsActive(true); // ✨ trigger glow pulse
    setTimeout(() => setIsActive(false), 1000); // reset glow after 1s

    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, character }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { sender: character, text: data.reply }]);
    } catch (err) {
      console.error("Chat API error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "Error", text: "⚠️ Connection failed." },
      ]);
    }
  };

  // ✅ Reset chat manually
  const handleReset = () => {
    setMessages([]);
    const basePath = "/character/";
    const defaultImages = {
      gojo: `${basePath}gojo_happy.jpg`,
      levi: `${basePath}levi_calm.jpg`,
      elsa: `${basePath}elsa_kind.jpg`,
    };
    setBgImage(defaultImages[character] || `${basePath}default.jpg`);
  };

  return (
    <div
      className="chat-container"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className={`chat-box ${character} ${isActive ? "active" : ""}`}>
        <h1 className="title">AionX</h1>

        <select
          value={character}
          onChange={(e) => setCharacter(e.target.value)}
          className="character-select"
        >
          <option value="gojo">Gojo Satoru</option>
          <option value="levi">Levi Ackerman</option>
          <option value="elsa">Elsa</option>
        </select>

        <div className="messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`message ${msg.sender === "You" ? "user" : "bot"}`}
            >
              <strong>{msg.sender}:</strong> {msg.text}
            </div>
          ))}
        </div>

        <div className="input-area">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Say something..."
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button onClick={handleSend}>Send</button>
          <button onClick={handleReset} className="reset-btn">Reset</button>
        </div>
      </div>
    </div>
  );
}

export default App;
