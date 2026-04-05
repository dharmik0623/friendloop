'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import PostCard from '@/components/post/PostCard';
import { UserPlus, UserCheck, Clock, UserMinus } from 'lucide-react';

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id;
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [profileUser, setProfileUser] = useState<any>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'pending_sent' | 'pending_received' | 'accepted'>('none');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      if (currentUser && Number(userId) === Number(currentUser.id)) {
        router.push('/profile');
        return;
      }
      fetchProfileAndStatus();
    }
  }, [userId, currentUser]);

  const fetchProfileAndStatus = async () => {
    setLoading(true);
    try {
      // 1. Fetch User Profile
      const userRes = await api.get(`/users/${userId}`);
      setProfileUser(userRes.data);

      // 2. Fetch Friendship Status
      const [friendsRes, incomingRes, sentRes] = await Promise.all([
        api.get('/friendships'),
        api.get('/friendships/requests'),
        api.get('/friendships/requests/sent')
      ]);

      const isFriend = friendsRes.data.some((f: any) => Number(f.id) === Number(userId));
      if (isFriend) {
        setFriendshipStatus('accepted');
      } else {
        const isIncoming = incomingRes.data.some((r: any) => Number(r.requester_id) === Number(userId));
        if (isIncoming) {
          setFriendshipStatus('pending_received');
        } else {
          const isSent = sentRes.data.some((r: any) => Number(r.addressee_id) === Number(userId));
          if (isSent) {
            setFriendshipStatus('pending_sent');
          } else {
            setFriendshipStatus('none');
          }
        }
      }

      // 3. Fetch User's Posts (Mock or Real)
      // For now, let's just show a few if they are friends
      if (isFriend) {
          const postsRes = await api.get(`/posts/user/${userId}`);
          setPosts(postsRes.data);
      }

    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async () => {
    setActionLoading(true);
    try {
      await api.post(`/friendships/request/${userId}`);
      setFriendshipStatus('pending_sent');
    } catch (error) {
      console.error('Failed to send request', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptFriend = async () => {
    setActionLoading(true);
    try {
      await api.put(`/friendships/accept/${userId}`);
      setFriendshipStatus('accepted');
    } catch (error) {
      console.error('Failed to accept request', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!window.confirm('Are you sure you want to remove this friend?')) return;
    setActionLoading(true);
    try {
      await api.delete(`/friendships/remove/${userId}`);
      setFriendshipStatus('none');
      setPosts([]); // clear posts since we aren't friends anymore
    } catch (error) {
      console.error('Failed to remove friend', error);
      alert('Failed to remove friend');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading profile...</div>;
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="text-center py-20 text-slate-500">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Card className="overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
          <CardHeader className="relative pt-0 pb-4">
            <div className="flex justify-between items-end -mt-12 mb-4">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-white overflow-hidden flex items-center justify-center text-3xl font-bold text-slate-300 shadow-sm">
                {profileUser.profile_picture_url ? (
                  <img src={profileUser.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  profileUser.username.charAt(0).toUpperCase()
                )}
              </div>
              
              <div className="pb-2">
                {friendshipStatus === 'none' && (
                  <Button onClick={handleAddFriend} disabled={actionLoading} className="gap-2 bg-indigo-600">
                    <UserPlus className="w-4 h-4" /> Add Friend
                  </Button>
                )}
                {friendshipStatus === 'pending_sent' && (
                  <Button disabled variant="outline" className="gap-2">
                    <Clock className="w-4 h-4" /> Request Sent
                  </Button>
                )}
                {friendshipStatus === 'pending_received' && (
                  <Button onClick={handleAcceptFriend} disabled={actionLoading} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                    <UserCheck className="w-4 h-4" /> Accept Request
                  </Button>
                )}
                {friendshipStatus === 'accepted' && (
                  <Button 
                    onClick={handleRemoveFriend} 
                    disabled={actionLoading} 
                    variant="danger" 
                    className="gap-2"
                  >
                    <UserMinus className="w-4 h-4" /> Remove Friend
                  </Button>
                )}
              </div>
            </div>
            
            <CardTitle className="text-2xl font-bold text-slate-900">
              {profileUser.first_name} {profileUser.last_name}
            </CardTitle>
            <p className="text-slate-500 font-medium">@{profileUser.username}</p>
          </CardHeader>
          
          <CardContent>
            <p className="text-slate-700">{profileUser.bio || "No bio yet."}</p>
          </CardContent>
        </Card>

        {friendshipStatus === 'accepted' ? (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Posts</h3>
            {posts.length > 0 ? (
              posts.map(post => <PostCard key={post._id} post={post} />)
            ) : (
              <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-500">
                No posts yet.
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-700">
            <p className="font-medium">You must be friends to see {profileUser.first_name}'s posts.</p>
          </div>
        )}
      </main>
    </div>
  );
}
