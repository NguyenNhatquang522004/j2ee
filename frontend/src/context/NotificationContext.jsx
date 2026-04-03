import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const clientRef = useRef(null);

    useEffect(() => {
        if (!user || !user.accessToken) {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
            }
            return;
        }

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const brokerURL = `${protocol}//${window.location.host}/ws`;

        const client = new Client({
            brokerURL,
            connectHeaders: {
                Authorization: `Bearer ${user.accessToken}`
            },
            debug: function (str) {
                console.log('STOMP: ' + str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = (frame) => {
            console.log('STOMP: Connected to WebSocket');
            
            // Subscribe to user-specific notifications
            client.subscribe(`/user/${user.username}/queue/notifications`, (message) => {
                const notification = JSON.parse(message.body);
                handleNewNotification(notification);
            });

            // Subscribe to general topic
            client.subscribe('/topic/notifications', (message) => {
                const notification = JSON.parse(message.body);
                // Maybe only show for admins?
                if (user.role === 'ROLE_ADMIN') {
                     handleNewNotification(notification);
                }
            });
        };

        client.onStompError = (frame) => {
            console.error('STOMP: Error', frame.headers['message']);
        };

        client.activate();
        clientRef.current = client;

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
            }
        };
    }, [user]);

    const handleNewNotification = (notification) => {
        // Show Toast
        toast(notification.message, {
            id: `notif-${notification.id || Date.now()}`,
            icon: getIconForType(notification.type),
            duration: 5000,
            onClick: () => {
                if (notification.link) window.location.href = notification.link;
            }
        });

        setUnreadCount(prev => prev + 1);
        
        // Dispatch custom event so other components (like Navbar) can update
        window.dispatchEvent(new CustomEvent('notification-received', { detail: notification }));
    };

    const getIconForType = (type) => {
        switch (type) {
            case 'SUCCESS': return '✅';
            case 'WARNING': return '⚠️';
            case 'ERROR': return '❌';
            default: return '🔔';
        }
    };

    return (
        <NotificationContext.Provider value={{ unreadCount, setUnreadCount }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    return useContext(NotificationContext);
}
