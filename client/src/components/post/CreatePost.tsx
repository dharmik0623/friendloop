import { useState } from 'react';
import { Camera, Film, X, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

interface CreatePostProps {
  onPostCreated: (post: any) => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setImages(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setVideos(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0 && videos.length === 0) return;

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('content', content);
      images.forEach(file => formData.append('images', file));
      videos.forEach(file => formData.append('videos', file));

      const res = await api.post('/posts', formData);

      onPostCreated(res.data);
      setContent('');
      setImages([]);
      setVideos([]);
      setPreviews([]);
    } catch (err) {
      setError('Failed to create post. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6 overflow-hidden border-indigo-100 shadow-sm">
      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-700 font-bold uppercase overflow-hidden border border-indigo-200">
              {user?.profile_picture_url ? (
                <img src={user.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.username?.charAt(0) || 'U'
              )}
            </div>
            <textarea
              className="w-full resize-none border-0 bg-transparent focus:ring-0 text-slate-800 placeholder:text-slate-400 p-2 text-lg"
              placeholder="What's on your mind?"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* Previews */}
          {previews.length > 0 && (
            <div className="px-14 grid grid-cols-2 gap-2 mt-2">
              {previews.map((src, idx) => (
                <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200">
                  <img src={src} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {videos.length > 0 && (
            <div className="px-14 flex flex-col gap-2">
              {videos.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-100 p-2 rounded-md">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Film className="w-4 h-4" />
                    <span className="text-xs truncate max-w-[200px]">{file.name}</span>
                  </div>
                  <button type="button" onClick={() => removeVideo(idx)} className="text-slate-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-red-500 text-sm px-14">{error}</p>}
          
          <div className="flex justify-between items-center border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2 pl-14">
              <label className="cursor-pointer p-2 rounded-full hover:bg-indigo-50 text-indigo-600 transition" title="Add Image">
                <ImageIcon className="w-5 h-5" />
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
              </label>
              <label className="cursor-pointer p-2 rounded-full hover:bg-indigo-50 text-indigo-600 transition" title="Add Video">
                <Film className="w-5 h-5" />
                <input type="file" accept="video/*" multiple className="hidden" onChange={handleVideoChange} />
              </label>
            </div>
            <Button type="submit" disabled={(!content.trim() && images.length === 0 && videos.length === 0) || isLoading} className="rounded-full px-6 bg-indigo-600 hover:bg-indigo-700">
              {isLoading ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
