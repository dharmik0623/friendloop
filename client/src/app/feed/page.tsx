'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import CreatePost from '@/components/post/CreatePost';
import PostCard from '@/components/post/PostCard';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

export default function FeedPage() {
  const { isAuthenticated, user, checkAuth, isLoading: authLoading } = useAuthStore();
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
      fetchPosts();
    }
  }, [isAuthenticated]);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts');
      setPosts(res.data);
    } catch (error) {
      console.error('Failed to fetch posts', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost: any) => {
    setPosts([newPost, ...posts]);
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
        <CreatePost onPostCreated={handlePostCreated} />
        
        <div className="mt-8 space-y-4">
          {loading ? (
            <div className="text-center py-10 text-slate-500">Loading feed...</div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post._id} post={post} onDelete={handlePostDeleted} />
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <h3 className="text-lg font-medium text-slate-900">Your feed is empty</h3>
              <p className="mt-1 text-slate-500">Add friends or create a post to see content here.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
