'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/services/api';
import Link from 'next/link';
import { UserCheck, UserX, Clock } from 'lucide-react';

export default function FriendRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/friendships/requests');
      setRequests(res.data);
    } catch (error) {
      console.error('Failed to fetch requests', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (userId: string | number) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    try {
      await api.put(`/friendships/accept/${userId}`);
      setRequests(requests.filter(r => r.requester_id !== userId));
    } catch (error) {
      console.error('Failed to accept request', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleReject = async (userId: string | number) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    try {
      await api.put(`/friendships/reject/${userId}`);
      setRequests(requests.filter(r => r.requester_id !== userId));
    } catch (error) {
      console.error('Failed to reject request', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-slate-900">Friend Requests</h1>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-500">Loading requests...</div>
        ) : requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold overflow-hidden border border-indigo-200">
                      {request.profile_picture_url ? (
                        <img src={request.profile_picture_url} alt={request.username} className="w-full h-full object-cover" />
                      ) : (
                        request.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <Link href={`/profile/${request.requester_id}`} className="font-semibold text-slate-900 hover:text-indigo-600">
                        {request.first_name} {request.last_name}
                      </Link>
                      <p className="text-sm text-slate-500">@{request.username}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleAccept(request.requester_id)} 
                      disabled={actionLoading[request.requester_id]}
                      size="sm" 
                      className="bg-indigo-600 hover:bg-indigo-700 h-9 px-4"
                    >
                      <UserCheck className="w-4 h-4 mr-2" /> Accept
                    </Button>
                    <Button 
                      onClick={() => handleReject(request.requester_id)} 
                      disabled={actionLoading[request.requester_id]}
                      variant="outline" 
                      size="sm"
                      className="h-9 px-4 text-slate-600 border-slate-200"
                    >
                      <UserX className="w-4 h-4 mr-2" /> Ignore
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-500">
            <p>No pending friend requests.</p>
            <Link href="/search?q=" className="text-indigo-600 hover:underline mt-2 inline-block text-sm">Find people to connect with</Link>
          </div>
        )}
      </main>
    </div>
  );
}
