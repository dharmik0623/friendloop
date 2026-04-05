'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, UserPlus, Heart, MessageSquare, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function NotificationDropdown() {
  const { user, token } = useAuthStore();
  const { 
    notifications, 
    unreadCount, 
    fetchNotifications, 
    addNotification, 
    markAsRead, 
    markAllAsRead,
    isCenterOverlay,
    toggleCenterOverlay 
  } = useNotificationStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (user && token) {
      fetchNotifications();

      const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
        auth: { token }
      });

      socket.on('receive_notification', (notification) => {
        addNotification(notification);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user, token]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) markAllAsRead();
  };

  const handleNotificationClick = async (notif: any) => {
    await markAsRead(notif._id);
    setIsOpen(false);
    toggleCenterOverlay(false);
    
    if (notif.type === 'message') {
        router.push('/messages');
    } else if (notif.type === 'friend_request' || notif.type === 'friend_accept') {
        router.push('/friends/requests');
    } else if (notif.referenceId) {
        router.push(`/post/${notif.referenceId}`);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-red-500 fill-red-500" />;
      case 'comment': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'message': return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'friend_request': return <UserPlus className="w-4 h-4 text-indigo-500" />;
      case 'friend_accept': return <Check className="w-4 h-4 text-green-500" />;
      default: return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        id="notification-bell"
        variant="ghost" 
        size="sm" 
        className={`relative h-9 w-9 p-0 transition-all duration-300 ${isCenterOverlay ? 'scale-150 rotate-[360deg] z-[100]' : ''}`}
        onClick={toggleDropdown}
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        )}
      </Button>

      <AnimatePresence>
        {(isOpen || isCenterOverlay) && (
          <>
            {/* Backdrop for 3D Overlay */}
            {isCenterOverlay && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100]"
                onClick={() => toggleCenterOverlay(false)}
              />
            )}

            <motion.div 
              initial={isCenterOverlay ? { scale: 0, x: '-50%', y: '-50%', opacity: 0 } : { opacity: 0, y: 10 }}
              animate={isCenterOverlay ? { scale: 1, x: '-50%', y: '-50%', opacity: 1 } : { opacity: 1, y: 0 }}
              exit={isCenterOverlay ? { scale: 0, x: '-50%', y: '-50%', opacity: 0 } : { opacity: 0, y: 10 }}
              className={`
                ${isCenterOverlay 
                    ? 'fixed top-1/2 left-1/2 w-[90vw] max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 z-[101] overflow-hidden' 
                    : 'absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-[100] overflow-hidden'
                }
              `}
            >
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-900">Notifications</h3>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => addNotification({
                            _id: 'test-' + Date.now(),
                            senderId: 0,
                            senderName: 'Spidey Test',
                            type: 'message',
                            content: 'Web throw test! Click Spiderman!',
                            read: false,
                            createdAt: new Date().toISOString()
                        })} 
                        className="text-[10px] text-slate-400 hover:text-red-500 font-bold uppercase tracking-wider transition-colors"
                    >
                        🚨 Test
                    </button>
                    {unreadCount > 0 && (
                        <button onClick={() => markAllAsRead()} className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Mark all as read</button>
                    )}
                    {isCenterOverlay && (
                       <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => toggleCenterOverlay(false)}>
                            <X className="w-4 h-4" />
                       </Button>
                    )}
                </div>
              </div>
              
              <div className="max-h-[500px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                      <Bell className="w-6 h-6" />
                    </div>
                    <p className="text-slate-500 text-sm">No notifications yet.</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif._id} 
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-4 border-b border-slate-50 last:border-0 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${!notif.read ? 'bg-indigo-50/30' : ''}`}
                    >
                      <div className="mt-1 bg-white p-1.5 rounded-lg shadow-sm border border-slate-100">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-900 leading-snug">
                          <span className="font-semibold">{notif.senderName}</span>
                          {notif.type === 'like' && ' liked your post.'}
                          {notif.type === 'comment' && ' commented on your post.'}
                          {notif.type === 'message' && ` sent you a message: "${notif.content}"`}
                          {notif.type === 'friend_request' && ' sent you a friend request.'}
                          {notif.type === 'friend_accept' && ' accepted your friend request.'}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!notif.read && (
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 self-start" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
