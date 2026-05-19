import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAsRead, markAllAsRead } from '../features/notificationSlice';
import { Bell, Check, Trash2, Clock, Inbox } from 'lucide-react';

const Notifications = () => {
    const dispatch = useDispatch();
    const { notifications, totalCount, loading } = useSelector(state => state.notifications);

    useEffect(() => {
        dispatch(fetchNotifications(50)); // Fetch more for the full page
    }, [dispatch]);

    const handleMarkAsRead = (id) => {
        dispatch(markAsRead(id));
    };

    const handleMarkAllAsRead = () => {
        dispatch(markAllAsRead());
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="space-y-1">
                    <h1 className="text-[1.4em] font-black uppercase tracking-[0.05em] text-zinc-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-zinc-950 dark:bg-zinc-100 rounded-md">
                            <Bell className="size-5 text-white dark:text-zinc-950" />
                        </div>
                        Activity Center
                    </h1>
                    <p className="text-[14px] text-zinc-500 dark:text-zinc-400 font-medium tracking-tight">Stay updated with your latest workspace activity</p>
                </div>
                {notifications.some(n => !n.is_read) && (
                    <button 
                        onClick={handleMarkAllAsRead}
                        className="bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 px-6 py-2.5 rounded-md text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-zinc-500/10 hover:opacity-90 transition-all flex items-center gap-2"
                    >
                        <Check size={14} />
                        Clear All
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-100/10 rounded-md shadow-sm overflow-hidden">
                {notifications.length > 0 ? (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
                        {notifications.map((notification) => (
                            <div 
                                key={notification.id}
                                className={`p-4 sm:p-5 flex gap-4 transition-all hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 ${!notification.is_read ? 'bg-zinc-50/20 dark:bg-zinc-900/5' : ''}`}
                            >
                                <div className={`size-9 rounded-md flex items-center justify-center flex-shrink-0 border ${
                                    notification.type === 'success' ? 'bg-zinc-950 text-white border-zinc-950 dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-100 shadow-sm' :
                                    notification.type === 'warning' ? 'bg-zinc-50 text-zinc-900 border-zinc-200 dark:bg-zinc-900 dark:text-white dark:border-zinc-800' :
                                    'bg-white text-zinc-400 border-zinc-100 dark:bg-zinc-950 dark:text-zinc-600 dark:border-zinc-900'
                                }`}>
                                    <Bell size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                        <div className="space-y-0.5">
                                            <h3 className={`text-[12px] font-bold uppercase tracking-wide ${!notification.is_read ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'}`}>
                                                {notification.title}
                                            </h3>
                                            <p className="text-zinc-500 dark:text-zinc-400 text-[12px] leading-relaxed font-normal max-w-2xl">
                                                {notification.message}
                                            </p>
                                        </div>
                                        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-1.5 flex-shrink-0">
                                            <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50 px-1.5 py-0.5 rounded">
                                                <Clock size={10} />
                                                {new Date(notification.created_at).toLocaleDateString()}
                                            </div>
                                            {!notification.is_read && (
                                                <button 
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="text-[9px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 hover:underline underline-offset-4"
                                                >
                                                    Mark as read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-24 flex flex-col items-center justify-center text-center">
                        <div className="size-20 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-200 dark:text-zinc-800 mb-6">
                            <Inbox size={40} />
                        </div>
                        <h2 className="text-[1.2em] font-black uppercase tracking-widest text-zinc-900 dark:text-white">Workspace Clear</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm font-medium">You don't have any notifications at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
