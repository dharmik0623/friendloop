'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/services/api';
import Link from 'next/link';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    age: searchParams.get('age') || '',
    place: searchParams.get('place') || ''
  });

  useEffect(() => {
    handleSearch();
  }, [query, filters]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      let url = `/users/search?q=${query}`;
      if (filters.age) url += `&age=${filters.age}`;
      if (filters.place) url += `&place=${filters.place}`;
      
      const res = await api.get(url);
      setUsers(res.data);
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Search Results {query ? `for "${query}"` : ''}
          </h1>
          
          <div className="flex gap-2">
            <input 
              type="number" 
              placeholder="Age" 
              className="w-20 px-3 py-1.5 rounded-md border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
              value={filters.age}
              onChange={(e) => setFilters({...filters, age: e.target.value})}
            />
            <input 
              type="text" 
              placeholder="Place" 
              className="px-3 py-1.5 rounded-md border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
              value={filters.place}
              onChange={(e) => setFilters({...filters, place: e.target.value})}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-500">Searching...</div>
        ) : users.length > 0 ? (
          <div className="space-y-4">
            {users.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold overflow-hidden border border-indigo-200">
                      {user.profile_picture_url ? (
                        <img src={user.profile_picture_url} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        user.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <Link href={`/profile/${user.id}`} className="font-semibold text-slate-900 hover:text-indigo-600">
                        {user.first_name} {user.last_name}
                      </Link>
                      <p className="text-sm text-slate-500">@{user.username}</p>
                    </div>
                  </div>
                  <Link href={`/profile/${user.id}`}>
                    <Button variant="outline" size="sm">View Profile</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-500">
            No users found matching your search.
          </div>
        )}
      </main>
    </div>
  );
}
