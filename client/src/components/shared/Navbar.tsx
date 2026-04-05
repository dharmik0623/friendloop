'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { Button } from '../ui/button';
import { LogOut, User, Home, MessageSquare, Users, Bookmark } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import NotificationDropdown from './NotificationDropdown';
import SpidermanNotification from './SpidermanNotification';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { showSpiderman, setShowSpiderman, toggleCenterOverlay } = useNotificationStore();
  const router = useRouter();
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRequestCount();
    }
  }, [isAuthenticated]);

  const fetchRequestCount = async () => {
    try {
      const res = await api.get('/friendships/requests');
      setRequestCount(res.data.length);
    } catch (error) {
      console.error('Failed to fetch request count', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleWebThrow = () => {
    // 1. Zoom the bell/notification (already handled by NotificationDropdown via isCenterOverlay state)
    toggleCenterOverlay(true);
    // 2. Hide spiderman after action
    setShowSpiderman(false);
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <SpidermanNotification 
        show={showSpiderman} 
        onWebThrow={handleWebThrow} 
      />
      
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4 flex-1 max-w-md ml-8">
              {/* ... search bar ... */}
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full bg-slate-100 border-0 rounded-full py-1.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      router.push(`/search?q=${(e.target as HTMLInputElement).value}`);
                    }
                  }}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link href="/feed">
                <div className="glitch-wrapper">
                  <div className="glitch-btn">
                    <Home className="w-4 h-4" />
                    <span className="hidden lg:inline">Feed</span>
                    <span className="glitch-btn__glitch"></span>
                  </div>
                </div>
              </Link>
              <Link href="/friends/requests">
                <div className="glitch-wrapper" style={{ width: '110px' }}>
                  <div className="glitch-btn">
                    <Users className="w-4 h-4" />
                    <span className="hidden lg:inline">Reqs</span>
                    {requestCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white z-20">
                        {requestCount}
                      </span>
                    )}
                    <span className="glitch-btn__glitch"></span>
                  </div>
                </div>
              </Link>
              <Link href="/messages">
                <div className="glitch-wrapper" style={{ width: '110px' }}>
                  <div className="glitch-btn">
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden lg:inline">Chats</span>
                    <span className="glitch-btn__glitch"></span>
                  </div>
                </div>
              </Link>
              <Link href="/saved">
                <div className="glitch-wrapper">
                  <div className="glitch-btn">
                    <Bookmark className="w-4 h-4" />
                    <span className="hidden lg:inline">Saved</span>
                    <span className="glitch-btn__glitch"></span>
                  </div>
                </div>
              </Link>
              <NotificationDropdown />
              <Link href="/profile">
                <div className="glitch-wrapper">
                  <div className="glitch-btn">
                    <User className="w-4 h-4" />
                    <span className="hidden lg:inline">Profile</span>
                    <span className="glitch-btn__glitch"></span>
                  </div>
                </div>
              </Link>
              <div className="h-6 w-px bg-slate-200 mx-1"></div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
