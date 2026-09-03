"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Send, User, ExternalLink, ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { lazy, Suspense } from "react";

const DotLottieReact = lazy(() => 
  import("@lottiefiles/dotlottie-react").then((mod) => ({ default: mod.DotLottieReact }))
);

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const EXAMPLE_QUESTIONS = [
  "What are Sahal's key AI & ML skills?",
  "Take me to the CaptionCaptain project",
  "How was JuriGPT's RAG pipeline built?",
  "Tell me about the Neev AI client POC",
];

const STORAGE_KEY_MESSAGES = "portfolio_chat_messages_v1";
const STORAGE_KEY_OPEN = "portfolio_chat_is_open_v1";

const EVE_LOTTIE_URL = "https://lottie.host/d33f8af3-7d36-420d-aabf-b331bd88d32f/XHTDZiyXbX.json";

// Regex to capture Unicode emojis across scripts (supports ZWJ sequences, modifiers, and separates adjacent emojis)
const EMOJI_REGEX = /((?:\p{Extended_Pictographic}(?:\p{Emoji_Modifier}|\ufe0f)?(?:(?:\u200d)\p{Extended_Pictographic}(?:\p{Emoji_Modifier}|\ufe0f)?)*))/gu;

// Dynamically resolve any emoji character to its official animated WebP by hex codepoint
function emojiToHex(emoji: string): string {
  return Array.from(emoji)
    .map((char) => char.codePointAt(0)?.toString(16))
    .filter((hex) => hex && hex !== "fe0f" && hex !== "200d")
    .join("_");
}

// Eve Avatar using center-aligned static PNG with full fill
function EveAvatar({ className }: { className?: string }) {
  return (
    <div className={className || "w-6 h-6 flex items-center justify-center pointer-events-none select-none rounded-full overflow-hidden"}>
      <img
        src="/Eve-static.png"
        alt="Shiori Avatar"
        className="w-full h-full object-cover scale-125 select-none"
      />
    </div>
  );
}

// Eve Mascot in Full Waving Welcome State
function EveMascot() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto -mb-1" />;
  }

  return (
    <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto -mb-1 flex items-center justify-center pointer-events-none select-none">
      <Suspense fallback={<div className="w-full h-full" />}>
        <DotLottieReact
          src={EVE_LOTTIE_URL}
          loop
          autoplay
          className="w-full h-full object-contain"
        />
      </Suspense>
    </div>
  );
}

function AnimatedEmoji({ emoji, className }: { emoji: string; className?: string }) {
  const [hasError, setHasError] = useState(false);
  const hex = emojiToHex(emoji);

  if (hasError || !hex) {
    return <span>{emoji}</span>;
  }

  return (
    <img
      src={`https://fonts.gstatic.com/s/e/notoemoji/latest/${hex}/512.webp`}
      alt={emoji}
      loading="lazy"
      onError={() => setHasError(true)}
      className={className || "inline-block w-[1.38em] h-[1.38em] align-[-0.24em] object-contain mx-[0.1em] transition-transform duration-200 hover:scale-125 cursor-pointer select-none"}
    />
  );
}

function renderTextWithEmojis(text: string): React.ReactNode {
  if (!text) return text;
  const parts = text.split(EMOJI_REGEX);
  if (parts.length === 1) return text;

  return (
    <>
      {parts.map((part, index) => {
        if (part.match(EMOJI_REGEX)) {
          return <AnimatedEmoji key={index} emoji={part} />;
        }
        return part;
      })}
    </>
  );
}

function renderChildrenWithEmojis(children: React.ReactNode): React.ReactNode {
  if (typeof children === "string") return renderTextWithEmojis(children);
  if (Array.isArray(children)) {
    return children.map((c, i) => (typeof c === "string" ? renderTextWithEmojis(c) : c));
  }
  return children;
}

