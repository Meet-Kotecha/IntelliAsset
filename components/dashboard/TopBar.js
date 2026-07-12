'use client';
import { useTheme } from 'next-themes';
import { Moon, Sun, Bell, Sparkles } from 'lucide-react';

export function TopBar({ title, subtitle, notifications, onOpenNotifications }) {
  const { theme, setTheme } = useTheme();
  const unread = notifications?.filter(n => !n.read).length || 0;

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>

        <button 
          onClick={onOpenNotifications} 
          className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">
              {unread}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}