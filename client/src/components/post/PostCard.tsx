'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Heart, MessageCircle, MoreHorizontal, Trash2, Edit2, Bookmark, X, Check } from 'lucide-react';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';

interface PostProps {
  post: {
    _id: string;
    content: string;
    author_id: number;
    author?: {
      id: number;
      username: string;
      first_name?: string;
      last_name?: string;
      profile_picture_url?: string;
    };
    likes: number[];
    bookmarks?: number[];
    images?: string[];
    videos?: string[];
    createdAt: string;
  };
  onDelete?: (postId: string) => void;
}

export default function PostCard({ post, onDelete }: PostProps) {
  const { user } = useAuthStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [likes, setLikes] = useState<number[]>(post.likes || []);
  const [isLiked, setIsLiked] = useState<boolean>(user ? (post.likes || []).includes(Number(user.id)) : false);
  const [bookmarks, setBookmarks] = useState<number[]>(post.bookmarks || []);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(user ? (post.bookmarks || []).includes(Number(user.id)) : false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  // Track displayed content to update without a full reload
  const [currentContent, setCurrentContent] = useState(post.content);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/${post._id}`);
      setComments(res.data);
    } catch (error) {
      console.error('Failed to fetch comments', error);
    }
  };

  const toggleComments = () => {
    if (!showComments) {
      fetchComments();
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const res = await api.post(`/comments/${post._id}`, { content: commentText });
      // Reload comments to get the full author object
      fetchComments();
      setCommentText('');
    } catch (error) {
      console.error('Failed to add comment', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleLike = async () => {
    try {
      if (isLiked) {
        const res = await api.put(`/posts/${post._id}/unlike`);
        setLikes(res.data);
        setIsLiked(false);
      } else {
        const res = await api.put(`/posts/${post._id}/like`);
        setLikes(res.data);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Failed to toggle like', error);
    }
  };

  const handleBookmark = async () => {
    try {
      if (isBookmarked) {
        const res = await api.put(`/posts/${post._id}/unbookmark`);
        setBookmarks(res.data);
        setIsBookmarked(false);
      } else {
        const res = await api.put(`/posts/${post._id}/bookmark`);
        setBookmarks(res.data);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Failed to toggle bookmark', error);
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    setIsSavingEdit(true);
    try {
      await api.put(`/posts/${post._id}`, { content: editContent });
      setCurrentContent(editContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update post', error);
      alert('Failed to update post');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    setIsDeleting(true);
    try {
      await api.delete(`/posts/${post._id}`);
      if (onDelete) {
        onDelete(post._id);
      }
    } catch (error) {
      console.error('Failed to delete post', error);
      alert('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const authorName = post.author 
    ? (post.author.first_name ? `${post.author.first_name} ${post.author.last_name || ''}` : `@${post.author.username}`)
    : `User ${post.author_id}`;

  const getMediaUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${backendUrl}${url}`;
  };

  return (
    <Card className="mb-4 overflow-hidden border-slate-200 shadow-sm">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 overflow-hidden border border-slate-200">
            {post.author?.profile_picture_url ? (
              <img src={getMediaUrl(post.author.profile_picture_url)} alt={authorName} className="w-full h-full object-cover" />
            ) : (
              (post.author?.username?.charAt(0) || 'U').toUpperCase()
            )}
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-900">{authorName}</p>
            <p className="text-xs text-slate-500">{formattedDate}</p>
          </div>
        </div>
        {user && Number(user.id) === post.author_id && (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              onClick={() => {
                setIsEditing(!isEditing);
                setEditContent(currentContent);
              }}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            
            <button
              type="button"
              className="animated-delete-btn"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <span className="icon-wrapper">
                <Trash2 className="w-4 h-4" />
              </span>
              <span className="title">Delete</span>
            </button>
          </div>
        )}
        {(!user || Number(user.id) !== post.author_id) && (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
            <MoreHorizontal className="w-5 h-5 text-slate-500" />
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="p-4 pt-2 space-y-3">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              className="w-full text-sm bg-white border border-slate-200 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={3}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
            <div className="flex items-center justify-end gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditing(false)}
                className="h-8 text-slate-500"
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSaveEdit}
                disabled={isSavingEdit || !editContent.trim()}
                className="h-8 bg-indigo-600 text-white"
              >
                {isSavingEdit ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">{currentContent}</p>
        )}
        
        {post.images && post.images.length > 0 && (
          <div className="rounded-lg overflow-hidden border border-slate-100">
            {post.images.map((img, idx) => (
              <img key={idx} src={getMediaUrl(img)} alt="Post content" className="w-full h-auto max-h-[500px] object-contain bg-slate-50" />
            ))}
          </div>
        )}

        {post.videos && post.videos.length > 0 && (
          <div className="rounded-lg overflow-hidden border border-slate-100 bg-black">
            {post.videos.map((vid, idx) => (
              <video key={idx} src={getMediaUrl(vid)} controls className="w-full h-auto max-h-[500px]" />
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-1 border-t border-slate-100 flex flex-col items-stretch">
        <div className="flex gap-1 w-full items-center my-1">
          <div className="flex-1 flex justify-center h-10 items-center">
            <button 
              type="button"
              className={`animated-like-btn ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
            >
              <span className="icon-wrapper flex gap-1 items-center justify-center">
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="font-medium text-sm">{likes.length}</span>
              </span>
              <span className="title text-xs">Like it</span>
            </button>
          </div>
          <Button 
            variant="ghost" 
            className={`flex-1 flex gap-2 rounded-md h-10 ${showComments ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600'}`}
            onClick={toggleComments}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium text-sm">Comment</span>
          </Button>
          <Button 
            variant="ghost" 
            className={`flex-1 flex gap-2 rounded-md h-10 ${isBookmarked ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600'}`}
            onClick={handleBookmark}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            <span className="font-medium text-sm">Save</span>
          </Button>
        </div>

        {showComments && (
          <div className="p-3 bg-slate-50 border-t border-slate-100 animate-in fade-in duration-300">
            <div className="space-y-4 mb-4">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment._id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-500 overflow-hidden border border-slate-200">
                      {comment.author?.profile_picture_url ? (
                        <img src={comment.author.profile_picture_url} alt={comment.author.username} className="w-full h-full object-cover" />
                      ) : (
                        (comment.author?.username?.charAt(0) || 'U').toUpperCase()
                      )}
                    </div>
                    <div className="bg-white p-2 px-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex-1">
                      <p className="text-[10px] font-semibold text-indigo-600 mb-0.5">
                        {comment.author?.first_name ? `${comment.author.first_name} ${comment.author.last_name || ''}` : `@${comment.author?.username || 'Unknown'}`}
                      </p>
                      <p className="text-sm text-slate-700">{comment.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-xs text-slate-400 py-2">No comments yet. Be the first!</p>
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                className="flex-1 text-sm bg-white border border-slate-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <Button 
                type="submit" 
                size="sm" 
                disabled={!commentText.trim() || isSubmittingComment}
                className="rounded-full bg-indigo-600"
              >
                Send
              </Button>
            </form>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
