'use client';
import { Button } from '@/components/ui/button';
import { Bell, X, CheckCircle2 } from 'lucide-react';

export function NotificationDrawer({ open, onClose, notifications, onMarkRead, onMarkAllRead }) {
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-50 transition-opacity" onClick={onClose} />}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-background border-l border-border/50 shadow-2xl z-50 transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div>
            <h3 className="text-lg font-semibold">Notifications</h3>
            <p className="text-xs text-muted-foreground">
              {unreadCount} unread {unreadCount !== 1 ? 'notifications' : 'notification'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={onMarkAllRead} className="text-xs">
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-80px)] p-4 space-y-2">
          {notifications?.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-lg border transition-colors cursor-pointer hover:bg-white/5 ${
                  n.read ? 'bg-white/5 border-white/5' : 'bg-purple-500/5 border-purple-500/20'
                }`}
                onClick={() => onMarkRead(n.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium ${
                          n.type === 'critical' ? 'text-red-400' :
                          n.type === 'warning' ? 'text-amber-400' : 'text-blue-400'
                        }`}
                      >
                        {n.type?.toUpperCase() || 'INFO'}
                      </span>
                      {!n.read && <span className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0" />}
                    </div>
                    <div className="text-sm font-medium mt-0.5">{n.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{n.message}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {!n.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => { e.stopPropagation(); onMarkRead(n.id); }}
                    >
                      <CheckCircle2 className="w-3 h-3 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}