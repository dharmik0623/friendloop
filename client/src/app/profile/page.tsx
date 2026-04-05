'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { Camera, Bookmark, Image as ImageIcon } from 'lucide-react';
import PostCard from '@/components/post/PostCard';

export default function ProfilePage() {
  const { isAuthenticated, user, checkAuth, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    profile_picture_url: '',
    age: '',
    place: '',
    is_public: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
        profile_picture_url: user.profile_picture_url || '',
        age: user.age?.toString() || '',
        place: user.place || '',
        is_public: user.is_public || false
      });
    }
  }, [isAuthenticated, authLoading, router, user]);

  useEffect(() => {
    if (user && !isEditing) {
      fetchUserContent();
    }
  }, [user, isEditing]);

  const fetchUserContent = async () => {
    setLoadingContent(true);
    try {
      const [postsRes, savedRes] = await Promise.all([
        api.get(`/posts/user/${user?.id}`),
        api.get('/posts/saved')
      ]);
      setMyPosts(postsRes.data);
      setSavedPosts(savedRes.data);
    } catch (err) {
      console.error('Failed to fetch user content', err);
    } finally {
      setLoadingContent(false);
    }
  };

  const handlePostDeleted = (postId: string) => {
    setMyPosts(myPosts.filter(p => p._id !== postId));
    setSavedPosts(savedPosts.filter(p => p._id !== postId));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: target.checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');
    
    try {
      await api.put('/users', formData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      checkAuth(); // Refresh user data in store
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || !isAuthenticated || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-pulse flex items-center gap-2"><div className="w-4 h-4 bg-indigo-600 rounded-full animate-bounce"></div><div className="w-4 h-4 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: "0.1s"}}></div><div className="w-4 h-4 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div></div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative"></div>
          
          <CardHeader className="relative pt-0 pb-4">
            <div className="flex justify-between items-end -mt-12 mb-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-white bg-white overflow-hidden flex items-center justify-center text-3xl font-bold text-slate-300">
                  {formData.profile_picture_url ? (
                    <img src={formData.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user.username.charAt(0).toUpperCase()
                  )}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full border-2 border-white shadow-sm hover:bg-indigo-700 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {!isEditing && (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
            
            <CardTitle className="text-2xl font-bold">{user.first_name} {user.last_name}</CardTitle>
            <p className="text-slate-500 font-medium">@{user.username}</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">{error}</div>}
            {success && <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">{success}</div>}
            
            {isEditing ? (
              <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <Input label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} />
                 <Input label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <Input label="Age" name="age" type="number" value={formData.age} onChange={handleChange} />
                 <Input label="Place" name="place" value={formData.place} onChange={handleChange} />
               </div>
               <Input label="Profile Picture URL" name="profile_picture_url" value={formData.profile_picture_url} onChange={handleChange} placeholder="https://example.com/avatar.jpg" />
               <div className="space-y-1.5">
                 <label className="text-sm font-medium leading-none">Bio</label>
                 <textarea 
                   name="bio"
                   value={formData.bio}
                   onChange={handleChange}
                   className="flex min-h-[100px] w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                   placeholder="Tell us about yourself..."
                 />
               </div>
               <div className="flex items-center space-x-2 pt-2 pb-1">
                 <input 
                   type="checkbox" 
                   id="is_public" 
                   name="is_public" 
                   checked={formData.is_public} 
                   onChange={handleChange}
                   className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" 
                 />
                 <label htmlFor="is_public" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                   Make Profile Public (Anyone can view or search for it)
                 </label>
               </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-1">About Me</h4>
                  <p className="text-slate-700">{user.bio || "No bio added yet."}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-1">Email</h4>
                  <p className="text-slate-700">{user.email}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-1">Age</h4>
                    <p className="text-slate-700">{user.age || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-1">Place</h4>
                    <p className="text-slate-700">{user.place || "N/A"}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-1">Privacy</h4>
                  <p className="text-slate-700">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${user.is_public ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                      {user.is_public ? 'Public Profile' : 'Private Profile'}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          
          {isEditing && (
            <CardFooter className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 pt-6">
              <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          )}
        </Card>
        
        {!isEditing && (
          <div className="mt-8">
            <div className="flex border-b border-slate-200 mb-6">
              <button
                className={`flex-1 py-3 text-sm font-medium border-b-2 flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'posts'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
                onClick={() => setActiveTab('posts')}
              >
                <ImageIcon className="w-4 h-4" />
                My Posts ({myPosts.length})
              </button>
              <button
                className={`flex-1 py-3 text-sm font-medium border-b-2 flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'saved'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
                onClick={() => setActiveTab('saved')}
              >
                <Bookmark className="w-4 h-4" />
                Saved ({savedPosts.length})
              </button>
            </div>

            <div className="space-y-4">
              {loadingContent ? (
                <div className="py-12 text-center text-slate-500">Loading content...</div>
              ) : activeTab === 'posts' ? (
                myPosts.length > 0 ? (
                  myPosts.map((post) => (
                    <PostCard key={post._id} post={post} onDelete={handlePostDeleted} />
                  ))
                ) : (
                  <Card className="bg-slate-50 border-dashed border-2 py-12 text-center shadow-none">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
                      <ImageIcon className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium">No posts yet.</p>
                    <p className="text-slate-400 text-sm mt-1">Share something with your friends!</p>
                  </Card>
                )
              ) : (
                savedPosts.length > 0 ? (
                  savedPosts.map((post) => (
                    <PostCard key={post._id} post={post} onDelete={handlePostDeleted} />
                  ))
                ) : (
                  <Card className="bg-slate-50 border-dashed border-2 py-12 text-center shadow-none">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
                      <Bookmark className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium">No saved posts.</p>
                    <p className="text-slate-400 text-sm mt-1">Bookmark posts you want to see here.</p>
                  </Card>
                )
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
