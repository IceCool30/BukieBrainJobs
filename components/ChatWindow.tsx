'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Coins, 
  Loader2,
  HelpCircle
} from 'lucide-react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { sendMessageAction } from '@/app/actions';

interface Message {
  id: string;
  job_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_p__full_name?: string; // Optional joined name
}

interface ChatWindowProps {
  jobId: string;
  currentUserId: string;
  isInspectionPaid: boolean;
}

export default function ChatWindow({ jobId, currentUserId, isInspectionPaid }: ChatWindowProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendLoading, setSendLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Real-time typing indicator states
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);
  const lastTypingSentRef = useRef<number>(0);

  // Active user and partner profiles to map names to sender blocks
  const [profiles, setProfiles] = useState<Record<string, string>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto Scroll logic
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (!loading) {
      scrollToBottom('smooth');
    }
  }, [messages, loading]);

  // Fetch initial messages and profiles to resolve names
  useEffect(() => {
    async function loadChatData() {
      try {
        setLoading(true);
        setErrorMsg('');

        // 1. Fetch initial profiles to have mapped name resolution
        const { data: profileList } = await supabase
          .from('profiles')
          .select('id, full_name');
        
        if (profileList) {
          const profileMap: Record<string, string> = {};
          profileList.forEach((p) => {
            profileMap[p.id] = p.full_name || 'Artisan';
          });
          setProfiles(profileMap);
        }

        // 2. Fetch messages belonging to this job
        const { data: msgList, error: msgError } = await supabase
          .from('messages')
          .select('*')
          .eq('job_id', jobId)
          .order('created_at', { ascending: true });

        if (msgError) {
          throw msgError;
        }

        setMessages(msgList || []);
      } catch (err: any) {
        console.error('Failed to load historic chat messages:', err);
        setErrorMsg('Could not securely authenticate & retrieve chat history.');
      } finally {
        setLoading(false);
      }
    }

    loadChatData();
  }, [supabase, jobId]);

  // Setup Realtime Subscription mapping
  useEffect(() => {
    const channel = supabase
      .channel(`chat_room_${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `job_id=eq.${jobId}`
        },
        async (payload) => {
          const incoming = payload.new as Message;
          
          // Ensure sender profile is known, else fetch it on-demand
          if (!profiles[incoming.sender_id]) {
            const { data: p } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', incoming.sender_id)
              .maybeSingle();
            
            if (p) {
              setProfiles((prev) => ({
                ...prev,
                [incoming.sender_id]: p.full_name || 'Artisan'
              }));
            }
          }

          setMessages((prev) => {
            // Prevent duplicate insertions
            if (prev.some((m) => m.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
        }
      )
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { userId, isTyping } = payload.payload;
        if (userId !== currentUserId) {
          if (isTyping) {
            setTypingUser(userId);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
              setTypingUser(null);
            }, 3500);
          } else {
            setTypingUser(null);
          }
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      supabase.removeChannel(channel);
    };
  }, [supabase, jobId, profiles, currentUserId]);

  // Helper to send outbound typing status to other participants
  const handleTypingIndicator = (isTyping: boolean) => {
    if (!channelRef.current) return;
    
    const now = Date.now();
    // If stopped typing or input is cleared, dispatch inactive indicator immediately
    if (!isTyping) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: currentUserId, isTyping: false }
      });
      lastTypingSentRef.current = 0;
      return;
    }

    // Otherwise, throttle status broadcast to twice every 5 seconds to minimize resource usage
    if (now - lastTypingSentRef.current > 2500) {
      lastTypingSentRef.current = now;
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: currentUserId, isTyping: true }
      });
    }
  };

  // Message Render Anti-Bypass Filter
  const renderMessageContent = (text: string) => {
    if (isInspectionPaid) {
      return <span className="break-words whitespace-pre-wrap">{text}</span>;
    }

    // Anti-Bypass Match Pattern
    const phoneRegex = /(\d{11})|(\d{3}.*\d{3})|(@\w+)/g;
    const matches = [...text.matchAll(phoneRegex)];

    if (matches.length === 0) {
      return <span className="break-words whitespace-pre-wrap">{text}</span>;
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    matches.forEach((match, index) => {
      const matchText = match[0];
      const matchIndex = match.index!;

      // Add text before the match
      if (matchIndex > lastIndex) {
        elements.push(<span key={`pre-${index}`}>{text.slice(lastIndex, matchIndex)}</span>);
      }

      // Add the hidden mask span
      elements.push(
        <span 
          key={`hidden-${index}`} 
          className="text-red-600 font-bold bg-red-50 border border-red-200 px-1.5 py-0.5 rounded text-[11px] inline-flex items-center gap-0.5 mx-0.5 shadow-sm"
          title="Payment Required to Reveal Contact details"
        >
          [🔒 HIDDEN - Pay to Reveal]
        </span>
      );

      lastIndex = matchIndex + matchText.length;
    });

    // Add trailing text
    if (lastIndex < text.length) {
      elements.push(<span key="post">{text.slice(lastIndex)}</span>);
    }

    return <span className="break-words whitespace-pre-wrap">{elements}</span>;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sendLoading) return;

    const textToSend = newMessage.trim();
    setNewMessage('');
    setSendLoading(true);

    try {
      // Clear typing indicator state for other participants instantly upon sending
      handleTypingIndicator(false);

      const res = await sendMessageAction({
        jobId,
        content: textToSend,
        senderId: currentUserId
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to send your text message.');
        // Restore messsage so user doesn't lose input
        setNewMessage(textToSend);
      }
    } catch (err: any) {
      console.error('Error triggering sendMessage server action:', err);
      setErrorMsg('Network error. Trying to send message failed.');
      setNewMessage(textToSend);
    } finally {
      setSendLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#006D44] mb-3" />
        <span className="text-xs font-mono text-gray-400 uppercase tracking-widest font-bold">
          Binding Secure Channel...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden" id="chat-window-terminal">
      
      {/* Security Level Header */}
      <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
            isInspectionPaid ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white animate-pulse'
          }`}>
            {isInspectionPaid ? (
              <ShieldCheck className="w-2.5 h-2.5" />
            ) : (
              <Lock className="w-2.5 h-2.5" />
            )}
          </div>
          <div>
            <span className="block text-xs font-extrabold uppercase tracking-wider text-gray-700">
              Communication Security Check
            </span>
            <span className="block text-[10px] text-gray-400 font-medium">
              {isInspectionPaid 
                ? 'Standard contact data bypass validation approved' 
                : 'Anti-bypass filters enabled: Phone numbers/Usernames redacted.'}
            </span>
          </div>
        </div>

        {!isInspectionPaid && (
          <div className="text-[10px] bg-amber-50 border border-amber-200 text-amber-800 font-extrabold px-3 py-1.5 rounded-xl uppercase tracking-wider flex items-center gap-1">
            <span>Bypass Guard</span>
          </div>
        )}
      </div>

      {/* Warning banner about filters */}
      {!isInspectionPaid && (
        <div className="p-3.5 bg-yellow-50/50 border-b border-yellow-100 text-[11px] text-amber-800 font-semibold leading-relaxed flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            To prevent platform bypass, the main phone number, email handles, and @telegram aliases will remain scrambled until the employer covers the <strong>₦300 Inspection/Matching Fee</strong>.
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/60"
        id="chat-messages-scroll"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-full py-12 space-y-2">
            <div className="w-12 h-12 bg-[#006D44]/5 text-[#006D44] rounded-full flex items-center justify-center border border-[#006D44]/10">
              <HelpCircle className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Empty Conversation</p>
            <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
              No chat logs are presently recorded. Send a greeting to initiate matching discussions with your client.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            const senderName = profiles[msg.sender_id] || 'Participant';
            const formattedTime = new Date(msg.created_at).toLocaleTimeString('en-XG', {
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div 
                key={msg.id}
                className={`flex flex-col max-w-[75%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                id={`msg-bubble-${msg.id}`}
              >
                {/* Sender Tag Header */}
                <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-1 px-1">
                  {isMe ? 'Me' : senderName}
                </span>

                {/* Message Bubble Body */}
                <div 
                  className={`p-3.5 rounded-2xl text-xs font-semibold leading-relaxed ${
                    isMe 
                      ? 'bg-[#006D44] text-white rounded-tr-none shadow-md shadow-emerald-900/5' 
                      : 'bg-white text-gray-900 border border-gray-150 rounded-tl-none shadow-sm'
                  }`}
                >
                  {renderMessageContent(msg.content)}
                </div>

                {/* Timestamp Footer */}
                <span className="text-[8px] font-mono text-gray-400 mt-1 px-1">
                  {formattedTime}
                </span>
              </div>
            );
          })
        )}
        
        {/* Real-time typing indicators */}
        {typingUser && (
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 animate-pulse px-2 py-1" id="chat-typing-indicator">
            <span className="w-1.5 h-1.5 bg-[#006D44] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-[#006D44] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-[#006D44] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            <span className="ml-1 font-medium italic text-gray-400">
              {profiles[typingUser] || 'Participant'} is typing...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error message feedback */}
      {errorMsg && (
        <div className="px-4 py-2 bg-red-50 text-red-700 text-[10px] font-bold border-t border-red-100 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="underline uppercase tracking-wide">
            Dismiss
          </button>
        </div>
      )}

      {/* Footer input form */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex items-center gap-3">
        <input
          required
          type="text"
          placeholder="Compose text message..."
          value={newMessage}
          onChange={(e) => {
            const val = e.target.value;
            setNewMessage(val);
            handleTypingIndicator(val.length > 0);
          }}
          className="flex-1 bg-gray-50 border border-gray-200 focus:border-[#006D44] focus:bg-white text-xs px-4 py-3 rounded-xl transition-all outline-none text-gray-900 placeholder-gray-400 font-medium shadow-inner"
          id="chat-message-input"
        />
        <button
          type="submit"
          disabled={sendLoading || !newMessage.trim()}
          className="bg-[#006D44] hover:bg-[#005a37] text-white p-3 rounded-xl transition-all shadow-md shadow-green-900/10 hover:shadow-green-900/20 active:scale-95 disabled:opacity-40 disabled:scale-100 cursor-pointer shrink-0"
          id="chat-send-submit-btn"
        >
          {sendLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>

    </div>
  );
}
