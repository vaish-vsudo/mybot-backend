import { useState } from "react";

export default function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const sendMessage = async () => {
    if (!message) return;

    const newChat = [...chat, { role: "user", content: message }];
    setChat(newChat);
    setMessage("");

    try {
      const res = await fetch("https://mybot-backend-1.onrender.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: message,
          history: chat,
          personality: "study"
        })
      });

      const data = await res.json();

      setChat([...newChat, { role: "assistant", content: data.answer }]);
    } catch (err) {
      setChat([...newChat, { role: "assistant", content: "Error connecting to server 😢" }]);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>MyBot 🤖</h1>

      <div style={{ minHeight: "300px", marginBottom: "20px" }}>
        {chat.map((msg, i) => (
          <div key={i}>
            <b>{msg.role}:</b> {msg.content}
          </div>
        ))}
      </div>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        style={{ width: "80%" }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
