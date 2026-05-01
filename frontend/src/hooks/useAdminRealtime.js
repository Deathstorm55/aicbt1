import { useState, useEffect, useRef, useCallback } from 'react';
import { getRealtimeClient } from '../services/supabaseRealtime';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';

/**
 * Custom hook that subscribes to Supabase Realtime channels for
 * admin-relevant database events: new users, mood logs, chat messages,
 * crisis keyword detections, and PHQ-9 retakes.
 *
 * Returns a live notification feed + an unread count.
 */
export default function useAdminRealtime() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [eventCount, setEventCount] = useState(0);
    const channelRef = useRef(null);
    const { getToken } = useClerkAuth();

    const addNotification = useCallback((notification) => {
        const entry = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            read: false,
            ...notification,
        };
        setNotifications(prev => [entry, ...prev].slice(0, 50)); // keep last 50
        setUnreadCount(prev => prev + 1);
        setEventCount(prev => prev + 1);
    }, []);

    const markAllRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0);
    }, []);

    useEffect(() => {
        let isMounted = true;

        const setupRealtime = async () => {
            try {
                // Fetch the Supabase-specific JWT from Clerk to authenticate the WebSocket
                const token = await getToken({ template: 'supabase' });
                if (!token) {
                    console.error("No Supabase token available for realtime.");
                    return;
                }

                const client = getRealtimeClient(token);
                
                const channel = client
                    .channel('admin-realtime-feed')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'users' },
                (payload) => {
                    const user = payload.new;
                    addNotification({
                        type: 'new_user',
                        severity: 'info',
                        title: 'New User Registered',
                        message: `${user.name || 'A new user'} (${user.email || 'no email'}) just signed up.`,
                        icon: '👤',
                        data: user,
                    });
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'mood_logs' },
                (payload) => {
                    const log = payload.new;
                    const moodEmoji = {
                        great: '😄', good: '🙂', okay: '😐', bad: '😟', awful: '😢'
                    };
                    addNotification({
                        type: 'mood_log',
                        severity: log.mood === 'awful' ? 'warning' : 'info',
                        title: 'New Mood Log',
                        message: `A user logged their mood as "${log.mood}" ${moodEmoji[log.mood] || ''}`,
                        icon: moodEmoji[log.mood] || '📊',
                        data: log,
                    });
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'crisis_keyword_logs' },
                (payload) => {
                    const log = payload.new;
                    addNotification({
                        type: 'crisis',
                        severity: 'critical',
                        title: '⚠️ Crisis Keyword Detected',
                        message: `A user triggered crisis detection with keyword: "${log.keyword_matched}"`,
                        icon: '🚨',
                        data: log,
                    });
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chat_messages' },
                (payload) => {
                    addNotification({
                        type: 'chat_message',
                        severity: 'info',
                        title: 'New Chat Message',
                        message: 'A user sent a message to the AI chatbot.',
                        icon: '💬',
                        data: payload.new,
                    });
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'phq9_history' },
                (payload) => {
                    const record = payload.new;
                    addNotification({
                        type: 'phq9_retake',
                        severity: record.score >= 20 ? 'critical' : record.score >= 15 ? 'warning' : 'info',
                        title: 'PHQ-9 Assessment Completed',
                        message: `A user completed a PHQ-9 assessment with a score of ${record.score}.`,
                        icon: '📋',
                        data: record,
                    });
                }
            )
            .subscribe((status, err) => {
                console.log("Realtime subscription status:", status);
                if (err) console.error("Realtime subscription error:", err);
                if (isMounted) setIsConnected(status === 'SUBSCRIBED');
            });

            channelRef.current = { channel, client };
        } catch (err) {
            console.error("Error setting up realtime:", err);
        }
    };

    setupRealtime();

    return () => {
        isMounted = false;
        if (channelRef.current) {
            channelRef.current.client.removeChannel(channelRef.current.channel);
            channelRef.current = null;
        }
    };
}, [addNotification, getToken]);

    return {
        notifications,
        unreadCount,
        isConnected,
        eventCount,
        markAllRead,
        clearAll,
    };
}
