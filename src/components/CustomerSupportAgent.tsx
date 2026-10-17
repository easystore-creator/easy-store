import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  PhoneCall, 
  ShieldCheck, 
  RotateCcw 
} from 'lucide-react';
import { OwnerAvatar } from './OwnerAvatar';

interface ChatMessage {
  id: string;
  role: 'agent' | 'user';
  text: string;
  timestamp: string;
}

interface CustomerSupportAgentProps {
  isOpen?: boolean;
  onClose?: () => void;
  onNavigateToCatalog?: () => void;
  onNavigateToTracking?: () => void;
}

const QUICK_PROMPTS = [
  { label: '  Delivery & COD in Pakistan', query: 'How does Cash on Delivery and delivery across Pakistan work?' },
  { label: '  Payment Methods & Accounts', query: 'What are the official EasyPaisa, JazzCash, and Bank account details?' },
  { label: '  7-Day Checking Warranty', query: 'What is your checking warranty and refund policy?' },
  { label: '  Mobiles & Earbuds Stock', query: 'What mobile brands and wireless earbuds are available?' },
  { label: '  How to Track My Order', query: 'How can I track my parcel order status?' },
  { label: '  10% Discount Coupon', query: 'Is there any discount coupon available for my order?' },
];

export const CustomerSupportAgent: React.FC<CustomerSupportAgentProps> = ({
  isOpen: controlledIsOpen,
  onClose,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleToggle = () => {
    if (controlledIsOpen !== undefined && onClose) {
      if (isOpen) onClose();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'agent',
      text: `Assalam-o-Alaikum! Welcome to **Easy Store Pakistan**. I am your verified Store Assistant. I am here to guide you with 100% accurate information regarding:\n\n- Cash on Delivery across all cities of Pakistan\n- EasyPaisa, JazzCash & Bank Transfer payment accounts\n- Original 7-Day checking warranty\n- Order placement, tracking & mobile/earbuds stock\n\nHow may I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (userText: string) => {
    const textToSend = userText.trim();
    if (!textToSend || isTyping) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const historyPayload = messages.slice(-5).map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        content: m.text,
      }));

      const res = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
        }),
      });

      const data = await res.json();
      const replyText = data.reply || data.text || 'Assalam-o-Alaikum! Please call or WhatsApp our official helpline at +92 346 7792177 for instant assistance.';

      const agentMsg: ChatMessage = {
        id: `agent_${Date.now()}`,
        role: 'agent',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (error) {
      console.error('Agent chat error:', error);
      const fallbackMsg: ChatMessage = {
        id: `fallback_${Date.now()}`,
        role: 'agent',
        text: 'Assalam-o-Alaikum! All products in Easy Store come with 100% original checking warranty and Cash on Delivery across Pakistan. For direct assistance, you can also connect with founder Abdullah on WhatsApp at **+92 346 7792177**.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `reset_${Date.now()}`,
        role: 'agent',
        text: 'Chat history cleared. How can I help you today with Easy Store Pakistan?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* 1. FLOATING CHAT MODAL */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[410px] h-[560px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 mb-3">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#072448] via-[#0f3460] to-[#0284c7] text-white p-4 flex items-center justify-between border-b border-sky-700/40 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <OwnerAvatar size="md" className="ring-2 ring-cyan-300" />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm text-white">Easy Store Agent</h3>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                    LIVE
                  </span>
                </div>
                <p className="text-[11px] text-sky-200 font-medium">
                  Official Store Assistant   Accurate Guide
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleClearChat}
                title="Restart Chat"
                className="p-1.5 hover:bg-white/10 rounded-xl text-sky-200 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handleToggle}
                className="p-1.5 hover:bg-white/10 rounded-xl text-sky-200 hover:text-white transition-colors cursor-pointer"
                aria-label="Close Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Trust strip */}
          <div className="bg-sky-50 px-3.5 py-1.5 border-b border-sky-100 flex items-center justify-between text-[10px] font-bold text-slate-600 shrink-0">
            <span className="flex items-center gap-1 text-[#0284c7]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% Honest Guidance
            </span>
            <a
              href="https://wa.me/923467792177"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-700 hover:underline"
            >
              <PhoneCall className="w-3 h-3" />
              <span>WhatsApp: +92 346 7792177</span>
            </a>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'agent' && (
                  <div className="w-7 h-7 rounded-xl bg-[#0284c7] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-[#0284c7] text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                  }`}
                >
                  <div className="whitespace-pre-line leading-relaxed font-normal">
                    {msg.text}
                  </div>
                  <div
                    className={`text-[9px] mt-1.5 text-right font-medium ${
                      msg.role === 'user' ? 'text-sky-100' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 justify-start items-center text-slate-500">
                <div className="w-7 h-7 rounded-xl bg-[#0284c7] text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 rounded-bl-xs shadow-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#0284c7] rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-[#0284c7] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-[#0284c7] rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[10px] text-slate-400 font-bold ml-1">Agent is formulating accurate reply...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 overflow-x-auto flex items-center gap-1.5 shrink-0 scrollbar-none">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp.query)}
                disabled={isTyping}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-sky-50 hover:text-[#0284c7] border border-slate-200 text-slate-700 text-[10px] font-bold transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Input Box Footer */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputMessage);
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask our agent about products, delivery, payments..."
                className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="p-2.5 bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer shadow-sm shadow-sky-500/20 active:scale-95"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. FLOATING LAUNCHER BUTTON */}
      <button
        onClick={handleToggle}
        className="group flex items-center gap-2.5 bg-gradient-to-r from-[#072448] via-[#0f3460] to-[#0284c7] text-white pl-2 pr-4 py-2 rounded-full shadow-2xl hover:shadow-sky-500/30 border-2 border-white/40 cursor-pointer transform hover:scale-105 active:scale-95 transition-all"
        title="Open Live Store Customer Support Agent"
      >
        <div className="relative">
          <OwnerAvatar size="sm" className="ring-2 ring-cyan-300 shadow-sm" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-[#072448] rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-[#072448] rounded-full" />
        </div>
        <div className="flex flex-col text-left leading-none">
          <span className="text-[10px] text-cyan-300 font-extrabold uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-300" />
            Live Support
          </span>
          <span className="text-xs font-black text-white">
            Ask Store Agent
          </span>
        </div>
      </button>
    </div>
  );
};
