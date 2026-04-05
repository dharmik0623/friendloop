import { create } from 'zustand';
import api from '@/services/api';

interface Notification {
    _id: string;
    senderId: number;
    senderName: string;
    type: 'like' | 'comment' | 'friend_request' | 'friend_accept' | 'message';
    referenceId?: string;
    content?: string;
    read: boolean;
    createdAt: string;
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    showSpiderman: boolean;
    isCenterOverlay: boolean;
    fetchNotifications: () => Promise<void>;
    addNotification: (notification: Notification) => void;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    toggleCenterOverlay: (show: boolean) => void;
    setShowSpiderman: (show: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    showSpiderman: false,
    isCenterOverlay: false,

    fetchNotifications: async () => {
        try {
            const res = await api.get('/notifications');
            const notifications = res.data;
            const unreadCount = notifications.filter((n: Notification) => !n.read).length;
            set({ 
                notifications, 
                unreadCount,
                showSpiderman: unreadCount > 0 // Show spiderman on load if unread
            });
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    },

    addNotification: (notification) => {
        set((state) => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
            showSpiderman: true // Always show spiderman on new notification
        }));
    },

    markAsRead: async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            set((state) => ({
                notifications: state.notifications.map((n) => 
                    n._id === id ? { ...n, read: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1)
            }));
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    },

    markAllAsRead: async () => {
        try {
            await api.put('/notifications/read-all');
            set((state) => ({
                notifications: state.notifications.map((n) => ({ ...n, read: true })),
                unreadCount: 0
            }));
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    },

    toggleCenterOverlay: (show) => set({ isCenterOverlay: show }),
    
    setShowSpiderman: (show) => set({ showSpiderman: show }),
}));
