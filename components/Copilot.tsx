import React, { useState, useRef, useEffect } from 'react';
import { useJobs } from '../context/JobContext';
import { generateUUID } from '../utils';
import { askBusinessCopilot } from '../services/geminiService';
import { MessageSquare, X, Send, Sparkles, Loader2, Bot } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const Copilot: React.FC = () => {
  const { jobs, expenses } = useJobs();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hi! I'm your JobMow Copilot. Ask me about your schedule, revenue, or expenses!",
      timestamp: new Date()
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: generateUUID(),
      sender: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Call AI
    try {
      const responseText = await askBusinessCopilot(userMsg.text, { jobs, expenses });
      const aiMsg: Message = {
        id: generateUUID(),
        sender: 'ai',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: generateUUID(),
        sender: 'ai',
        text: "I'm sorry, I'm having trouble thinking right now. Please check your API key or connection.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-full shadow-lg shadow-slate-900/20 transition-all hover:scale-105 flex items-center justify-center group"
        aria-label="Open Business Copilot"
      >
        <Sparkles size={24} className="group-hover:text-yellow-300 transition-colors" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-200 animate-in slide-in-from-bottom-10 fade-in duration-200">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 rounded-t-2xl flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-lg">
            <Bot size={20} className="text-lawn-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm">JobMow Copilot</h3>
            <p className="text-xs text-slate-400">Powered by Gemini AI</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.sender === 'user'
                ? 'bg-lawn-600 text-white rounded-br-none'
                : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none shadow-sm'
                }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
              <div className={`text-[10px] mt-1 opacity-70 ${msg.sender === 'user' ? 'text-lawn-100 text-right' : 'text-slate-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm flex items-center gap-2 text-slate-500 text-sm">
              <Loader2 size={16} className="animate-spin" />
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100 rounded-b-2xl">
        <form onSubmit={handleSend} className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about profit, jobs, or draft emails..."
            className="w-full pl-4 pr-12 py-3 bg-slate-100 border border-transparent focus:bg-white focus:border-lawn-500 focus:ring-2 focus:ring-lawn-200 rounded-xl outline-none text-sm transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 p-1.5 bg-lawn-600 text-white rounded-lg hover:bg-lawn-700 disabled:opacity-50 disabled:bg-slate-400 transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Copilot;