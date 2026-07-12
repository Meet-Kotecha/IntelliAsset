'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Building2, Users, Package, ArrowRightLeft, 
  Calendar, Wrench, ClipboardCheck, FileBarChart, Activity, 
  Settings, Sparkles, Tag, FileText, LogOut, Boxes
} from 'lucide-react';

const iconMap = {
  'LayoutDashboard': LayoutDashboard,
  'Building2': Building2,
  'Users': Users,
  'Package': Package,
  'ArrowRightLeft': ArrowRightLeft,
  'Calendar': Calendar,
  'Wrench': Wrench,
  'ClipboardCheck': ClipboardCheck,
  'FileBarChart': FileBarChart,
  'Activity': Activity,
  'Settings': Settings,
  'Sparkles': Sparkles,
  'Tag': Tag,
  'FileText': FileText,
  'Boxes': Boxes,
};

export function Sidebar({ menuItems, user, onLogout }) {
  const pathname = usePathname();

  // Get the base path (first part of URL)
  const getBasePath = (path) => {
    const parts = path.split('/');
    return parts.length > 1 ? '/' + parts[1] : path;
  };

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border/50 bg-black/20 backdrop-blur-xl flex flex-col h-screen sticky top-0 overflow-hidden">
      {/* Logo */}
      <div className="p-5 border-b border-border/50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center glow-purple">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm gradient-text">IntelliAsset</div>
            <div className="text-[10px] text-muted-foreground">{user.role}</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto scrollbar-thin">
        {menuItems.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          const basePath = getBasePath(pathname);
          const itemPath = `/${item.id}`;
          const isActive = basePath === itemPath || pathname.startsWith(itemPath + '/');

          return (
            <Link
              key={item.id}
              href={itemPath}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-0.5 transition-all duration-200 relative ${
                isActive
                  ? 'text-white bg-white/5 shadow-lg shadow-purple-500/5' 
                  : 'text-muted-foreground hover:text-white hover:bg-white/5'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-r-full" />
              )}
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-border/50">
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold">
            {user.name?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">{user.name}</div>
            <div className="text-[10px] text-muted-foreground">{user.role}</div>
          </div>
          <button onClick={onLogout} className="p-1 hover:bg-white/10 rounded transition-colors" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}