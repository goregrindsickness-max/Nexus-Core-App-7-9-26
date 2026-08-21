import React, { useEffect, useState, useRef } from 'react';
import { getSupabase } from '../../supabase';
import { openFloatingChat } from '../../store/useChatStore';
import { markChatAsRead } from '../../lib/chat';
import { extractUUID } from '../../utils/socialFeedUtils';
import { X, Send, Minimize2, Maximize2 } from 'lucide-react';

interface ChatMessage {
  id?: string | number;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at?: string;
}

const isValidUUID = (str: string | undefined | null): boolean => {
  if (!str || typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());
};

export const FloatingChatHead: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false); // Closed / Collapsed by default
  const [isDismissed, setIsDismissed] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [targetUser, setTargetUser] = useState<{ id: string; name: string; avatar_url?: string | null } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadMessageIds, setUnreadMessageIds] = useState<Set<string>>(new Set());
  const [inputText, setInputText] = useState('');

  // Track Drag State
  const [position, setPosition] = useState({ 
    x: typeof window !== 'undefined' ? window.innerWidth - 80 : 0, 
    y: typeof window !== 'undefined' ? window.innerHeight - 100 : 0 
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isOverDismiss, setIsOverDismiss] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Reset target user when active profile changes
  useEffect(() => {
    if (currentUserId) {
      setTargetUser(null);
      setMessages([]);
    }
  }, [currentUserId]);

  const handleSelectThread = async (thread: any) => {
    const partnerId = typeof thread === 'string' 
      ? thread 
      : (thread?.partner_id || thread?.sender_id || thread?.id);

    if (!partnerId) return;

    // 1. Instantly update local React state array for all messages in this thread
    setMessages((prev) =>
      prev.map((msg) =>
        msg.sender_id === partnerId || msg.receiver_id === partnerId
          ? { ...msg, is_read: true }
          : msg
      )
    );

    // 2. Clear unread state in global thread context
    setUnreadMessageIds((prev) => {
      const next = new Set(prev);
      messages
        .filter((m) => m.sender_id === partnerId)
        .forEach((m) => next.delete(String(m.id)));
      return next;
    });

    // 3. Persist to Postgres database via RPC
    const supabase = getSupabase();
    if (partnerId && currentUserId && supabase) {
      try {
        await supabase.rpc('mark_thread_as_read', {
          p_chat_id: partnerId,
          p_profile_id: currentUserId,
        });
      } catch (e) {
        await markChatAsRead(partnerId, currentUserId || undefined);
      }
    } else {
      await markChatAsRead(partnerId, currentUserId || undefined);
    }
  };

  // Explicit Open / Expand handler with read RPC trigger
  const handleOpenChat = (threadId?: string) => {
    const tid = threadId || targetUser?.id;
    setIsOpen(true);
    setIsDismissed(false);
    if (tid && currentUserId) {
      handleSelectThread(tid);
    }
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const newX = e.clientX - 28;
      const newY = e.clientY - 28;
      setPosition({ x: newX, y: newY });

      const dismissX = window.innerWidth / 2;
      const dismissY = window.innerHeight - 80;
      const distance = Math.hypot(newX - dismissX, newY - dismissY);
      setIsOverDismiss(distance < 80);
    };

    const handlePointerUp = () => {
      if (!isDragging) return;
      if (isOverDismiss) {
        setIsDismissed(true);
      }
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, isOverDismiss]);

  // 1. Listen for global "Open Chat" triggers directly in React state
  useEffect(() => {
    const handleTrigger = (e: any) => {
      const { profile_id, name, full_name, username, avatar_url, avatar } = e.detail || {};
      if (profile_id) {
        const tid = profile_id;
        setTargetUser({
          id: tid,
          name: name || full_name || username || 'Direct Signal',
          avatar_url: avatar_url || avatar || null,
        });
        handleOpenChat(tid);
      }
    };

    window.addEventListener('nexus_open_chat' as any, handleTrigger as EventListener);
    window.addEventListener('nexus_open_chat_thread' as any, handleTrigger as EventListener);
    return () => {
      window.removeEventListener('nexus_open_chat' as any, handleTrigger as EventListener);
      window.removeEventListener('nexus_open_chat_thread' as any, handleTrigger as EventListener);
    };
  }, [currentUserId]);

  // Helper to resolve effective sender ID
  const getEffectiveSenderId = async (): Promise<string> => {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) return session.user.id;
      } catch (e) {}
    }

    if (typeof localStorage !== 'undefined') {
      try {
        const sbKey = Object.keys(localStorage).find(k => k.includes('sb-') && k.includes('-auth-token'));
        if (sbKey) {
          const parsed = JSON.parse(localStorage.getItem(sbKey) || '{}');
          if (parsed?.user?.id) return parsed.user.id;
        }
      } catch (e) {}
      try {
        const stored = localStorage.getItem('nexus_core_user_profile') || localStorage.getItem('nexus_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.id) return parsed.id;
        }
      } catch (e) {}
    }

    let guestId = typeof localStorage !== 'undefined' ? localStorage.getItem('nexus_guest_user_id') : null;
    if (!guestId && typeof localStorage !== 'undefined') {
      guestId = `usr_${Date.now()}`;
      localStorage.setItem('nexus_guest_user_id', guestId);
    }
    return guestId || `usr_${Date.now()}`;
  };

  // 2. Sync Authentic Auth Session with local profile fallback
  useEffect(() => {
    const syncUserId = async () => {
      const uid = await getEffectiveSenderId();
      setCurrentUserId(uid);
    };

    syncUserId();

    const supabase = getSupabase();
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.id) {
        setCurrentUserId(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2b. Global Background Listener for Incoming Messages (collapsed by default, no auto read trigger)
  useEffect(() => {
    const supabase = getSupabase();
    if (!currentUserId || !supabase) return;

    const globalChannel = supabase
      .channel(`global_incoming_chats_${currentUserId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'nexus_chats',
        },
        async (payload) => {
          const newMsg = payload.new;
          if (
            (newMsg.receiver_id === currentUserId || newMsg.recipient_id === currentUserId) &&
            newMsg.sender_id !== currentUserId
          ) {
            console.log('[Global Chat Listener] Incoming message detected:', newMsg);

            let senderName = 'New Signal';
            let avatarUrl: string | null = null;

            try {
              const { data: senderProfile } = await supabase
                .from('profiles')
                .select('id, full_name, console_handle, avatar_url')
                .eq('id', newMsg.sender_id)
                .maybeSingle();

              if (senderProfile) {
                const sp = senderProfile as any;
                senderName = sp.full_name || sp.name || sp.console_handle || 'Direct Signal';
                avatarUrl = sp.avatar_url || sp.avatar || null;
              }
            } catch (err) {
              console.warn('[Global Chat Listener] Could not fetch sender profile:', err);
            }

            setTargetUser((prevTarget) => {
              if (prevTarget && prevTarget.id) return prevTarget; // Keep current active chat target!
              return {
                id: newMsg.sender_id,
                name: senderName,
                avatar_url: avatarUrl,
              };
            });
            setIsDismissed(false); // Make floating head visible
            if (!newMsg.is_read) {
              setUnreadMessageIds((prev) => new Set(prev).add(newMsg.id));
            }
            // Do NOT set isOpen = true; keep collapsed until user clicks
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg as ChatMessage];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(globalChannel);
    };
  }, [currentUserId]);

  // 3. Fetch History & Realtime Listener
  useEffect(() => {
    const supabase = getSupabase();
    if (!targetUser?.id || !currentUserId) return;

    const fetchHistory = async () => {
      let localMsgs: ChatMessage[] = [];

      // 1. Load from localStorage first
      let currentUserEmail = '';
      if (typeof localStorage !== 'undefined') {
        try {
          const stored = localStorage.getItem('nexus_core_user_profile') || localStorage.getItem('nexus_user');
          if (stored) {
            const p = JSON.parse(stored);
            if (p?.email) currentUserEmail = p.email.toLowerCase().trim();
          }
          if (currentUserEmail) {
            const saved = localStorage.getItem(`nexus_chats_${currentUserEmail}`);
            if (saved) {
              const chatList = JSON.parse(saved);
              const thread = chatList.find((c: any) =>
                c.id === targetUser.id ||
                c.id?.toLowerCase() === targetUser.id?.toLowerCase() ||
                c.name?.toLowerCase() === targetUser.name?.toLowerCase()
              );
              if (thread?.messages) {
                localMsgs = thread.messages.map((m: any) => ({
                  id: m.id,
                  sender_id: m.sender === 'user' ? currentUserId : targetUser.id,
                  receiver_id: m.sender === 'user' ? targetUser.id : currentUserId,
                  message: m.text,
                  created_at: new Date().toISOString()
                }));
              }
            }
          }
        } catch (e) {}
      }

      // 2. Query Supabase
      let remoteMsgs: ChatMessage[] = [];
      if (supabase && currentUserId && targetUser?.id && isValidUUID(currentUserId) && isValidUUID(targetUser.id)) {
        try {
          const { data, error } = await supabase
            .from('nexus_chats')
            .select('*')
            .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${targetUser.id}),and(sender_id.eq.${targetUser.id},receiver_id.eq.${currentUserId}),and(sender_id.eq.${currentUserId},recipient_id.eq.${targetUser.id}),and(sender_id.eq.${targetUser.id},recipient_id.eq.${currentUserId})`)
            .order('created_at', { ascending: true });

          if (!error && data) {
            remoteMsgs = data;
          }
        } catch (e) {}
      }

      // 3. Combine and set
      const combined = [...localMsgs];
      remoteMsgs.forEach(rm => {
        if (!(combined || []).some(lm => lm.id === rm.id || (lm.message === (rm.message || (rm as any).content)))) {
          combined.push(rm);
        }
      });

      setMessages(combined.length > 0 ? combined : []);
    };

    fetchHistory();

    if (!supabase) return;

    const channel = supabase
      .channel(`direct_chat_${currentUserId}_${targetUser.id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'nexus_chats' },
        (payload) => {
          const incomingMessage = payload.new as ChatMessage;

          // If the user is currently looking at this specific open thread:
          if (isOpen && targetUser?.id === incomingMessage.sender_id) {
            // 1. Mark local message as read immediately
            (incomingMessage as any).is_read = true;

            // 2. Persist to database so it stays read on refresh
            markChatAsRead(incomingMessage.sender_id, currentUserId || undefined);
          }

          if (
            (incomingMessage.sender_id === targetUser.id && (incomingMessage.receiver_id === currentUserId || (incomingMessage as any).recipient_id === currentUserId)) ||
            (incomingMessage.sender_id === currentUserId && (incomingMessage.receiver_id === targetUser.id || (incomingMessage as any).recipient_id === targetUser.id))
          ) {
            setMessages((prev) => {
              const isDuplicate = (prev || []).some(
                (m) =>
                  (incomingMessage.id && m.id === incomingMessage.id) ||
                  (m.sender_id === incomingMessage.sender_id &&
                    (m.message || (m as any).content) === (incomingMessage.message || (incomingMessage as any).content) &&
                    Math.abs(new Date(m.created_at || Date.now()).getTime() - new Date(incomingMessage.created_at || Date.now()).getTime()) < 3000)
              );

              if (isDuplicate) {
                return prev.map((m) =>
                  ((m.message || (m as any).content) === (incomingMessage.message || (incomingMessage as any).content) && m.sender_id === incomingMessage.sender_id) ? incomingMessage : m
                );
              }

              return [...prev, incomingMessage];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [targetUser, currentUserId, isOpen]);

  // 4. Send Message (Direct Write + LocalStorage Sync for Inbox Terminal)
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !targetUser?.id) {
      console.warn('[FloatingChatHead] Send skipped: missing text or targetUser.id');
      return;
    }

    const text = inputText.trim();
    setInputText('');

    const supabase = getSupabase();
    const senderId = currentUserId || (await getEffectiveSenderId());

    // Resolve active user email & profile ID
    let currentUserEmail = '';
    let currentUserProfileId = senderId;
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem('nexus_core_user_profile') || localStorage.getItem('nexus_user');
        if (stored) {
          const p = JSON.parse(stored);
          if (p?.email) currentUserEmail = p.email.toLowerCase().trim();
          if (p?.id) currentUserProfileId = p.id;
        }
      } catch (e) {}
    }

    // Attempt resolving recipient profile email & UUID from Supabase
    let resolvedRecipientId = targetUser.id;
    let recipientEmail = '';
    if (supabase && targetUser.id) {
      try {
        const filterParts: string[] = [];
        if (isValidUUID(targetUser.id)) {
          filterParts.push(`id.eq.${targetUser.id}`);
        }
        if (targetUser.id.includes('@')) {
          filterParts.push(`email.eq.${targetUser.id.toLowerCase().trim()}`);
        } else if (!isValidUUID(targetUser.id)) {
          filterParts.push(`console_handle.eq.${targetUser.id}`);
        }

        if (filterParts.length > 0) {
          const { data: recipientProfile } = await supabase
            .from('profiles')
            .select('id, email')
            .or(filterParts.join(','))
            .maybeSingle();

          if (recipientProfile) {
            if (recipientProfile.id) resolvedRecipientId = recipientProfile.id;
            if (recipientProfile.email) recipientEmail = recipientProfile.email.toLowerCase().trim();
          }
        }
      } catch (e) {}
    }

    if (!recipientEmail) {
      recipientEmail = targetUser.id.includes('@') ? targetUser.id.toLowerCase().trim() : `${targetUser.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@nexus.network`;
    }

    // Optimistic UI Append so message bubble appears instantly
    const tempMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      sender_id: currentUserProfileId || senderId,
      receiver_id: resolvedRecipientId,
      message: text,
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempMsg]);

    // 1. Write to localStorage for user's Inbox Terminal sync
    if (currentUserEmail) {
      try {
        const storageKey = `nexus_chats_${currentUserEmail}`;
        const existingStr = localStorage.getItem(storageKey);
        let chatList: any[] = existingStr ? JSON.parse(existingStr) : [];

        let thread = chatList.find((c: any) =>
          c.id === recipientEmail ||
          c.id === resolvedRecipientId ||
          c.name?.toLowerCase() === targetUser.name.toLowerCase()
        );

        if (!thread) {
          thread = {
            id: recipientEmail,
            name: targetUser.name,
            avatar: targetUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            role: 'User',
            roleBadge: 'USER',
            roleColor: 'text-purple-400 bg-purple-955/10 border-purple-900/30',
            online: true,
            unread: 0,
            messages: []
          };
          chatList.push(thread);
        }

        const formattedMsg = {
          id: `sent-${Date.now()}`,
          sender: 'user',
          text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          rawTime: Date.now()
        };

        if (!thread.messages) thread.messages = [];
        thread.messages.push(formattedMsg);

        localStorage.setItem(storageKey, JSON.stringify(chatList));
      } catch (e) {
        console.warn('[FloatingChatHead] Local storage sync error:', e);
      }
    }

    // 2. Supabase DB Insert
    if (supabase) {
      try {
        const insertSender = currentUserProfileId || senderId;
        const insertReceiver = resolvedRecipientId;

        const { data, error } = await supabase.from('nexus_chats').insert([{
          sender_id: insertSender,
          receiver_id: insertReceiver,
          recipient_id: insertReceiver,
          message: text,
          content: text,
          is_read: false
        }]).select();

        if (error) {
          console.warn('[FloatingChatHead] Supabase DB Insert warning:', error.message);
        } else {
          console.log('✅ [FloatingChatHead] Supabase DB Insert success:', data);
        }

        // Notification Insert using UUID
        const receiverUUID = insertReceiver && extractUUID(insertReceiver);
        if (receiverUUID) {
          const newNotifId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '00000000-0000-0000-0000-000000000000';
          await supabase
            .from('nexus_notifications')
            .insert([{
              id: newNotifId,
              user_id: receiverUUID,
              title: '💬 NEW MESSAGE',
              message: `New message from ${currentUserEmail || 'Contact'}: "${text.substring(0, 60)}"`,
              category: 'CHAT',
              type: 'chat_message',
              is_read: false,
              created_at: new Date().toISOString()
            }]);
        }
      } catch (err) {
        console.warn('[FloatingChatHead] Non-blocking exception sending message:', err);
      }
    }

    // 3. Dispatch global sync event for Inbox Terminal
    window.dispatchEvent(new CustomEvent('nexus_chats_updated'));
  };

  if (!isOpen) {
    if (isDismissed || !targetUser) return null;

    const totalUnreadCount = messages.filter(
      (msg) => ((msg as any).is_read === false || (msg as any).is_read === null) && msg.sender_id !== currentUserId
    ).length;

    return (
      <>
        <div 
          className="fixed z-[10000000] flex items-center space-x-2"
          style={{ left: position.x, top: position.y, touchAction: 'none' }}
        >
          <div className="relative group">
            {/* Small Dismiss / Hide Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDismissed(true);
              }}
              className="absolute -top-1.5 -left-1.5 z-20 w-5 h-5 rounded-full bg-zinc-950 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-red-600 hover:border-red-500 flex items-center justify-center transition-all shadow-lg cursor-pointer"
              title="Dismiss Floating Head"
            >
              <X size={12} />
            </button>

            {/* Main Avatar Button */}
            <button
              type="button"
              onPointerDown={(e) => {
                setIsDragging(true);
                dragStartPos.current = { x: e.clientX, y: e.clientY };
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
              onPointerUp={(e) => {
                setIsDragging(false);
                e.currentTarget.releasePointerCapture(e.pointerId);
                if (isOverDismiss) {
                  setIsDismissed(true);
                } else {
                  const dist = Math.hypot(e.clientX - dragStartPos.current.x, e.clientY - dragStartPos.current.y);
                  if (dist < 10) {
                    handleOpenChat(targetUser.id);
                  }
                }
              }}
              className={`relative w-14 h-14 rounded-full bg-zinc-900 border-2 ${
                totalUnreadCount > 0
                  ? 'border-violet-500 shadow-[0_0_25px_rgba(124,58,237,0.6)]'
                  : 'border-zinc-700 shadow-xl'
              } flex items-center justify-center transition-all ${
                isDragging ? 'scale-110 cursor-grabbing' : 'hover:scale-110 cursor-grab active:scale-95'
              }`}
              title={`Open Chat with ${targetUser.name}`}
            >
              {targetUser.avatar_url ? (
                <img
                  src={targetUser.avatar_url}
                  alt={targetUser.name}
                  className="w-full h-full rounded-full object-cover pointer-events-none"
                />
              ) : (
                <span className="font-extrabold text-violet-400 text-sm pointer-events-none">
                  {targetUser.name.substring(0, 2).toUpperCase()}
                </span>
              )}

              {/* Glowing Unread Badge Counter */}
              {totalUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white shadow-lg ring-2 ring-black animate-pulse">
                  {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                </span>
              )}

              {/* Active Pulse Status */}
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-zinc-950 rounded-full pointer-events-none" />
            </button>
          </div>
        </div>

        {isDragging && (
          <div className="fixed inset-0 z-[9999999] pointer-events-none flex flex-col justify-end items-center pb-20">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${isOverDismiss ? 'bg-red-600 scale-125 text-white shadow-[0_0_30px_rgba(220,38,38,0.8)]' : 'bg-zinc-800/80 text-zinc-400 scale-100 backdrop-blur-sm border border-zinc-700/50'}`}>
              <X size={24} />
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[10000000] w-80 sm:w-96 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl flex flex-col overflow-hidden text-white">
      <div className="flex items-center justify-between p-3 bg-zinc-950 border-b border-zinc-800">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-sm truncate">{targetUser?.name}</span>
        </div>
        <div className="flex items-center space-x-1">
          <button onClick={() => setIsOpen(false)} className="p-1 text-zinc-400 hover:text-white cursor-pointer" title="Minimize / Collapse">
            <Minimize2 size={16} />
          </button>
          <button onClick={() => { setIsOpen(false); setIsDismissed(true); }} className="p-1 text-zinc-400 hover:text-white cursor-pointer" title="Close & Dismiss">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="h-72 overflow-y-auto p-3 space-y-2 bg-zinc-900/50">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-zinc-500">
            No direct messages yet.
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-3 py-1.5 rounded-lg text-xs ${
                  isMe ? 'bg-red-950 text-red-100 border border-red-900/50' : 'bg-zinc-800 text-zinc-200 border border-zinc-700/50'
                }`}>
                  {msg.message || (msg as any).content}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSend} className="p-2 bg-zinc-950 border-t border-zinc-800 flex items-center space-x-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Write a message..."
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-red-600"
        />
        <button type="submit" className="p-2 bg-red-700 hover:bg-red-600 text-white rounded cursor-pointer">
          <Send size={14} />
        </button>
      </form>
    </div>
  );
};

export { openFloatingChat };
export default FloatingChatHead;
