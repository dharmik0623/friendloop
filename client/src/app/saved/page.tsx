'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import PostCard from '@/components/post/PostCard';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { Bookmark } from 'lucide-react';

export default function SavedPostsPage() {
  const { isAuthenticated, checkAuth, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedPosts();
    }
  }, [isAuthenticated]);

  const fetchSavedPosts = async () => {
    try {
      const res = await api.get('/posts/saved');
      setPosts(res.data);
    } catch (error) {
      console.error('Failed to fetch saved posts', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostDeleted = (postId: string) => {
    setPosts(posts.filter(p => p._id !== postId));
  };

  if (authLoading || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-pulse flex items-center gap-2"><div className="w-4 h-4 bg-indigo-600 rounded-full animate-bounce"></div><div className="w-4 h-4 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: "0.1s"}}></div><div className="w-4 h-4 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div></div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <Bookmark className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Saved Posts</h1>
            <p className="text-slate-500 text-sm">Posts you've bookmarked to read later</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10 text-slate-500">Loading saved posts...</div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post._id} post={post} onDelete={handlePostDeleted} />
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bookmark className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No saved posts yet</h3>
              <p className="mt-2 text-slate-500 max-w-sm mx-auto">When you see a post you want to keep visible, click the bookmark icon on it to save it here.</p>
              <button 
                onClick={() => router.push('/feed')}
                className="mt-6 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-medium transition-colors"
              >
                Go to Feed
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
