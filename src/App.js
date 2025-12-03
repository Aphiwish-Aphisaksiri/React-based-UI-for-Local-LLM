import React, { useState } from "react";
import axios from "axios";

// Set dark background for the whole page
document.body.style.background = "#121212";
document.body.style.color = "#f1f1f1";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    setMessages([...messages, userMessage]);
    setInput("");

    try {
      // Only send the last 6 messages (3 user/assistant pairs) for context
      const lastMessages = messages.slice(-6);
      // Build history array for backend
      const history = [];
      for (let i = 0; i < lastMessages.length; i += 2) {
        const userMsg = lastMessages[i];
        const assistantMsg = lastMessages[i + 1];
        if (userMsg && userMsg.role === "user") {
          history.push({
            user: userMsg.content,
            assistant: assistantMsg && assistantMsg.role === "assistant" ? assistantMsg.content : ""
          });
        }
      }
      console.log("Sending history:", history);
      const response = await axios.post("http://localhost:8000/chat", {
        prompt: input,
        history,
        session_id: "web-session-1"
      });
      console.log("API response:", response);
      let botContent = "No response from server.";
      if (response && response.data && typeof response.data.response === "string" && response.data.response.trim() !== "") {
        botContent = response.data.response;
      }
      const botMessage = { role: "assistant", content: botContent };
      setMessages(msgs => [...msgs, botMessage]);
    } catch (error) {
      console.error("API error:", error);
      let errorMsg = "Error: Could not reach server.";
      if (error.response && error.response.data) {
        errorMsg += ` (${JSON.stringify(error.response.data)})`;
      } else if (error.message) {
        errorMsg += ` (${error.message})`;
      }
      setMessages(msgs => [
        ...msgs,
        { role: "assistant", content: errorMsg }
      ]);
    }
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "40px auto",
        fontFamily: "sans-serif",
        background: "#181818",
        color: "#f1f1f1",
        borderRadius: 10,
        boxShadow: "0 2px 16px #0008",
        padding: 24
      }}
    >
      <h2 style={{ color: "#90caf9", textAlign: "center" }}>Chatbot UI</h2>
      <div
        style={{
          border: "1px solid #333",
          background: "#232323",
          padding: 20,
          minHeight: 300,
          maxHeight: 700,
          borderRadius: 8,
          overflowY: "auto",
          marginBottom: 16
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              margin: "10px 0",
              textAlign: msg.role === "user" ? "right" : "left",
              wordBreak: "break-word"
            }}
          >
            <b style={{ color: msg.role === "user" ? "#90caf9" : "#ffb74d" }}>
              {msg.role === "user" ? "You" : "Bot"}:
            </b> {msg.content}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          style={{
            width: "80%",
            padding: 8,
            minHeight: 40,
            maxHeight: 120,
            resize: "vertical",
            borderRadius: 6,
            border: "1px solid #444",
            background: "#222",
            color: "#f1f1f1",
            fontSize: 16,
            outline: "none",
            boxSizing: "border-box"
          }}
          placeholder="Type your message... (Shift+Enter for new line)"
        />
        <button
          onClick={handleSend}
          style={{
            padding: "10px 18px",
            background: "#90caf9",
            color: "#181818",
            border: "none",
            borderRadius: 6,
            fontWeight: "bold",
            fontSize: 16,
            cursor: "pointer"
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;