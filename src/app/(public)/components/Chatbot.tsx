"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    { sender: "user" | "bot"; text: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Estado para sessionId (solo se asigna en cliente)
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      let id = sessionStorage.getItem("hortitech_sessionId");
      if (!id) {
        id = crypto.randomUUID ? crypto.randomUUID() : "sid_" + Date.now();
        sessionStorage.setItem("hortitech_sessionId", id);
      }
      setSessionId(id);
    }
  }, []);

  const sendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || input;
    if (!messageToSend.trim() || !sessionId) return;

    setMessages((prev) => [...prev, { sender: "user", text: messageToSend }]);
    setIsTyping(true);

    try {
      const res = await fetch(
        "https://n8n-production-6d6d.up.railway.app/webhook/2213a1b2-dcc1-4972-83a4-677d7b9bbd12",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: messageToSend, sessionId }),
        }
      );
      const data = await res.json();

      setMessages((prev) => [
  ...prev,
  { sender: "bot", text: (data.reply || data.output || "").replace(/\n/g, "<br/>") },
]);

    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            "⚠️ Error al conectar con el servidor. <br/><button id='retry-btn' class='underline text-teal-600'>Reintentar</button>",
        },
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

  // Llamar al webhook de bienvenida cuando se abre el chat
  useEffect(() => {
    if (isOpen) {
      setMessages([
        { sender: "bot", text: "⏳ Cargando mensaje de bienvenida..." },
      ]);

      fetch("https://n8n-production-6d6d.up.railway.app/webhook/chat-welcome")
        .then((res) => res.json())
        .then((data) => {
          setMessages([{ sender: "bot", text: data.reply || data.message }]);
        })
        .catch(() => {
          setMessages([
            {
              sender: "bot",
              text:
                "⚠️ No se pudo cargar el mensaje de bienvenida. <br/><button id='retry-btn' class='underline text-teal-600'>Reintentar</button>",
            },
          ]);
        });
    }
  }, [isOpen]);

  // Listener para botón de reintento en mensajes HTML
  useEffect(() => {
    const handleRetry = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.id === "retry-btn") {
        sendMessage();
      }
    };
    document.addEventListener("click", handleRetry);
    return () => {
      document.removeEventListener("click", handleRetry);
    };
  }, [sessionId, input]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Botón flotante */}
      <motion.button
        aria-label={isOpen ? "Cerrar chat" : "Abrir chat"}
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
  className="flex-1 p-4 overflow-y-auto space-y-3 text-sm 
             bg-gradient-to-b from-slate-50 to-white
             scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent
             max-h-[60vh]"
>

              {messages.length === 0 && (
                <div className="text-center text-slate-400 italic">
                  Empieza a chatear con HortiTech 🤖
                </div>
              )}
              {messages.map((msg, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  {msg.sender === "bot" && <span className="mt-1">🤖</span>}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-md ${
                      msg.sender === "user"
                        ? "ml-auto bg-gradient-to-br from-teal-500 to-emerald-600 text-white"
                        : "mr-auto bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border border-slate-200"
                    }`}
                    dangerouslySetInnerHTML={{ __html: msg.text }}
                  />
                </div>
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
                disabled={!sessionId}
                className="flex-1 border rounded-full px-4 py-2 text-sm 
                           focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Escribe un mensaje..."
              />
              <button
                onClick={() => sendMessage()}
                disabled={!sessionId}
                className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white p-2 rounded-full hover:opacity-90 transition disabled:opacity-50"
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
