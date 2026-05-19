import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, ExternalLink, Inbox } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAsRead, markAllAsRead } from '../features/notificationSlice';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { notifications, unreadCount, totalCount, loading } = useSelector(state => state.notifications);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        dispatch(fetchNotifications(5));
        
        // Polling for new notifications every 30 seconds
        const interval = setInterval(() => {
            dispatch(fetchNotifications(5));
        }, 30000);
        
        return () => clearInterval(interval);
    }, [dispatch]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = (e, id) => {
        e.stopPropagation();
        dispatch(markAsRead(id));
    };

    const handleMarkAllAsRead = () => {
        dispatch(markAllAsRead());
    };

    const handleViewAll = () => {
        setIsOpen(false);
        navigate('/dashboard/notifications');
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success': return <div className="size-7 rounded-md bg-zinc-950 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 shadow-sm"><Check size={12} /></div>;
            case 'warning': return <div className="size-7 rounded-md bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800"><X size={12} /></div>;
            default: return <div className="size-7 rounded-md bg-white dark:bg-zinc-950 flex items-center justify-center text-zinc-400 dark:text-zinc-600 border border-zinc-100 dark:border-zinc-900"><Inbox size={12} /></div>;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="size-8 flex items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all relative group border border-zinc-200 dark:border-zinc-800"
            >
                <Bell className={`size-4 transition-colors ${unreadCount > 0 ? 'text-zinc-900 dark:text-zinc-100 animate-pulse' : 'text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white'}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 size-4 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-950 shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-72 max-sm:w-[calc(100vw-2rem)] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-100/10 rounded-md shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3 px-4 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/30">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={handleMarkAllAsRead}
                                className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto no-scrollbar">
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-3 px-4 flex gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all cursor-pointer border-b border-zinc-50 dark:border-zinc-900 last:border-0 ${!notification.is_read ? 'bg-zinc-50/20 dark:bg-zinc-900/5' : ''}`}
                                    onClick={() => notification.link && navigate(notification.link)}
                                >
                                    <div className="flex-shrink-0 mt-0.5">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={`text-[10px] font-bold uppercase tracking-wide truncate ${!notification.is_read ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-600'}`}>
                                                {notification.title}
                                            </p>
                                            {!notification.is_read && (
                                                <div className="size-1.5 bg-zinc-950 dark:bg-zinc-100 rounded-full flex-shrink-0 mt-1" />
                                            )}
                                        </div>
                                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal leading-snug mt-0.5">
                                            {notification.message}
                                        </p>
                                        <p className="text-[8px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-tighter mt-1.5">
                                            {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
                                <div className="size-10 rounded-md bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-300 dark:text-zinc-700 mb-3 border border-zinc-100 dark:border-zinc-800">
                                    <Bell size={16} />
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-900 dark:text-white">Workspace Clear</p>
                            </div>
                        )}
                    </div>

                    {(totalCount > 5 || notifications.length > 0) && (
                        <button
                            onClick={handleViewAll}
                            className="w-full py-3 px-4 text-[9px] font-bold uppercase tracking-widest text-center text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 hover:bg-zinc-950 dark:hover:bg-zinc-100 hover:text-white dark:hover:text-zinc-950 transition-all border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-center gap-2"
                        >
                            View History
                            <ExternalLink size={10} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
