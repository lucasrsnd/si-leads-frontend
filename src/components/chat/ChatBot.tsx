"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Bot, User } from "lucide-react";
import { aiApi } from "../../lib/api";
import { ChatMessage } from "../../types";
import { cn } from "../../lib/utils";

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Olá! Sou o assistente da SI Soluções Imobiliárias. Como posso ajudar com seus leads hoje? 🏠",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.slice(-10);
      const { data } = await aiApi.chat(text, history);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Desculpe, ocorreu um erro. Por favor tente novamente.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all z-40",
          open && "hidden",
        )}
      >
        <MessageCircle className="w-6 h-6" />
        <span className="sr-only">Abrir chatbot</span>
      </button>

      {/* Chat window */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 flex flex-col w-80 sm:w-96 bg-[var(--surface)] rounded-2xl shadow-2xl border border-[var(--border)] transition-all duration-200",
          open
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none",
        )}
        style={{ height: "520px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-brand-600 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Assistente SI</p>
              <p className="text-xs text-brand-100">IA Imobiliária · Online</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex items-start gap-2",
                msg.role === "user" && "flex-row-reverse",
              )}
            >
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                  msg.role === "assistant"
                    ? "bg-brand-100 dark:bg-brand-900/30"
                    : "bg-slate-100 dark:bg-slate-700",
                )}
              >
                {msg.role === "assistant" ? (
                  <Bot className="w-3 h-3 text-brand-600" />
                ) : (
                  <User className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed",
                  msg.role === "assistant"
                    ? "bg-[var(--surface-2)] text-[var(--text)] rounded-tl-none"
                    : "bg-brand-600 text-white rounded-tr-none",
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                <Bot className="w-3 h-3 text-brand-600" />
              </div>
              <div className="bg-[var(--surface-2)] px-3 py-2 rounded-2xl rounded-tl-none">
                <Loader2 className="w-4 h-4 text-[var(--text-muted)] animate-spin" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-1">
            {[
              "Dicas para qualificar leads",
              "Como fechar mais negócios?",
              "Qual status devo priorizar?",
            ].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setInput(s);
                }}
                className="text-xs px-2.5 py-1 bg-[var(--surface-2)] hover:bg-brand-50 dark:hover:bg-brand-900/20 text-[var(--text-muted)] hover:text-brand-600 rounded-full border border-[var(--border)] transition"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-[var(--border)]">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Digite sua mensagem..."
              rows={1}
              className="flex-1 resize-none border border-[var(--border)] rounded-xl px-3 py-2 text-sm bg-[var(--surface-2)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-brand-500 max-h-24"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="w-9 h-9 flex items-center justify-center bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl transition flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
