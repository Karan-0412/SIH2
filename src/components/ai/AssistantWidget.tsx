import React, { useEffect, useRef, useState } from 'react';
import { X, Send, MessageSquare, Minus, Move } from 'lucide-react';
import { sendAssistantMessage } from '@/services/assistant';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
}

const STORAGE_KEY = 'assistant_chat_history_v1';

const AssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 24, y: 24 });
  const dragRef = useRef<HTMLDivElement | null>(null);
  const iconRef = useRef<HTMLButtonElement | null>(null);
  const clickTimer = useRef<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setMessages(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  const onSingleClick = () => {
    setIsOpen(true);
  };

  const onDoubleClick = () => {
    setIsDragging((d) => !d);
  };

  const handleIconClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (clickTimer.current) {
      window.clearTimeout(clickTimer.current);
      clickTimer.current = null;
      onDoubleClick();
    } else {
      clickTimer.current = window.setTimeout(() => {
        onSingleClick();
        if (clickTimer.current) window.clearTimeout(clickTimer.current);
        clickTimer.current = null;
      }, 200);
    }
  };

  // Dragging logic for the chatbox when in dragging mode
  useEffect(() => {
    const node = dragRef.current;
    if (!node || !isDragging) return;

    let startX = 0; 
    let startY = 0; 
    let origX = 0; 
    let origY = 0; 
    let dragging = false;

    const onMouseDown = (e: MouseEvent) => {
      if (!isDragging) return;
      dragging = true;
      startX = e.clientX; 
      startY = e.clientY;
      origX = pos.x; 
      origY = pos.y;
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      setPos({ x: Math.max(8, origX - dx), y: Math.max(8, origY - dy) });
    };

    const onMouseUp = () => {
      dragging = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    node.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    
    return () => {
      node.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, pos.x, pos.y]);

  const submit = async () => {
    const text = input.trim();
    if (!text || loading) return;
    
    const userMsg: Message = { 
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
      role: 'user', 
      content: text, 
      createdAt: Date.now() 
    };
    
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);
    
    try {
      // Add system context for the assistant
      const systemMessage = {
        role: 'system',
        content: `You are a helpful assistant for the HEI Student Portal. This is an educational platform where students can:
        - View and register for academic and co-curricular events
        - Track their goals and achievements
        - Access course schedules and faculty information
        - Use integrations with various educational platforms
        - View leaderboards and community features
        
        Help students with questions about:
        - Event registration and details
        - Goal setting and tracking
        - Platform navigation
        - Academic resources
        - General questions about the portal
        
        Be friendly, helpful, and specific to the educational context.`
      };
      
      const messageHistory = [systemMessage, ...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const resp = await sendAssistantMessage(messageHistory);
      const assistantMsg: Message = { 
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
        role: 'assistant', 
        content: resp.content, 
        createdAt: Date.now() 
      };
      setMessages((m) => [...m, assistantMsg]);
    } catch (err: any) {
      const assistantMsg: Message = { 
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
        role: 'assistant', 
        content: err?.message || 'Sorry, something went wrong.', 
        createdAt: Date.now() 
      };
      setMessages((m) => [...m, assistantMsg]);
    } finally {
      setLoading(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    right: `${pos.x}px`,
    bottom: `${pos.y}px`,
    zIndex: 1000,
  };

  return (
    <div style={containerStyle} className="select-none">
      {/* Floating Icon */}
      <button
        ref={iconRef}
        onClick={handleIconClick}
        className={[
          'h-14 w-14 rounded-full shadow-lg flex items-center justify-center text-white hover:opacity-90 transition-all duration-200',
          isDragging ? 'bg-blue-600' : 'bg-black',
          isOpen ? 'hidden' : ''
        ].join(' ')}
        aria-label="Open Assistant"
        title={isDragging ? 'Double-click to lock position' : 'Double-click to make draggable'}
      >
        {isDragging ? <Move className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>

      {/* Chatbox */}
      {isOpen && (
        <div 
          ref={dragRef} 
          className={[
            'w-[320px] md:w-[380px] rounded-2xl shadow-2xl bg-white border overflow-hidden',
            isDragging ? 'cursor-move ring-2 ring-blue-500 ring-opacity-50' : ''
          ].join(' ')}
        >
          {/* Header */}
          <div className={[
            'flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-gray-50 to-white',
            isDragging ? 'cursor-move' : ''
          ].join(' ')}>
            <div className="font-semibold flex items-center gap-2">
              Ask Me Anything
              {isDragging && <Move className="h-4 w-4 text-blue-600" />}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMinimized((v) => !v)}
                className="p-1 hover:bg-gray-100 rounded"
                aria-label="Minimize"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!minimized && (
            <div className="flex flex-col h-[420px]">
              {/* Messages */}
              <div className="flex-1 overflow-auto px-4 py-3 space-y-3">
                {messages.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    Hi! Ask me anything about this website. I use your site content to answer.
                    {isDragging && <div className="mt-2 text-xs text-blue-600">💡 Drag mode: Move me around!</div>}
                  </div>
                )}
                {messages.map((m) => (
                  <div key={m.id} className={['flex', m.role === 'user' ? 'justify-end' : 'justify-start'].join(' ')}>
                    <div className={['max-w-[80%] rounded-2xl px-3 py-2 shadow-sm text-sm', m.role === 'user' ? 'bg-black text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'].join(' ')}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && (<div className="text-xs text-muted-foreground">Thinking…</div>)}
              </div>

              {/* Input */}
              <div className="border-t p-2 flex items-center gap-2">
                <input
                  className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none focus:ring focus:ring-gray-200"
                  placeholder="Type your question…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      submit();
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    submit();
                  }}
                  disabled={loading || !input.trim()}
                  className={['h-9 w-9 inline-flex items-center justify-center rounded-full', (loading || !input.trim()) ? 'bg-gray-200 text-gray-500' : 'bg-black text-white hover:bg-black/90'].join(' ')}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssistantWidget;