'use client';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { LayoutDashboard, Sparkles, Package, ArrowRightLeft, Calendar, Wrench, ClipboardCheck, Building2, Users, FileBarChart, Activity, Settings, LogOut, Search, Bell, Plus, Send, TrendingUp, AlertTriangle, CheckCircle2, Clock, DollarSign, Boxes, Zap, ShieldCheck, ArrowUpRight, Bot, User as UserIcon, Filter, Trash2, RotateCcw, ChevronRight, Moon, Sun } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend, AreaChart, Area } from 'recharts';

const api = async (path, opts = {}) => {
  const res = await fetch(`/api${path}`, {
    method: opts.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

const RISK_COLORS = { Low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20', High: 'text-orange-400 bg-orange-500/10 border-orange-500/20', Critical: 'text-red-400 bg-red-500/10 border-red-500/20' };
const STATUS_COLORS = { Available: 'text-emerald-400 bg-emerald-500/10', Allocated: 'text-blue-400 bg-blue-500/10', Reserved: 'text-purple-400 bg-purple-500/10', 'Under Maintenance': 'text-amber-400 bg-amber-500/10', Lost: 'text-red-400 bg-red-500/10', Retired: 'text-gray-400 bg-gray-500/10', Disposed: 'text-gray-500 bg-gray-500/5' };

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api(`/auth/${mode}`, { method: 'POST', body: form });
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
      toast.success(`Welcome, ${data.user.name}!`);
    } catch (e) { toast.error(e.message); }
    setLoading(false);
  };

  const quickLogin = async (email, password) => {
    setLoading(true);
    try {
      const data = await api('/auth/login', { method: 'POST', body: { email, password } });
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (e) { toast.error(e.message); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced animated gradient background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] bg-repeat" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center glow-purple">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">IntelliAsset</span>
        </div>
        <Card className="glass p-8">
          <h2 className="text-2xl font-bold mb-1">{mode === 'login' ? 'Welcome back' : 'Get started'}</h2>
          <p className="text-sm text-muted-foreground mb-6">{mode === 'login' ? 'Sign in to your workspace' : 'Create your account (Employee role)'}</p>
          <form onSubmit={submit} className="space-y-4">
            {mode === 'signup' && <Input placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />}
            <Input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            <Input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90">{loading ? 'Please wait...' : (mode === 'login' ? 'Sign in' : 'Create account')}</Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {mode === 'login' ? "New here?" : "Have an account?"}
            <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="ml-1 text-purple-400 hover:underline">{mode === 'login' ? 'Sign up' : 'Sign in'}</button>
          </div>
          <div className="mt-6 pt-6 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-3 text-center">Quick demo access</p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => quickLogin('admin@intelliasset.io', 'admin123')}>Admin</Button>
              <Button variant="outline" size="sm" onClick={() => quickLogin('manager@intelliasset.io', 'manager123')}>Asset Manager</Button>
              <Button variant="outline" size="sm" onClick={() => quickLogin('lead@intelliasset.io', 'lead123')}>Dept Head</Button>
              <Button variant="outline" size="sm" onClick={() => quickLogin('sarah@intelliasset.io', 'emp123')}>Employee</Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function Sidebar({ active, setActive, user, onLogout }) {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'copilot', label: 'AI Copilot', icon: Sparkles, highlight: true },
    { id: 'assets', label: 'Assets', icon: Package },
    { id: 'allocations', label: 'Allocations', icon: ArrowRightLeft },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'audits', label: 'Audits', icon: ClipboardCheck },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'people', label: 'People', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileBarChart },
    { id: 'activity', label: 'Activity', icon: Activity },
  ];
  if (user.role === 'Admin') items.push({ id: 'admin', label: 'Admin', icon: Settings });
  return (
    <aside className="w-64 flex-shrink-0 border-r border-border/50 bg-black/20 backdrop-blur-xl flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center glow-purple">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm gradient-text">IntelliAsset</div>
            <div className="text-[10px] text-muted-foreground">Enterprise AMS</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 overflow-y-auto scrollbar-thin">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => setActive(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-0.5 transition-all duration-200 relative ${
                isActive
                  ? 'text-white bg-white/5 shadow-lg shadow-purple-500/5' 
                  : 'text-muted-foreground hover:text-white hover:bg-white/5'
              } ${item.highlight ? 'relative' : ''}`}>
              {isActive && (
                <div className="absolute left-0 w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-r-full" />
              )}
              <Icon className={`w-4 h-4 ${item.highlight ? 'text-purple-400' : ''}`} />
              <span>{item.label}</span>
              {item.highlight && <span className="ml-auto text-[9px] px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded">AI</span>}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border/50">
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm">{user.name?.[0]}</div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">{user.name}</div>
            <div className="text-[10px] text-muted-foreground">{user.role}</div>
          </div>
          <button onClick={onLogout} className="p-1 hover:bg-white/10 rounded"><LogOut className="w-4 h-4" /></button>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ title, subtitle, notifications, user }) {
  const { theme, setTheme } = useTheme();
  const unread = notifications?.filter(n => !n.read).length || 0;
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
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

        {/* Notification Bell */}
        <div className="relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unread > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center">{unread}</span>}
        </div>
        <div className="text-right hidden md:block">
          <div className="text-sm font-medium">{user.name}</div>
          <div className="text-xs text-muted-foreground">{user.role}</div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, change, color = 'purple', suffix = '' }) {
  const colors = { purple: 'from-purple-500 to-purple-600', blue: 'from-blue-500 to-blue-600', emerald: 'from-emerald-500 to-emerald-600', amber: 'from-amber-500 to-amber-600', red: 'from-red-500 to-red-600' };
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-5 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 cursor-default">
      <div className={`absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br ${colors[color]} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
      <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-gradient-to-br from-purple-500/0 to-purple-500/5 rounded-full blur-2xl group-hover:opacity-100 opacity-0 transition-opacity duration-500" />
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        {change && <div className="text-xs text-emerald-400 flex items-center gap-0.5"><TrendingUp className="w-3 h-3" />{change}</div>}
      </div>
      <div className="text-2xl font-bold relative z-10">{value}{suffix}</div>
      <div className="text-xs text-muted-foreground mt-1 relative z-10">{label}</div>
    </motion.div>
  );
}

