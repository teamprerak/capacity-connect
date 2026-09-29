'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './auth-context';
import { api } from './api-client';

export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  createdAt: string;
  read?: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const MAX_NOTIFICATIONS = 50;

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const esRef = useRef<EventSource | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchInitial = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.get('/notifications');
      if (Array.isArray(data)) {
        setNotifications(data.slice(0, MAX_NOTIFICATIONS));
        setUnreadCount(data.filter((n: AppNotification) => !n.read).length);
      }
    } catch (err) {
      console.error('Failed to fetch initial notifications', err);
    }
  }, [user]);

  const connect = useCallback(() => {
    if (!user) return;

    const token = sessionStorage.getItem('access_token');
    if (!token) return;

    // Close existing connection
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    // SSE doesn't support custom headers natively in browsers.
    // We pass the token as a query param (server validates it as a JWT).
    const url = `${API_BASE}/notifications/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener('notification', (e: MessageEvent) => {
      try {
        const notification: AppNotification = { ...JSON.parse(e.data), read: false };
        setNotifications((prev) => {
          // Prevent duplicates if already fetched via API
          if (prev.some((n) => n.id === notification.id)) return prev;
          return [notification, ...prev].slice(0, MAX_NOTIFICATIONS);
        });
        setUnreadCount((c) => c + 1);
      } catch {
        // malformed event — ignore
      }
    });

    es.onerror = () => {
      es.close();
      esRef.current = null;
      // Reconnect after 5 s
      if (retryRef.current) clearTimeout(retryRef.current);
      retryRef.current = setTimeout(connect, 5000);
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchInitial();
      connect();
    }
    return () => {
      esRef.current?.close();
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [user, fetchInitial, connect]);

  const markAllRead = useCallback(async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  }, []);

  const dismiss = useCallback(async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => {
        const updated = prev.filter((n) => n.id !== id);
        setUnreadCount(updated.filter((n) => !n.read).length);
        return updated;
      });
    } catch (err) {
      console.error('Failed to dismiss notification', err);
    }
  }, []);

  return { notifications, unreadCount, markAllRead, dismiss };
}