// Helper to strip thinking tags and extract [[NAVIGATE:...]] and [[LOG_UNANSWERED:...]] tokens
function parseNavigationToken(content: string): { cleanText: string; navPath?: string; loggedQuestion?: string } {
  // Strip completed reasoning blocks
  let text = content
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<antThinking>[\s\S]*?<\/antThinking>/gi, "");

  // If currently streaming inside an open thinking tag, hide thinking scratchpad
  if (text.includes("<think>")) {
    text = text.split(/<think>/i)[0];
  }
  if (text.includes("<antThinking>")) {
    text = text.split(/<antThinking>/i)[0];
  }

  // Extract navigation token
  const navMatch = text.match(/\[\[NAVIGATE:([a-zA-Z0-9_\-\/]+)\]\]/);
  let navPath: string | undefined = undefined;
  if (navMatch) {
    navPath = navMatch[1];
    text = text.replace(/\[\[NAVIGATE:[a-zA-Z0-9_\-\/]+\]\]/g, "");
  }

  // Extract log unanswered token
  const logMatch = text.match(/\[\[LOG_UNANSWERED:(.*?)\]\]/);
  let loggedQuestion: string | undefined = undefined;
  if (logMatch) {
    loggedQuestion = logMatch[1];
    text = text.replace(/\[\[LOG_UNANSWERED:.*?\]\]/g, "");
  }

  return { cleanText: text.trim(), navPath, loggedQuestion };
}