function HealthRing({ health, size = 44 }) {
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  const offset = c - (health / 100) * c;
  const color = health >= 75 ? '#10b981' : health >= 55 ? '#f59e0b' : health >= 35 ? '#f97316' : '#ef4444';
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="3" fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth="3" fill="none" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s' }} />
      </svg>
      <div className="absolute text-[10px] font-bold" style={{ color }}>{health}</div>
    </div>
  );
}

function AssetRow({ asset, cats, onClick }) {
  const cat = cats?.find(c => c.id === asset.categoryId);
  return (
    <div onClick={onClick} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors group">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center text-lg">{cat?.icon || '📦'}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{asset.name}</div>
        <div className="text-xs text-muted-foreground">{asset.code} • {asset.brand}</div>
      </div>
      <Badge variant="outline" className={`${STATUS_COLORS[asset.status]} border-0 text-[10px]`}>{asset.status}</Badge>
      <Badge variant="outline" className={`${RISK_COLORS[asset.prediction?.risk]} text-[10px]`}>{asset.prediction?.risk}</Badge>
      <HealthRing health={asset.prediction?.health || 0} />
    </div>
  );
}

function Dashboard({ data, setActive }) {
  const { assets, allocations, maintenance, bookings } = data;
  const stats = useMemo(() => {
    const totalValue = assets.reduce((s, a) => s + (a.purchaseCost || 0), 0);
    const available = assets.filter(a => a.status === 'Available').length;
    const allocated = assets.filter(a => a.status === 'Allocated').length;
    const inMaint = assets.filter(a => a.status === 'Under Maintenance').length;
    const critical = assets.filter(a => a.prediction?.risk === 'Critical').length;
    const highRisk = assets.filter(a => ['High', 'Critical'].includes(a.prediction?.risk)).length;
    const avgHealth = Math.round(assets.reduce((s, a) => s + (a.prediction?.health || 0), 0) / (assets.length || 1));
    const overdue = allocations.filter(a => a.status === 'Active' && new Date(a.expectedReturnAt) < new Date()).length;
    return { totalValue, available, allocated, inMaint, critical, highRisk, avgHealth, overdue };
  }, [assets, allocations]);

  const statusData = useMemo(() => {
    const counts = {};
    assets.forEach(a => counts[a.status] = (counts[a.status] || 0) + 1);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [assets]);
  const COLORS = ['#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#94a3b8', '#64748b'];

  const trendData = useMemo(() => {
    const days = 14;
    return Array.from({ length: days }, (_, i) => ({
      day: `D${i + 1}`,
      allocations: Math.floor(Math.random() * 5) + allocations.length / 3,
      returns: Math.floor(Math.random() * 4) + 2,
    }));
  }, [allocations]);

  const riskDist = useMemo(() => {
    const risks = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    assets.forEach(a => risks[a.prediction?.risk] = (risks[a.prediction?.risk] || 0) + 1);
    return Object.entries(risks).map(([name, value]) => ({ name, value }));
  }, [assets]);

  const topRisk = useMemo(() => [...assets].filter(a => ['High', 'Critical'].includes(a.prediction?.risk)).sort((a, b) => a.prediction.health - b.prediction.health).slice(0, 5), [assets]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Boxes} label="Total Assets" value={assets.length} color="purple" />
        <StatCard icon={DollarSign} label="Portfolio Value" value={`$${(stats.totalValue / 1000).toFixed(0)}K`} color="emerald" />
        <StatCard icon={ShieldCheck} label="Fleet Health" value={stats.avgHealth} suffix="/100" color="blue" />
        <StatCard icon={AlertTriangle} label="High Risk" value={stats.highRisk} color={stats.highRisk > 0 ? 'red' : 'emerald'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="glass p-5 lg:col-span-2">
          <div className="flex justify-between mb-4">
            <div>
              <h3 className="font-semibold">Asset Activity</h3>
              <p className="text-xs text-muted-foreground">Allocations vs returns (last 14 days)</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a78bfa" stopOpacity={0.4}/><stop offset="100%" stopColor="#a78bfa" stopOpacity={0}/></linearGradient>
                <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#60a5fa" stopOpacity={0.4}/><stop offset="100%" stopColor="#60a5fa" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#666" fontSize={11} />
              <YAxis stroke="#666" fontSize={11} />
              <RTooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="allocations" stroke="#a78bfa" fill="url(#ga)" strokeWidth={2} />
              <Area type="monotone" dataKey="returns" stroke="#60a5fa" fill="url(#gb)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="glass p-5">
          <h3 className="font-semibold mb-1">Risk Distribution</h3>
          <p className="text-xs text-muted-foreground mb-3">Predictive maintenance</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={riskDist} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                {riskDist.map((_, i) => <Cell key={i} fill={['#10b981','#f59e0b','#f97316','#ef4444'][i]} />)}
              </Pie>
              <RTooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
            {riskDist.map((r, i) => (
              <div key={r.name} className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: ['#10b981','#f59e0b','#f97316','#ef4444'][i] }}/>{r.name}: {r.value}</div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-400" />Critical Attention Needed</h3>
              <p className="text-xs text-muted-foreground">AI-predicted high-risk assets</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActive('assets')}>View all <ChevronRight className="w-3 h-3 ml-1"/></Button>
          </div>
          <div className="space-y-1">
            {topRisk.length === 0 && <div className="text-sm text-muted-foreground py-8 text-center">No high-risk assets 🎉</div>}
            {topRisk.map(a => <AssetRow key={a.id} asset={a} cats={data.categories} onClick={() => setActive('assets')} />)}
          </div>
        </Card>

        <Card className="glass p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-400"/>Ask AI Copilot</h3>
              <p className="text-xs text-muted-foreground">Get instant answers about your assets</p>
            </div>
          </div>
          <div className="space-y-2">
            {['Show me all high-risk assets', 'What returns are overdue?', 'Find idle assets', 'Recommend next actions'].map(q => (
              <button key={q} onClick={() => setActive('copilot', q)} className="w-full text-left p-3 rounded-lg border border-border/50 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group flex items-center justify-between">
                <span className="text-sm">{q}</span>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-purple-400" />
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function CopilotPage({ data, initialQuery, user }) {
  const [messages, setMessages] = useState([{ role: 'assistant', content: `Hi ${user.name?.split(' ')[0]}! I'm your AI Asset Copilot. Ask me anything about your fleet — I can find idle assets, spot overdue returns, explain risk, and recommend actions.` }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const suggestions = ['Show all high-risk assets', 'What returns are overdue?', 'Find idle assets', 'Why is Ford Transit Van high risk?', 'Show maintenance history for MacBook Pro', 'Who has the Tesla Model 3?', 'Recommend next actions', 'How many assets total?'];

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { if (initialQuery) { setInput(initialQuery); setTimeout(() => send(initialQuery), 300); } }, [initialQuery]);

  const send = async (text) => {
    const q = text || input;
    if (!q.trim() || loading) return;
    setMessages(m => [...m, { role: 'user', content: q }]);
    setInput(''); setLoading(true);
    try {
      const res = await api('/copilot', { method: 'POST', body: { query: q } });
      setMessages(m => [...m, { role: 'assistant', content: res.answer, cards: res.cards, intent: res.intent }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: `Error: ${e.message}` }]);
    }
    setLoading(false);
  };

  const renderMd = (text) => text.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return <div key={i}>{parts.map((p, j) => p.startsWith('**') ? <strong key={j} className="text-white font-semibold">{p.slice(2, -2)}</strong> : <span key={j}>{p}</span>)}</div>;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center glow-purple">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">AI Asset Copilot <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Beta</Badge></h2>
          <p className="text-xs text-muted-foreground">Natural language interface to your asset intelligence</p>
        </div>
      </div>

      <Card className="glass flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-blue-500/20' : 'bg-gradient-to-br from-purple-500 to-blue-500'}`}>
                {m.role === 'user' ? <UserIcon className="w-4 h-4 text-blue-300" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              <div className={`flex-1 max-w-2xl ${m.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block text-left rounded-xl px-4 py-3 text-sm ${m.role === 'user' ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/20 shadow-lg shadow-purple-500/5' : 'bg-white/5 border border-white/10'}`}>
                  {renderMd(m.content)}
                </div>
                {m.cards && m.cards.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {m.cards.slice(0, 6).map((c, idx) => {
                      if (c.type === 'asset') return <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-3"><HealthRing health={c.asset.prediction.health} /><div className="flex-1 min-w-0"><div className="text-sm font-medium">{c.asset.name}</div><div className="text-xs text-muted-foreground">{c.asset.code} • {c.asset.status}</div></div><Badge className={`${RISK_COLORS[c.asset.prediction.risk]} text-[10px]`}>{c.asset.prediction.risk}</Badge></div>;
                      if (c.type === 'overdue') return <div key={idx} className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 flex items-center gap-3"><Clock className="w-5 h-5 text-red-400" /><div className="flex-1 min-w-0"><div className="text-sm font-medium">{c.asset?.name}</div><div className="text-xs text-muted-foreground">Held by {c.user?.name} • {c.days} days overdue</div></div><Badge className="bg-red-500/20 text-red-300">Overdue</Badge></div>;
                      if (c.type === 'maintenance') return <div key={idx} className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-center gap-3 text-xs"><Wrench className="w-4 h-4 text-amber-400" /><div className="flex-1"><div>{c.record.description}</div><div className="text-muted-foreground">{c.record.type} • ${c.record.cost} • {new Date(c.record.performedAt).toDateString()}</div></div><Badge>{c.record.status}</Badge></div>;
                      return null;
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 px-4 py-3 rounded-xl border border-white/10">
                <span className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}/>
                <span className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}/>
                <span className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}/>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {messages.length <= 2 && (
          <div className="px-6 pb-3">
            <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map(s => <button key={s} onClick={() => send(s)} className="text-xs px-3 py-1.5 rounded-full border border-border/50 hover:border-purple-500/50 hover:bg-purple-500/5 transition-colors">{s}</button>)}
            </div>
          </div>
        )}

        <form onSubmit={e => { e.preventDefault(); send(); }} className="border-t border-border/50 p-4 flex gap-2">
          <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about assets, risks, allocations..." className="flex-1 bg-black/20 border-white/10" />
          <Button type="submit" disabled={loading || !input.trim()} className="bg-gradient-to-r from-purple-500 to-blue-500"><Send className="w-4 h-4" /></Button>
        </form>
      </Card>
    </div>
  );
}

function AssetsPage({ data, refresh, user }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const canCreate = ['Admin', 'Asset Manager'].includes(user.role);

  const filtered = data.assets.filter(a => {
    if (search && !`${a.name} ${a.code} ${a.brand}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (riskFilter !== 'all' && a.prediction?.risk !== riskFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, code, brand..." className="pl-9 bg-black/20 border-white/10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-black/20 border-white/10"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All statuses</SelectItem>{['Available','Allocated','Under Maintenance','Reserved','Lost','Retired'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-32 bg-black/20 border-white/10"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All risks</SelectItem>{['Low','Medium','High','Critical'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
        </Select>
        {canCreate && <RegisterAssetDialog data={data} refresh={refresh} user={user} />}
      </div>
      <Card className="glass p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {filtered.map(a => (
            <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => { setSelected(a); setOpen(true); }}>
              <AssetRow asset={a} cats={data.categories} onClick={() => { setSelected(a); setOpen(true); }} />
            </motion.div>
          ))}
        </div>
        {filtered.length === 0 && <div className="py-12 text-center text-muted-foreground text-sm">No assets found</div>}
      </Card>

      <AssetDetailDialog asset={selected} open={open} onOpenChange={setOpen} data={data} refresh={refresh} user={user} />
    </div>
  );
}

function RegisterAssetDialog({ data, refresh, user }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', brand: '', purchaseCost: '', condition: 'Excellent', categoryId: data.categories[0]?.id || '', location: 'HQ Storage' });
  const submit = async () => {
    try {
      await api('/assets', { method: 'POST', body: { ...form, userId: user.id } });
      toast.success('Asset registered');
      setOpen(false);
      setForm({ name: '', brand: '', purchaseCost: '', condition: 'Excellent', categoryId: data.categories[0]?.id || '', location: 'HQ Storage' });
      refresh();
    } catch (e) { toast.error(e.message); }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)} className="bg-gradient-to-r from-purple-500 to-blue-500">
        <Plus className="w-4 h-4 mr-1"/>Register Asset
      </Button>
      <DialogContent className="glass max-w-md">
        <DialogHeader><DialogTitle>Register New Asset</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. MacBook Pro 16&quot;" /></div>
          <div><Label>Brand</Label><Input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} /></div>
          <div><Label>Category</Label>
            <Select value={form.categoryId} onValueChange={v => setForm({...form, categoryId: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{data.categories.map(c => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Purchase Cost</Label><Input type="number" value={form.purchaseCost} onChange={e => setForm({...form, purchaseCost: e.target.value})} /></div>
            <div><Label>Condition</Label>
              <Select value={form.condition} onValueChange={v => setForm({...form, condition: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['Excellent','Good','Fair','Poor'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Location</Label><Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
        </div>
        <DialogFooter><Button onClick={submit} className="bg-gradient-to-r from-purple-500 to-blue-500">Register</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AssetDetailDialog({ asset, open, onOpenChange, data, refresh, user }) {
  const [action, setAction] = useState(null);
  if (!asset) return null;
  const p = asset.prediction || {};
  const cat = data.categories.find(c => c.id === asset.categoryId);
  const activeAlloc = data.allocations.find(a => a.assetId === asset.id && a.status === 'Active');
  const holder = data.users.find(u => u.id === activeAlloc?.userId);
  const history = data.maintenance.filter(m => m.assetId === asset.id).sort((a,b) => new Date(b.performedAt) - new Date(a.performedAt));
  const canManage = ['Admin', 'Asset Manager'].includes(user.role);

  const allocate = async (userId) => {
    try { await api('/allocations', { method: 'POST', body: { assetId: asset.id, userId, actorId: user.id } }); toast.success('Allocated'); refresh(); onOpenChange(false); }
    catch (e) { toast.error(e.message); }
  };
  const doReturn = async () => {
    try { await api(`/allocations/${activeAlloc.id}/return`, { method: 'POST', body: { actorId: user.id } }); toast.success('Returned'); refresh(); onOpenChange(false); }
    catch (e) { toast.error(e.message); }
  };
  const scheduleMaint = async () => {
    try { await api('/maintenance', { method: 'POST', body: { assetId: asset.id, type: 'Preventive', description: 'Scheduled preventive maintenance', cost: 200, status: 'Scheduled', actorId: user.id } }); toast.success('Maintenance scheduled'); refresh(); onOpenChange(false); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center text-3xl">{cat?.icon}</div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{asset.name}</DialogTitle>
              <div className="text-sm text-muted-foreground">{asset.code} • {asset.brand} • {cat?.name}</div>
              <div className="flex gap-2 mt-2">
                <Badge className={STATUS_COLORS[asset.status]}>{asset.status}</Badge>
                <Badge className={RISK_COLORS[p.risk]}>{p.risk} Risk</Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
            <div className="text-xs text-muted-foreground mb-1">Health Score</div>
            <div className="text-2xl font-bold" style={{ color: p.health >= 75 ? '#10b981' : p.health >= 55 ? '#f59e0b' : p.health >= 35 ? '#f97316' : '#ef4444' }}>{p.health}/100</div>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
            <div className="text-xs text-muted-foreground mb-1">Failure Prob.</div>
            <div className="text-2xl font-bold">{p.failureProbability}%</div>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
            <div className="text-xs text-muted-foreground mb-1">Age</div>
            <div className="text-2xl font-bold">{p.ageYears}y</div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-purple-400" /><span className="text-sm font-semibold">AI Analysis</span></div>
          <p className="text-sm text-muted-foreground mb-2">{p.explanation}</p>
          <div className="text-sm"><span className="text-purple-300">Recommended:</span> {p.action}</div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">Purchase Cost:</span> ${asset.purchaseCost?.toLocaleString()}</div>
          <div><span className="text-muted-foreground">Condition:</span> {asset.condition}</div>
          <div><span className="text-muted-foreground">Location:</span> {asset.location}</div>
          <div><span className="text-muted-foreground">Serial:</span> <span className="font-mono text-xs">{asset.serialNumber}</span></div>
          <div className="col-span-2"><span className="text-muted-foreground">Current Holder:</span> {holder ? `${holder.name} (since ${new Date(activeAlloc.allocatedAt).toDateString()})` : 'None'}</div>
        </div>

        {history.length > 0 && (
          <div>
            <div className="text-sm font-semibold mb-2">Maintenance History ({history.length})</div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin">
              {history.map(m => (
                <div key={m.id} className="p-2 rounded bg-white/5 text-xs flex items-center gap-2">
                  <Wrench className="w-3 h-3 text-amber-400" />
                  <div className="flex-1"><span className="font-medium">{m.description}</span> • <span className="text-muted-foreground">{m.type} • ${m.cost}</span></div>
                  <span className="text-muted-foreground">{new Date(m.performedAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {canManage && (
          <DialogFooter className="flex-wrap gap-2">
            {asset.status === 'Available' && (
              <Select onValueChange={allocate}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Allocate to..." /></SelectTrigger>
                <SelectContent>{data.users.map(u => <SelectItem key={u.id} value={u.id}>{u.name} ({u.role})</SelectItem>)}</SelectContent>
              </Select>
            )}
            {asset.status === 'Allocated' && <Button variant="outline" onClick={doReturn}><RotateCcw className="w-3 h-3 mr-1"/>Mark Returned</Button>}
            {asset.status !== 'Under Maintenance' && <Button variant="outline" onClick={scheduleMaint}><Wrench className="w-3 h-3 mr-1"/>Schedule Maintenance</Button>}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AllocationsPage({ data, refresh, user }) {
  const rows = data.allocations.map(al => ({ ...al, asset: data.assets.find(a => a.id === al.assetId), holder: data.users.find(u => u.id === al.userId) }));
  const active = rows.filter(r => r.status === 'Active');
  const overdue = active.filter(r => new Date(r.expectedReturnAt) < new Date());

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={ArrowRightLeft} label="Active Allocations" value={active.length} color="blue" />
        <StatCard icon={Clock} label="Overdue" value={overdue.length} color={overdue.length ? 'red' : 'emerald'} />
        <StatCard icon={CheckCircle2} label="Returned (all-time)" value={rows.filter(r => r.status === 'Returned').length} color="emerald" />
      </div>
      <Card className="glass p-4">
        <div className="text-sm font-semibold mb-3">All Allocations</div>
        <div className="space-y-1">
          {rows.map(r => {
            const isOverdue = r.status === 'Active' && new Date(r.expectedReturnAt) < new Date();
            return (
              <div key={r.id} className={`p-3 rounded-lg border ${isOverdue ? 'bg-red-500/5 border-red-500/20' : 'bg-white/5 border-white/10'} flex items-center gap-3`}>
                <div className="flex-1">
                  <div className="text-sm font-medium">{r.asset?.name}</div>
                  <div className="text-xs text-muted-foreground">→ {r.holder?.name} • allocated {new Date(r.allocatedAt).toDateString()}</div>
                </div>
                <div className="text-xs text-right">
                  <div className={isOverdue ? 'text-red-400' : 'text-muted-foreground'}>Due {new Date(r.expectedReturnAt).toDateString()}</div>
                  <Badge className={STATUS_COLORS[r.status] || ''}>{r.status}</Badge>
                </div>
                {r.status === 'Active' && ['Admin','Asset Manager'].includes(user.role) && (
                  <Button size="sm" variant="outline" onClick={async () => { await api(`/allocations/${r.id}/return`, { method: 'POST', body: { actorId: user.id } }); toast.success('Returned'); refresh(); }}>Return</Button>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function BookingsPage({ data, refresh, user }) {
  const [open, setOpen] = useState(false);
  const rooms = data.assets.filter(a => data.categories.find(c => c.id === a.categoryId)?.name === 'Meeting Rooms');
  const [form, setForm] = useState({ assetId: rooms[0]?.id || '', startAt: '', endAt: '', purpose: '' });

  const upcoming = data.bookings.filter(b => new Date(b.endAt) >= new Date() && b.status !== 'Cancelled')
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt));

  const create = async () => {
    try {
      await api('/bookings', { method: 'POST', body: { ...form, userId: user.id } });
      toast.success('Booking confirmed');
      setOpen(false); refresh();
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="grid grid-cols-3 gap-4 flex-1">
          <StatCard icon={Calendar} label="Bookable Assets" value={rooms.length} color="purple" />
          <StatCard icon={Clock} label="Upcoming" value={upcoming.length} color="blue" />
          <StatCard icon={CheckCircle2} label="This Month" value={data.bookings.length} color="emerald" />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <Button onClick={() => setOpen(true)} className="ml-4 bg-gradient-to-r from-purple-500 to-blue-500"><Plus className="w-4 h-4 mr-1"/>Book Resource</Button>
          <DialogContent className="glass">
            <DialogHeader><DialogTitle>New Booking</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Resource</Label>
                <Select value={form.assetId} onValueChange={v => setForm({...form, assetId: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{rooms.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Start</Label><Input type="datetime-local" value={form.startAt} onChange={e => setForm({...form, startAt: e.target.value})} /></div>
                <div><Label>End</Label><Input type="datetime-local" value={form.endAt} onChange={e => setForm({...form, endAt: e.target.value})} /></div>
              </div>
              <div><Label>Purpose</Label><Input value={form.purpose} onChange={e => setForm({...form, purpose: e.target.value})} placeholder="Team meeting" /></div>
            </div>
            <DialogFooter><Button onClick={create} className="bg-gradient-to-r from-purple-500 to-blue-500">Confirm booking</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass p-5">
          <h3 className="font-semibold mb-3">Upcoming Bookings</h3>
          <div className="space-y-2">
            {upcoming.length === 0 && <div className="text-sm text-muted-foreground py-8 text-center">No upcoming bookings</div>}
            {upcoming.map(b => {
              const asset = data.assets.find(a => a.id === b.assetId);
              const who = data.users.find(u => u.id === b.userId);
              return (
                <div key={b.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium">{asset?.name}</div>
                      <div className="text-xs text-muted-foreground">{b.purpose} • {who?.name}</div>
                    </div>
                    <Badge className="bg-blue-500/10 text-blue-300">{b.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">{new Date(b.startAt).toLocaleString()} → {new Date(b.endAt).toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="glass p-5">
          <h3 className="font-semibold mb-3">Resource Availability</h3>
          <div className="space-y-2">
            {rooms.map(r => {
              const active = data.bookings.filter(b => b.assetId === r.id && new Date(b.startAt) < new Date() && new Date(b.endAt) > new Date() && b.status !== 'Cancelled');
              const busy = active.length > 0;
              return (
                <div key={r.id} className="p-3 rounded-lg bg-white/5 flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${busy ? 'bg-red-500' : 'bg-emerald-500'}`} />
                  <div className="flex-1"><div className="text-sm font-medium">{r.name}</div><div className="text-xs text-muted-foreground">{busy ? 'In use' : 'Available'}</div></div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function MaintenancePage({ data, refresh, user }) {
  const rows = data.maintenance.map(m => ({ ...m, asset: data.assets.find(a => a.id === m.assetId) })).sort((a,b) => new Date(b.performedAt) - new Date(a.performedAt));
  const scheduled = rows.filter(r => r.status === 'Scheduled');
  const inProgress = rows.filter(r => r.status === 'In Progress');
  const completed = rows.filter(r => r.status === 'Completed');
  const totalCost = rows.reduce((s, r) => s + (r.cost || 0), 0);

  const complete = async (id) => { try { await api(`/maintenance/${id}`, { method: 'PATCH', body: { status: 'Completed' } }); toast.success('Marked complete'); refresh(); } catch (e) { toast.error(e.message); } };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Clock} label="Scheduled" value={scheduled.length} color="purple" />
        <StatCard icon={Wrench} label="In Progress" value={inProgress.length} color="amber" />
        <StatCard icon={CheckCircle2} label="Completed" value={completed.length} color="emerald" />
        <StatCard icon={DollarSign} label="Total Cost" value={`$${totalCost.toLocaleString()}`} color="blue" />
      </div>
      <Card className="glass p-4">
        <div className="text-sm font-semibold mb-3">All Maintenance Records</div>
        <div className="space-y-1.5">
          {rows.map(r => (
            <div key={r.id} className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-3">
              <Wrench className="w-4 h-4 text-amber-400" />
              <div className="flex-1">
                <div className="text-sm font-medium">{r.asset?.name} — {r.description}</div>
                <div className="text-xs text-muted-foreground">{r.type} • ${r.cost} • {r.performedBy} • {new Date(r.performedAt).toLocaleDateString()}</div>
              </div>
              <Badge className={r.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-300' : r.status === 'In Progress' ? 'bg-amber-500/10 text-amber-300' : 'bg-purple-500/10 text-purple-300'}>{r.status}</Badge>
              {r.status !== 'Completed' && ['Admin','Asset Manager'].includes(user.role) && <Button size="sm" variant="outline" onClick={() => complete(r.id)}>Complete</Button>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function AuditsPage({ data, refresh, user }) {
  const create = async () => {
    try { await api('/audits', { method: 'POST', body: { name: `Audit ${new Date().toLocaleDateString()}`, startDate: new Date().toISOString(), endDate: new Date(Date.now()+14*86400000).toISOString(), status: 'Scheduled' } }); toast.success('Audit created'); refresh(); } catch (e) { toast.error(e.message); }
  };
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="grid grid-cols-3 gap-4 flex-1">
          <StatCard icon={ClipboardCheck} label="Total Audits" value={data.audits.length} color="purple" />
          <StatCard icon={CheckCircle2} label="Completed" value={data.audits.filter(a => a.status === 'Completed').length} color="emerald" />
          <StatCard icon={Clock} label="Scheduled" value={data.audits.filter(a => a.status === 'Scheduled').length} color="blue" />
        </div>
        {['Admin','Asset Manager'].includes(user.role) && <Button onClick={create} className="ml-4 bg-gradient-to-r from-purple-500 to-blue-500"><Plus className="w-4 h-4 mr-1"/>New Audit</Button>}
      </div>
      <Card className="glass p-4">
        <div className="space-y-2">
          {data.audits.map(a => (
            <div key={a.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-semibold">{a.name}</div>
                  <div className="text-xs text-muted-foreground">{new Date(a.startDate).toLocaleDateString()} → {new Date(a.endDate).toLocaleDateString()}</div>
                </div>
                <Badge className={a.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-blue-500/10 text-blue-300'}>{a.status}</Badge>
              </div>
              {a.findings.length > 0 && (
                <div className="mt-3 space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground">Findings:</div>
                  {a.findings.map((f, i) => <div key={i} className="text-xs flex items-start gap-2"><span className={`w-1.5 h-1.5 rounded-full mt-1 ${f.severity === 'warning' ? 'bg-amber-400' : 'bg-blue-400'}`} />{f.note}</div>)}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function PeoplePage({ data, refresh, user }) {
  const canEdit = user.role === 'Admin';
  const change = async (uid, role) => { try { await api(`/users/${uid}`, { method: 'PATCH', body: { role, actorId: user.id } }); toast.success('Role updated'); refresh(); } catch (e) { toast.error(e.message); } };
  return (
    <Card className="glass p-4">
      <div className="space-y-2">
        {data.users.map(u => {
          const dept = data.departments.find(d => d.id === u.departmentId);
          const assetsCount = data.allocations.filter(a => a.userId === u.id && a.status === 'Active').length;
          return (
            <div key={u.id} className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">{u.name?.[0]}</div>
              <div className="flex-1">
                <div className="text-sm font-medium">{u.name}</div>
                <div className="text-xs text-muted-foreground">{u.email} • {dept?.name || 'No dept'} • {assetsCount} assets</div>
              </div>
              {canEdit && u.id !== user.id ? (
                <Select value={u.role} onValueChange={v => change(u.id, v)}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>{['Admin','Asset Manager','Department Head','Employee'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              ) : <Badge>{u.role}</Badge>}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function DepartmentsPage({ data }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.departments.map(d => {
        const members = data.users.filter(u => u.departmentId === d.id);
        const head = data.users.find(u => u.id === d.headId);
        return (
          <Card key={d.id} className="glass p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center"><Building2 className="w-5 h-5 text-purple-300" /></div>
              <div><div className="font-semibold">{d.name}</div><div className="text-xs text-muted-foreground">{d.code}</div></div>
            </div>
            <div className="text-sm text-muted-foreground">Head: <span className="text-white">{head?.name || '—'}</span></div>
            <div className="text-sm text-muted-foreground mt-1">{members.length} members</div>
          </Card>
        );
      })}
    </div>
  );
}

function ReportsPage({ data }) {
  const byCat = useMemo(() => {
    const m = {};
    data.assets.forEach(a => { const c = data.categories.find(c => c.id === a.categoryId); const n = c?.name || 'Other'; m[n] = (m[n] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [data]);
  const byDept = useMemo(() => {
    const m = {};
    data.departments.forEach(d => {
      const users = data.users.filter(u => u.departmentId === d.id);
      const count = data.allocations.filter(al => al.status === 'Active' && users.find(u => u.id === al.userId)).length;
      m[d.name] = count;
    });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="glass p-5">
        <h3 className="font-semibold mb-3">Assets by Category</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={byCat}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="#666" fontSize={10} />
            <YAxis stroke="#666" fontSize={11} />
            <RTooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
            <Bar dataKey="value" fill="#a78bfa" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card className="glass p-5">
        <h3 className="font-semibold mb-3">Allocations by Department</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={byDept} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" stroke="#666" fontSize={11} />
            <YAxis dataKey="name" type="category" stroke="#666" fontSize={11} width={100} />
            <RTooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
            <Bar dataKey="value" fill="#60a5fa" radius={[0,4,4,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function ActivityPage({ data }) {
  return (
    <Card className="glass p-4">
      <div className="space-y-1">
        {data.activityLogs.map(l => {
          const u = data.users.find(x => x.id === l.userId);
          return (
            <div key={l.id} className="p-3 rounded-lg bg-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><Activity className="w-4 h-4 text-purple-400" /></div>
              <div className="flex-1">
                <div className="text-sm"><span className="font-medium">{u?.name || 'System'}</span> <span className="text-muted-foreground">•</span> <span className="font-mono text-xs text-purple-300">{l.action}</span></div>
                <div className="text-xs text-muted-foreground">{l.entityType} {l.entityId?.slice(0,8)}</div>
              </div>
              <div className="text-xs text-muted-foreground">{new Date(l.timestamp).toLocaleString()}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [active, setActive] = useState('dashboard');
  const [copilotSeed, setCopilotSeed] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const refresh = async () => {
    try { const d = await api('/bootstrap'); setData(d); } catch (e) { console.error(e); }
  };

  useEffect(() => { if (user) refresh(); }, [user]);

  if (!user) return <AuthScreen onLogin={setUser} />;
  if (!data) return <div className="min-h-screen flex items-center justify-center"><div className="text-muted-foreground animate-pulse">Loading workspace...</div></div>;

  const setActiveWithSeed = (id, seed) => { setActive(id); if (seed) setCopilotSeed(seed); };

  const titles = {
    dashboard: { title: 'Dashboard', subtitle: 'Overview of your asset intelligence' },
    copilot: { title: 'AI Copilot', subtitle: 'Ask anything about your fleet' },
    assets: { title: 'Asset Directory', subtitle: 'All registered assets with predictive health scores' },
    allocations: { title: 'Allocations', subtitle: 'Track active assignments and returns' },
    bookings: { title: 'Resource Bookings', subtitle: 'Meeting rooms and shared resources' },
    maintenance: { title: 'Maintenance', subtitle: 'Schedule and track service records' },
    audits: { title: 'Audit Cycles', subtitle: 'Inventory verification & compliance' },
    departments: { title: 'Departments', subtitle: 'Organizational structure' },
    people: { title: 'Employee Directory', subtitle: 'Members and role management' },
    reports: { title: 'Reports & Analytics', subtitle: 'Business intelligence dashboards' },
    activity: { title: 'Activity Log', subtitle: 'Complete audit trail of all actions' },
    admin: { title: 'Admin Settings', subtitle: 'System configuration' },
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar active={active} setActive={setActive} user={user} onLogout={() => { localStorage.removeItem('user'); setUser(null); }} />
      <main className="flex-1 p-8 overflow-x-hidden">
        <TopBar {...titles[active]} notifications={data.notifications} user={user} />
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {active === 'dashboard' && <Dashboard data={data} setActive={setActiveWithSeed} />}
            {active === 'copilot' && <CopilotPage data={data} initialQuery={copilotSeed} user={user} />}
            {active === 'assets' && <AssetsPage data={data} refresh={refresh} user={user} />}
            {active === 'allocations' && <AllocationsPage data={data} refresh={refresh} user={user} />}
            {active === 'bookings' && <BookingsPage data={data} refresh={refresh} user={user} />}
            {active === 'maintenance' && <MaintenancePage data={data} refresh={refresh} user={user} />}
            {active === 'audits' && <AuditsPage data={data} refresh={refresh} user={user} />}
            {active === 'departments' && <DepartmentsPage data={data} />}
            {active === 'people' && <PeoplePage data={data} refresh={refresh} user={user} />}
            {active === 'reports' && <ReportsPage data={data} />}
            {active === 'activity' && <ActivityPage data={data} />}
            {active === 'admin' && <PeoplePage data={data} refresh={refresh} user={user} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;