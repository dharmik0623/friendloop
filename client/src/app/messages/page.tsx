'use client';

import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/shared/Navbar';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Send, MessageSquare, Trash2 } from 'lucide-react';

export default function MessagesPage() {
  const { isAuthenticated, user, checkAuth, isLoading: authLoading, token } = useAuthStore();
  const router = useRouter();
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch Friends List for sidebar
  useEffect(() => {
    const fetchFriends = async () => {
      if (isAuthenticated) {
        try {
          const res = await api.get('/chat/friends');
          const spideyBot = {
            id: 9999,
            username: 'spidey_bot',
            first_name: 'Spidey',
            last_name: 'Bot',
            profile_picture_url: 'https://upload.wikimedia.org/wikipedia/en/2/21/Web_of_Spider-Man_Vol_1_118-1.png'
          };
          setFriends([spideyBot, ...res.data]);
        } catch (error) {
          console.error("Failed to fetch friends", error);
        }
      }
    };
    fetchFriends();
  }, [isAuthenticated]);

  // Handle Socket Connection
  useEffect(() => {
    if (isAuthenticated && token) {
      const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
        auth: { token }
      });
      setSocket(newSocket);

      // Listen for incoming messages
      newSocket.on('receive_message', (message) => {
        setMessages((prev) => [...prev, message]);
      });

      newSocket.on('message_sent', (message) => {
         setMessages((prev) => [...prev, message]);
      });

      newSocket.on('user_typing', ({ userId: typingUserId }) => {
        if (selectedFriend && Number(typingUserId) === Number(selectedFriend.id)) {
           setTypingUsers((prev) => [...new Set([...prev, typingUserId])]);
        }
      });

      newSocket.on('user_stopped_typing', ({ userId: typingUserId }) => {
        setTypingUsers((prev) => prev.filter(id => id !== typingUserId));
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, token]);

  // Load chat history when friend selected
  useEffect(() => {
    const fetchHistory = async () => {
      if (selectedFriend) {
        try {
          const res = await api.get(`/chat/${selectedFriend.id}`);
          setMessages(res.data);
        } catch (error) {
          console.error("Failed to fetch chat history", error);
        }
      }
    };
    fetchHistory();
  }, [selectedFriend]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket || !selectedFriend) return;

    socket.emit('send_message', {
      receiverId: selectedFriend.id,
      content: inputMessage.trim(),
    });
    
    socket.emit('typing_stop', { receiverId: selectedFriend.id });
    setInputMessage('');
  };

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const handleTyping = (value: string) => {
    setInputMessage(value);
    if (!socket || !selectedFriend) return;
    
    // Typing Start
    if (value.trim() && !isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing_start', { receiverId: selectedFriend.id });
    }

    // Debounced Typing Stop
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        socket.emit('typing_stop', { receiverId: selectedFriend.id });
      }
    }, 3000);

    if (!value.trim() && isTypingRef.current) {
        isTypingRef.current = false;
        socket.emit('typing_stop', { receiverId: selectedFriend.id });
    }
  };

  if (authLoading || !isAuthenticated || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-pulse flex items-center gap-2"><div className="w-4 h-4 bg-indigo-600 rounded-full animate-bounce"></div><div className="w-4 h-4 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: "0.1s"}}></div><div className="w-4 h-4 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div></div></div>;
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <Navbar />
      
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex overflow-hidden">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex w-full overflow-hidden">
          
          {/* Sidebar */}
          <div className="w-1/3 border-r border-slate-200 flex flex-col bg-white">
            <div className="p-4 border-b border-slate-100 flex items-center">
              <h2 className="text-xl font-bold">Messages</h2>
            </div>
            <div className="p-3 border-b border-slate-100">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                   placeholder="Search friends..." 
                   className="w-full bg-slate-50 rounded-md pl-9 pr-4 py-2 text-sm border-none focus:ring-2 focus:ring-indigo-100"
                 />
               </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {friends.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-sm">No friends to chat with yet.</div>
              ) : (
                friends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => setSelectedFriend(friend)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition text-left border-b border-slate-50 ${selectedFriend?.id === friend.id ? 'bg-indigo-50 hover:bg-indigo-50' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 flex-shrink-0 overflow-hidden">
                      {friend.profile_picture_url ? (
                        <img src={friend.profile_picture_url} className="w-full h-full object-cover" />
                      ) : (
                        friend.username.charAt(0)
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-semibold text-slate-900 truncate">{friend.first_name} {friend.last_name}</p>
                      <p className="text-sm text-slate-500 truncate">@{friend.username}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
          
          {/* Chat Window */}
          <div className="flex-1 flex flex-col bg-slate-50 relative">
            {selectedFriend ? (
              <>
                <div className="h-16 px-6 border-b border-slate-200 bg-white flex items-center justify-between shadow-sm z-10 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 overflow-hidden">
                      {selectedFriend.profile_picture_url ? (
                        <img src={selectedFriend.profile_picture_url} className="w-full h-full object-cover" />
                      ) : (
                        selectedFriend.username.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold leading-tight">{selectedFriend.first_name} {selectedFriend.last_name}</h3>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={async () => {
                        if (confirm(`Clear all messages with ${selectedFriend.first_name}?`)) {
                            try {
                                await api.delete(`/chat/${selectedFriend?.id}`);
                                setMessages([]);
                            } catch (error) {
                                console.error("Failed to clear chat", error);
                            }
                        }
                    }} 
                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Chat
                  </Button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center flex-col text-slate-400">
                      <MessageSquare className="w-12 h-12 mb-2 opacity-50" />
                      <p>Start a conversation with {selectedFriend.first_name}</p>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isMine = msg.sender_id === Number(user.id);
                      return (
                        <div key={index} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                            isMine ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-tl-sm'
                          }`}>
                            {msg.content}
                          </div>
                        </div>
                      )
                    })
                  )}
                  {typingUsers.length > 0 && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 text-slate-500 rounded-full px-4 py-1 text-xs animate-pulse italic">
                        {selectedFriend.first_name} is typing...
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="p-4 bg-white border-t border-slate-200">
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <Input 
                      className="flex-1 rounded-full px-4"
                      placeholder="Type a message..."
                      value={inputMessage}
                      onChange={(e) => handleTyping(e.target.value)}
                    />
                    <Button type="submit" className="rounded-full w-10 h-10 p-0 flex items-center justify-center disabled:opacity-50" disabled={!inputMessage.trim()}>
                      <Send className="w-4 h-4 ml-1" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Send className="w-8 h-8 text-slate-300 -ml-1 mt-1" />
                </div>
                <h3 className="text-xl font-medium text-slate-500">Your Messages</h3>
                <p className="mt-2 text-sm">Select a friend to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