export default function ChatWidget() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-shiori-chat", handleOpen);
    return () => window.removeEventListener("open-shiori-chat", handleOpen);
  }, []);

  // Restore session from sessionStorage on mount
  useEffect(() => {
    try {
      const savedMessages = sessionStorage.getItem(STORAGE_KEY_MESSAGES);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
      const savedOpen = sessionStorage.getItem(STORAGE_KEY_OPEN);
      if (savedOpen) {
        setIsOpen(JSON.parse(savedOpen));
      }
    } catch (e) {
      console.warn("Could not restore chat session:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync messages to sessionStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      sessionStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    } catch (e) {
      console.warn("Could not save chat messages:", e);
    }
  }, [messages, isLoaded]);

  // Sync isOpen to sessionStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      sessionStorage.setItem(STORAGE_KEY_OPEN, JSON.stringify(isOpen));
    } catch (e) {
      console.warn("Could not save chat open state:", e);
    }
  }, [isOpen, isLoaded]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  const clearChat = () => {
    setMessages([]);
    try {
      sessionStorage.removeItem(STORAGE_KEY_MESSAGES);
    } catch (e) {
      console.warn("Could not clear chat storage:", e);
    }
  };

  const sendMessage = async (contentToSend: string) => {
    if (!contentToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: contentToSend.trim(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        let errorDetail = "";
        try {
          const errJson = await response.json();
          errorDetail = errJson.error || "";
        } catch {
          errorDetail = await response.text();
        }
        throw new Error(errorDetail || `Server responded with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response stream available");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = "";
      let buffer = "";
      const assistantId = (Date.now() + 1).toString();

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || "";
        
        for (const part of parts) {
          if (part.startsWith('data: ')) {
            const dataStr = part.slice(6);
            if (dataStr.trim() === '[DONE]') continue;
            
            try {
              const data = JSON.parse(dataStr);
              const text = data.choices?.[0]?.delta?.content || "";
              assistantResponse += text;
            } catch (e) {
              console.warn("Failed to parse stream chunk", e);
            }
          }
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: assistantResponse }
              : msg
          )
        );
      }

      // Check if assistant response triggered question logging
      const { loggedQuestion, cleanText } = parseNavigationToken(assistantResponse);
      if (loggedQuestion || cleanText.includes("[[LOG_UNANSWERED")) {
        fetch("/api/log-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: loggedQuestion || contentToSend,
            context: `User asked: "${contentToSend}"`,
          }),
        }).catch((err) => console.warn("Failed to log unanswered question:", err));
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: error?.message || "Sorry, I ran into an error connecting to my server. Please try again in a moment!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleExampleClick = (question: string) => {
    sendMessage(question);
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            layoutId="chat-widget-drawer"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="font-sans flex flex-col shadow-[-20px_0_80px_rgba(20,33,28,0.28)] border border-[rgba(20,33,28,0.14)] bg-[#f2f4ec]/98 backdrop-blur-[24px] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] fixed top-0 right-0 w-[calc(100vw-32px)] sm:w-[420px] h-[100dvh] rounded-none sm:rounded-l-[24px] border-y-0 border-r-0 overflow-hidden z-[300]"
          >
            {/* Header matching portfolio navy container style */}
            <div className="p-3.5 sm:p-4 bg-[#10201c] text-[#f2f4ec] flex justify-between items-center border-b border-[#173029]/80 shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white shadow-[0_4px_12px_rgba(31,122,109,0.25)] overflow-hidden">
                  <EveAvatar className="w-7 h-7 sm:w-8 sm:h-8 scale-110" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-xs sm:text-sm text-[#f7fbf9] tracking-tight">Shiori</h3>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-medium bg-[#1f7a6d]/30 text-[#bff2dc] border border-[#1f7a6d]/40">
                      AI Agent
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-[#a7b264] font-mono">Portfolio Intelligence</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    title="Reset chat"
                    className="text-[#96a89f] hover:text-white transition-colors p-1.5 rounded-full hover:bg-[#173029]"
                    aria-label="Clear chat history"
                  >
                    <RotateCcw size={14} />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-[#96a89f] hover:text-white transition-colors p-1.5 rounded-full hover:bg-[#173029]"
                  aria-label="Close Chat"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 sm:space-y-4 bg-[linear-gradient(rgba(20,33,28,0.016)_1px,transparent_1px),linear-gradient(90deg,rgba(20,33,28,0.016)_1px,transparent_1px)] bg-[size:24px_24px]">
              {messages.length === 0 && (
                <div className="text-center mt-0 px-1">
                  <EveMascot />
                  <h4 className="font-medium text-[#14211c] text-xs sm:text-sm mb-1">
                    Explore Sahal&apos;s Work with Shiori
                  </h4>
                  <p className="text-[11px] sm:text-xs text-[#40514a] mb-3.5 leading-relaxed">
                    Ask anything about his projects, machine learning architectures, or technical skills.
                  </p>

                  <div className="flex flex-col gap-1.5 sm:gap-2">
                    {EXAMPLE_QUESTIONS.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleExampleClick(q)}
                        className="text-left text-[11px] sm:text-xs bg-white/70 hover:bg-white border border-[rgba(20,33,28,0.09)] hover:border-[#1f7a6d] p-2.5 sm:p-3 rounded-[14px] sm:rounded-[16px] text-[#14211c] transition-all shadow-[0_2px_8px_rgba(20,33,28,0.03)] hover:shadow-[0_4px_14px_rgba(31,122,109,0.12)] hover:translate-y-[-1px]"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m) => {
                const { cleanText, navPath } = parseNavigationToken(m.content);

                // Hide assistant messages that only contain thinking tags (no text yet)
                if (m.role === "assistant" && !cleanText) return null;

                return (
                  <div
                    key={m.id}
                    className={`flex gap-2 sm:gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs overflow-hidden ${
                        m.role === "user"
                          ? "bg-[#173029] border border-[rgba(255,255,255,0.15)] text-[#bff2dc]"
                          : ""
                      }`}
                    >
                      {m.role === "user" ? (
                        <User size={12} className="text-[#bff2dc]" />
                      ) : (
                        <EveAvatar className="w-5 h-5 sm:w-6 sm:h-6 scale-110" />
                      )}
                    </div>
                    <div
                      className={`flex flex-col max-w-[85%] ${
                        m.role === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`px-3 sm:px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed ${
                          m.role === "user"
                            ? "bg-[#10201c] text-[#f2f4ec] rounded-[16px] rounded-tr-[4px] shadow-[0_4px_14px_rgba(16,32,28,0.14)]"
                            : "bg-white/80 text-[#14211c] border border-[rgba(20,33,28,0.09)] rounded-[16px] rounded-tl-[4px] shadow-[0_4px_16px_rgba(20,33,28,0.04)]"
                        }`}
                      >
                        {m.role === "user" ? (
                          renderChildrenWithEmojis(cleanText)
                        ) : (
                          <div className="space-y-2">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({ children }) => (
                                  <p className="mb-2 last:mb-0 leading-relaxed">
                                    {renderChildrenWithEmojis(children)}
                                  </p>
                                ),
                                li: ({ children }) => (
                                  <li className="leading-snug text-[#14211c]">
                                    {renderChildrenWithEmojis(children)}
                                  </li>
                                ),
                                ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 my-2 text-[#40514a]">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 my-2 text-[#40514a]">{children}</ol>,
                                h1: ({ children }) => <h1 className="text-sm font-semibold text-[#14211c] mb-1.5 mt-2">{renderChildrenWithEmojis(children)}</h1>,
                                h2: ({ children }) => <h2 className="text-xs font-semibold text-[#14211c] mb-1.5 mt-2">{renderChildrenWithEmojis(children)}</h2>,
                                h3: ({ children }) => <h3 className="text-[11px] font-mono uppercase tracking-wider text-[#1f7a6d] font-semibold mb-1 mt-2">{renderChildrenWithEmojis(children)}</h3>,
                                strong: ({ children }) => (
                                  <strong className="font-semibold text-[#10201c]">
                                    {renderChildrenWithEmojis(children)}
                                  </strong>
                                ),
                                code: ({ children }) => (
                                  <code className="bg-[#e5eadc] text-[#1f7a6d] px-1.5 py-0.5 rounded-[6px] text-[11px] font-mono">
                                    {children}
                                  </code>
                                ),
                                a: ({ href, children }) => {
                                  const isInternal = href?.startsWith("/") || href?.startsWith("#");
                                  return (
                                    <a
                                      href={href}
                                      onClick={(e) => {
                                        if (isInternal && href) {
                                          e.preventDefault();
                                          handleNavigate(href);
                                        }
                                      }}
                                      target={isInternal ? undefined : "_blank"}
                                      rel={isInternal ? undefined : "noreferrer"}
                                      className="inline-flex items-center gap-0.5 text-[#1f7a6d] font-medium underline underline-offset-2 hover:text-[#173029] cursor-pointer"
                                    >
                                      {children}
                                      {!isInternal && <ExternalLink size={11} className="inline ml-0.5" />}
                                    </a>
                                  );
                                },
                                hr: () => <hr className="my-2 border-[rgba(20,33,28,0.1)]" />,
                              }}
                            >
                              {cleanText}
                            </ReactMarkdown>

                            {/* Dynamic Action Button styled like portfolio theme */}
                            {navPath && (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleNavigate(navPath)}
                                className="w-full mt-2.5 py-2 px-3 bg-[#10201c] hover:bg-[#173029] text-[#bff2dc] border border-[rgba(255,255,255,0.12)] rounded-[12px] sm:rounded-[14px] text-[11px] sm:text-xs font-medium flex items-center justify-between shadow-[0_6px_20px_rgba(16,32,28,0.2)] transition-all cursor-pointer"
                              >
                                <span className="flex items-center gap-1.5">
                                  <Sparkles size={12} className="text-[#a7b264]" />
                                  <span>View Project on Portfolio</span>
                                </span>
                                <ArrowRight size={13} className="text-[#bff2dc]" />
                              </motion.button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                messages[messages.length - 1]?.role === "user" || 
                (messages[messages.length - 1]?.role === "assistant" && !parseNavigationToken(messages[messages.length - 1].content).cleanText)
              ) && (
                <div className="flex gap-2 sm:gap-2.5">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs overflow-hidden">
                    <EveAvatar className="w-5 h-5 sm:w-6 sm:h-6 scale-110" />
                  </div>
                  <div className="bg-white/80 border border-[rgba(20,33,28,0.09)] shadow-xs px-3.5 py-2.5 rounded-[16px] rounded-tl-[4px] flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-[#1f7a6d] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-[#1f7a6d] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-[#1f7a6d] rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar matching portfolio frosted pill style */}
            <div className="p-3 sm:p-3.5 bg-[#e5eadc]/90 border-t border-[rgba(20,33,28,0.08)] backdrop-blur-md shrink-0">
              <form onSubmit={handleFormSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Shiori about projects or skills..."
                  className="w-full pl-3.5 sm:pl-4 pr-10 py-2 sm:py-2.5 bg-white/90 border border-[rgba(20,33,28,0.12)] focus:border-[#1f7a6d] rounded-full text-xs sm:text-[13px] text-[#14211c] placeholder:text-[#40514a]/60 shadow-[inset_0_1px_2px_rgba(20,33,28,0.04)] focus:outline-none focus:ring-1 focus:ring-[#1f7a6d] transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-1.5 w-7 h-7 flex items-center justify-center bg-[#10201c] text-[#bff2dc] disabled:opacity-40 hover:bg-[#a7b264] hover:text-[#10201c] rounded-full transition-all cursor-pointer disabled:cursor-not-allowed shadow-xs"
                  aria-label="Send message"
                >
                  <Send size={13} className="-ml-[1px] mt-[1px]" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
