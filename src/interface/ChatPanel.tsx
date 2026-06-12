import { Send } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getAgentSet, getAllAgents } from '../data/agents';
import { USER_COLOR, USER_COLOR_LIGHT, USER_COLOR_SOFT } from '../theme/brand';
import { useCoreStore } from '../integration/store/coreStore';
import { useTeamStore, useActiveTeam } from '../integration/store/teamStore';
import { useUiStore } from '../integration/store/uiStore';
import { useSceneManager } from '../simulation/SceneContext';
import { Avatar } from './components/Avatar';
import { AuditModal } from './AuditModal';
import { FileSearch } from 'lucide-react';

const ChatPanel: React.FC = () => {
  const {
    isChatting,
    isThinking,
    selectedNpcIndex,
    setIsTyping,
    setActiveAuditTaskId
  } = useUiStore();
  const scene = useSceneManager();
  const activeTeam = useActiveTeam();
  const agents = getAllAgents(activeTeam);
  const selectedAgentSetId = activeTeam.id;

  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stopTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const agent = selectedNpcIndex !== null ? agents.find(a => a.index === selectedNpcIndex) ?? null : null;

  // Combine store messages with project histories if needed,
  // but unified useCoreStore is the source of truth for history.
  const coreStore = useCoreStore();
  const chatMessages = selectedNpcIndex !== null
    ? (coreStore.agentHistories[selectedNpcIndex] || [])
    : [];


  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      if (stopTypingTimeoutRef.current) clearTimeout(stopTypingTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, isThinking, isChatting]);

  useEffect(() => {
    // Initial scroll when chat opens
    if (isChatting && scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
    }
  }, [isChatting]);

  const simulateTyping = (text: string) => {
    let currentIndex = 0;
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

    setIsTyping(true);

    typingIntervalRef.current = setInterval(() => {
      if (currentIndex < text.length) {
        const char = text[currentIndex];
        setInput((prev) => prev + char);
        currentIndex++;
      } else {
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        setIsTyping(false);
      }
    }, 20); // 20ms per character for a natural feel
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    // simulateTyping(pastedText);
    setInput(pastedText);
  };

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    if (stopTypingTimeoutRef.current) clearTimeout(stopTypingTimeoutRef.current);
    setIsTyping(false);

    const text = input;
    setInput('');
    await scene?.sendMessage(text);
  };

  if (!isChatting || !agent) {
    return null;
  }

  return (
    <div className="flex flex-col h-full relative overflow-hidden shrink-0 pointer-events-auto" style={{ background: 'var(--bg-base)' }}>
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-1 space-y-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:display-none"
      >
        {chatMessages.filter(msg => !msg.metadata?.internal).map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} max-w-[90%]`}>
              {/* Avatar / Icon */}
              <div className="shrink-0 mt-1">
                {msg.role === 'assistant' ? (
                  <Avatar type={agent?.index === activeTeam.leadAgent.index ? 'lead' : 'sub'} color={agent?.color} size={32} />
                ) : (
                  <Avatar type="user" color={USER_COLOR} size={32} />
                )}
              </div>

              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className="px-4 py-2.5 text-[14px] leading-relaxed font-hand"
                  style={msg.role === 'user' ? {
                    backgroundColor: USER_COLOR_LIGHT,
                    border: `3px solid ${USER_COLOR}`,
                    color: '#27272a',
                    boxShadow: `4px 4px 0 0 ${USER_COLOR}`,
                    borderRadius: 0,
                  } : {
                    background: 'var(--bg-surface)',
                    border: '3px solid var(--stroke)',
                    color: 'var(--fg-base)',
                    boxShadow: '4px 4px 0 0 var(--stroke)',
                    borderRadius: 0,
                  }}
                >
                  {msg.role === 'assistant' ? (
                    <div className="markdown-content">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>

                      {msg.metadata?.reviewTaskId && (
                        <div
                          className="mt-4 p-4 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500"
                          style={{ background: 'var(--bg-base)', border: '3px solid var(--stroke)', borderRadius: 0 }}
                        >
                          <div className="flex items-center gap-2 pr-2">
                            <div
                              className="p-2 shrink-0"
                              style={{ backgroundColor: USER_COLOR_LIGHT, color: USER_COLOR, border: `3px solid ${USER_COLOR}`, borderRadius: 0 }}
                            >
                              <FileSearch size={18} />
                            </div>
                            <span className="font-sketch uppercase tracking-[1.5px] text-[10px]" style={{ color: 'var(--fg-base)', opacity: 0.75 }}>
                              {coreStore.tasks.find(t => t.id === msg.metadata.reviewTaskId)?.status === 'on_hold'
                                ? 'Review Requested'
                                : 'Review Processed'}
                            </span>
                          </div>

                          {coreStore.tasks.find(t => t.id === msg.metadata.reviewTaskId)?.status === 'on_hold' && (
                            <button
                              onClick={() => setActiveAuditTaskId(msg.metadata.reviewTaskId)}
                              className="flex-1 min-w-[120px] px-4 py-2 font-sketch uppercase tracking-[1.5px] text-[10px] active:scale-95 transition-all whitespace-nowrap"
                              style={{ background: 'var(--fg-base)', color: 'var(--bg-base)', border: '3px solid var(--stroke)', boxShadow: '4px 4px 0 0 var(--stroke)', borderRadius: 0 }}
                            >
                              Review Task
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}
                </div>

                <div className={`flex items-center gap-2 mt-2 px-1`}>
                  <span className="font-sketch uppercase tracking-[1.5px] text-[10px]" style={{ color: 'var(--fg-base)', opacity: 0.6 }}>
                    {msg.role === 'user' ? 'You' : (agent?.name?.split(' ')[0] || 'AI')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isThinking && (
          <div
            className="flex items-start gap-3"
          >
            <div className="w-4 h-4 animate-pulse mt-1" style={{ color: 'var(--fg-base)', opacity: 0.4 }}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" />
              </svg>
            </div>
            <div className="px-4 py-3" style={{ background: 'var(--bg-surface)', border: '3px solid var(--stroke)', borderRadius: 0 }}>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ animationDelay: '0ms', background: 'var(--fg-base)', opacity: 0.4 }} />
                <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ animationDelay: '150ms', background: 'var(--fg-base)', opacity: 0.4 }} />
                <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ animationDelay: '300ms', background: 'var(--fg-base)', opacity: 0.4 }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-2 border-t-[3px]" style={{ borderColor: 'var(--stroke)' }}>
        <div className="relative flex items-center gap-2">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => {
                const val = e.target.value;
                setInput(val);

                // Show player talking animation while typing
                if (val.length > 0) {
                  setIsTyping(true);
                  if (stopTypingTimeoutRef.current) clearTimeout(stopTypingTimeoutRef.current);
                  stopTypingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1000);
                } else {
                  setIsTyping(false);
                }
              }}
              onPaste={handlePaste}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message (↵ to send)"
              className="w-full px-3 py-3 text-sm font-hand focus:outline-none transition-all resize-none pr-12 [scrollbar-width:none]"
              style={{
                background: 'var(--bg-surface)',
                color: 'var(--fg-base)',
                border: input.trim() ? `3px solid ${USER_COLOR}` : '3px solid var(--stroke)',
                borderRadius: 0,
              }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            style={{
              backgroundColor: !input.trim() || isThinking ? 'var(--bg-surface)' : agent.color,
              color: !input.trim() || isThinking ? 'var(--fg-base)' : '#fff',
              border: '3px solid var(--stroke)',
              boxShadow: '4px 4px 0 0 var(--stroke)',
              borderRadius: 0,
              opacity: !input.trim() || isThinking ? 0.5 : 1,
            }}
            className={`h-11 w-11 shrink-0 flex items-center justify-center font-black text-xs uppercase tracking-widest transition-all active:scale-95 ${!input.trim() || isThinking ? 'cursor-not-allowed' : 'hover:brightness-90'
              }`}
          >
            <Send size={16} strokeWidth={3} />
          </button>
        </div>
        <p className="font-sketch uppercase tracking-[1.5px] text-[8px] mt-2 text-center" style={{ color: 'var(--fg-base)', opacity: 0.5 }}>
          Shift + ↵ for new line
        </p>
      </div>
    </div>
  );
};

export default ChatPanel;
