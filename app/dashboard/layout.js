'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ThemeProvider } from 'next-themes';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { NotificationDrawer } from '@/components/dashboard/NotificationDrawer';
import { MENU_ITEMS, hasAccess } from '@/lib/rbac';
import { Toaster } from 'sonner';

const api = async (path) => {
  const res = await fetch(`/api${path}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await api('/notifications');
      setNotifications(data);
    } catch (e) {
      console.error('Failed to fetch notifications');
    }
  };

  const markRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error('Failed to mark as read');
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.error('Failed to mark all as read');
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const userData = JSON.parse(stored);
      setUser(userData);
      if (!hasAccess(userData.role, pathname)) {
        router.push('/unauthorized');
      }
    } else {
      router.push('/login');
    }
    setLoading(false);
  }, [pathname]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    document.cookie = 'user=; path=/; max-age=0';
    router.push('/login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-muted-foreground animate-pulse">Loading workspace...</div></div>;
  }

  if (!user) return null;

  const menuItems = MENU_ITEMS[user.role] || [];
  const pageTitle = pathname.split('/').pop() || 'Dashboard';
  const formattedTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1).replace(/-/g, ' ');

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="flex min-h-screen bg-background">
        <Sidebar menuItems={menuItems} user={user} onLogout={handleLogout} />
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
          <TopBar
            title={formattedTitle}
            subtitle={`${user.role} Dashboard`}
            notifications={notifications}
            onOpenNotifications={() => setDrawerOpen(true)}
          />
          {children}
        </main>
        <NotificationDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          notifications={notifications}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
        />
        <Toaster theme="dark" position="top-right" richColors />
      </div>
    </ThemeProvider>
  );
}