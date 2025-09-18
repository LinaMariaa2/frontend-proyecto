"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: "user" | "bot"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { sender: "user", text: input }]);
    setIsTyping(true);

    try {
      const res = await fetch(
        "https://n8n-production-6d6d.up.railway.app/webhook/2213a1b2-dcc1-4972-83a4-677d7b9bbd12",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input, sessionId: "demo123" }),
        }
      );
      const data = await res.json();

      setMessages(prev => [
        ...prev,
        { sender: "bot", text: data.reply || data.output },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "⚠️ Error al conectar con el servidor." },
      ]);
    } finally {
      setIsTyping(false);
    }

    setInput("");
  };

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Cerrar al hacer click afuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Botón flotante */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 
                   text-white shadow-xl flex items-center justify-center 
                   hover:shadow-2xl transition-all"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black z-40"
          />
        )}
      </AnimatePresence>

      {/* Ventana del chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute bottom-20 right-0 w-80 sm:w-96 
                       bg-white/95 backdrop-blur-xl rounded-2xl 
                       shadow-2xl border border-slate-200 flex flex-col 
                       overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-4 py-3 flex justify-between items-center">
              <h2 className="font-bold">HortiTech Bot 🌱</h2>
              <button onClick={() => setIsOpen(false)} className="hover:opacity-80">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mensajes */}
            <div
              className="flex-1 p-4 overflow-y-auto space-y-3 text-sm bg-gradient-to-b from-slate-50 to-white
                         scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent"
            >
              {messages.length === 0 && (
                <div className="text-center text-slate-400 italic">
                  Empieza a chatear con HortiTech 🤖
                </div>
              )}
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-md ${
                    msg.sender === "user"
                      ? "ml-auto bg-gradient-to-br from-teal-500 to-emerald-600 text-white"
                      : "mr-auto bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border border-slate-200"
                  }`}
                >
                  {msg.text}
                </motion.div>
              ))}

              {/* Indicador de escribiendo */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mr-auto bg-slate-200 text-slate-600 px-3 py-2 rounded-xl text-xs italic shadow"
                >
                  Escribiendo...
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-3 flex items-center gap-2 bg-white/80 backdrop-blur-sm">
              <input
                type="text"
                className="flex-1 border rounded-full px-4 py-2 text-sm 
                           focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Escribe un mensaje..."
              />
              <button
                onClick={sendMessage}
                className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white p-2 rounded-full hover:opacity-90 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
