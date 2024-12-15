"use client";

import { useState } from "react";

type Message = {
  role: "user" | "ai";
  content: string;
};

const extractUrls = (input: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g; // Matches http:// or https:// followed by non-whitespace characters
  return input.match(urlRegex) || [];
};

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hello! How can I help you today?" },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    // Add user message to the conversation
    const userMessage = { role: "user" as const, content: message };
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);
    const urls = extractUrls(message);
    const url = urls[0];

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: message, url: url }),
      });

      if (response.status === 429) {
        // Rate limit reached, redirect user to /blocked
        window.location.href = "/blocked";
        return;
      }

      const data = await response.json();
      const aiResponse = { role: "ai" as const, content: data.response };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-gray-950 font-sans text-base">
      {/* Header */}
      <div className="w-full bg-gray-800/70 border-b border-gray-700 p-4 shadow-md backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-semibold text-gray-100 tracking-wide">
            AI Chat Assistant
          </h1>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto pb-32 pt-4">
        <div className="max-w-3xl mx-auto px-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-4 ${msg.role === "ai" ? "justify-start" : "justify-end"} ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-[80%] shadow-md ${msg.role === "ai"
                  ? "bg-gray-800 border border-gray-700 text-gray-100"
                  : "bg-cyan-600 text-white"
                  }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 mb-4 items-center">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                <svg
                  className="w-5 h-5 text-gray-400 animate-spin"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 22c5.421 0 10-4.579 10-10s-4.579-10-10-10c-3.191 0-6.059 1.561-7.912 4H4.5C5.964 3.486 8.788 2 12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10c-3.212 0-6.036-1.486-7.5-4h1.588C5.941 20.439 8.809 22 12 22z" />
                </svg>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-gray-800 border border-gray-700 text-gray-100 flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 w-full bg-gray-900/80 border-t border-gray-700 p-4 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyPress={e => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="flex-1 rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-400 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="bg-cyan-600 text-white px-5 py-3 rounded-xl hover:bg-cyan-700 transition-all disabled:bg-cyan-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
            {/* <input type="text" value={`https://yourdomain.com/chat/${conversationId}`} readOnly />
            <button onClick={() => navigator.clipboard.writeText(`https://yourdomain.com/chat/${conversationId}`)}>
              Copy Link
            </button> */}

          </div>
        </div>
      </div>
    </div>
  );
}
