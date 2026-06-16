"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AIChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: "ai", content: "Hello Doctor. I am your MedConnect AI Clinical Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to get AI response");

      setMessages(prev => [...prev, { role: "ai", content: data.response }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "ai", content: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = (index: number) => {
    setMessages(prev => prev.filter((_, i) => i !== index));
    setActiveMenu(null);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    setActiveMenu(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center">
          <button
            onClick={() => router.push("/ai")}
            className="mr-4 text-gray-500 hover:text-indigo-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mr-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">MedConnect AI</h2>
              <span className="text-xs text-green-500 font-medium flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span> Online
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            if (confirm("Are you sure you want to delete this entire chat?")) {
              setMessages([{ role: "ai", content: "Hello Doctor. I am your MedConnect AI Clinical Assistant. How can I help you today?" }]);
            }
          }}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition"
          title="Delete Chat"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} group relative`}>
              {msg.role === "ai" && (
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center mr-2 flex-shrink-0 mt-auto">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
              )}

              <div className={`flex flex-col relative ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div 
                  className={`px-5 py-3 rounded-2xl max-w-full relative ${
                    msg.role === "user" 
                      ? 'bg-gray-800 text-white rounded-br-none' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap pr-6">{msg.content}</p>
                </div>
                
                {/* 3 Dots Menu Button */}
                <button
                  onClick={() => setActiveMenu(activeMenu === index ? null : index)}
                  className={`absolute top-1 bg-white rounded-full p-1 shadow-sm border border-gray-100 text-gray-400 hover:text-gray-700 transition ${msg.role === "user" ? "right-full mr-2" : "left-full ml-2"}`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {activeMenu === index && (
                  <div className={`absolute top-8 z-10 w-32 bg-white rounded-md shadow-lg py-1 border border-gray-200 ${msg.role === "user" ? "right-full mr-2" : "left-full ml-2"}`}>
                    <button onClick={() => handleCopyMessage(msg.content)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Copy Text
                    </button>
                    {msg.role !== "user" && (
                      <>
                        <button onClick={() => { setMessages([{ role: "ai", content: "Hello Doctor. I am your MedConnect AI Clinical Assistant. How can I help you today?" }]); setActiveMenu(null); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Clear Chat
                        </button>
                        <button onClick={() => { const text = messages.map(m => `${m.role === "ai" ? "AI" : "You"}: ${m.content}`).join("\n\n"); navigator.clipboard.writeText(text); setActiveMenu(null); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Export Chat
                        </button>
                      </>
                    )}
                    <button onClick={() => handleDeleteMessage(index)} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center mr-2 flex-shrink-0 mt-auto">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
              <div className="px-5 py-3 rounded-2xl bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t p-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSend} className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a medical question..."
              className="flex-1 border border-gray-300 p-3 lg:p-4 rounded-full focus:ring-2 focus:ring-indigo-500 outline-none transition bg-gray-50 text-gray-900"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-indigo-600 text-white p-3 lg:p-4 rounded-full shadow hover:bg-indigo-700 disabled:bg-indigo-300 transition flex items-center justify-center flex-shrink-0"
            >
              <svg className="w-6 h-6 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-gray-400">MedConnect AI Assistant. Always verify medical information.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
