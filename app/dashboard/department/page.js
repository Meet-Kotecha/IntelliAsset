'use client';
import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Package, Clock, Calendar, TrendingUp, Building2, UserCheck, ArrowUpRight, Activity } from 'lucide-react';
import { toast } from 'sonner';

const api = async (path) => {
  const res = await fetch(`/api${path}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export default function DepartmentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const d = await api('/bootstrap');
        setData(d);
      } catch (e) {
        toast.error('Failed to load department data');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    if (!data || !user) return null;
    const { assets, users, allocations, bookings } = data;
    const deptId = user.departmentId;
    if (!deptId) return null;
    const deptUsers = users.filter(u => u.departmentId === deptId);
    const deptAllocs = allocations.filter(al => deptUsers.some(u => u.id === al.userId));
    const deptAssets = assets.filter(a => deptAllocs.some(al => al.assetId === a.id));
    const activeAllocs = deptAllocs.filter(al => al.status === 'Active');
    const overdue = activeAllocs.filter(al => new Date(al.expectedReturnAt) < new Date()).length;
    const deptBookings = bookings.filter(b => deptUsers.some(u => u.id === b.userId));

    return {
      deptUsers: deptUsers.length,
      deptAssets: deptAssets.length,
      activeAllocs: activeAllocs.length,
      overdue,
      deptBookings: deptBookings.length,
    };
  }, [data, user]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-muted-foreground animate-pulse">Loading department data...</div></div>;
  }

  if (!data || !stats) return <div className="text-center py-12 text-muted-foreground">No department data available</div>;

  const { deptUsers, deptAssets, activeAllocs, overdue, deptBookings } = stats;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Department Dashboard</h1>
          <p className="text-sm text-muted-foreground">{user?.departmentId ? 'Your department overview' : 'Department not assigned'}</p>
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
          <Activity className="w-3 h-3 mr-1" /> Live
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass p-5 relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase">Team Members</span>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center"><Users className="w-4 h-4 text-white" /></div>
          </div>
          <div className="text-3xl font-bold">{deptUsers}</div>
          <div className="text-xs text-muted-foreground mt-1">Active employees</div>
        </Card>

        <Card className="glass p-5 relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase">Department Assets</span>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center"><Package className="w-4 h-4 text-white" /></div>
          </div>
          <div className="text-3xl font-bold">{deptAssets}</div>
          <div className="text-xs text-muted-foreground mt-1">{activeAllocs} currently allocated</div>
        </Card>

        <Card className="glass p-5 relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase">Active Allocations</span>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center"><UserCheck className="w-4 h-4 text-white" /></div>
          </div>
          <div className="text-3xl font-bold text-emerald-400">{activeAllocs}</div>
          <div className="text-xs text-muted-foreground mt-1">{overdue} overdue</div>
        </Card>

        <Card className="glass p-5 relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-red-500/10 rounded-full blur-2xl" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase">Overdue Returns</span>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center"><Clock className="w-4 h-4 text-white" /></div>
          </div>
          <div className="text-3xl font-bold text-red-400">{overdue}</div>
          <div className="text-xs text-muted-foreground mt-1">Action required</div>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="glass p-3 text-center">
          <Calendar className="w-4 h-4 mx-auto text-purple-400" />
          <div className="text-lg font-bold">{deptBookings}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Bookings</div>
        </Card>
        <Card className="glass p-3 text-center">
          <TrendingUp className="w-4 h-4 mx-auto text-emerald-400" />
          <div className="text-lg font-bold">{(deptAssets > 0 ? (activeAllocs / deptAssets * 100) : 0).toFixed(0)}%</div>
          <div className="text-[10px] text-muted-foreground uppercase">Utilization</div>
        </Card>
      </div>

      <Card className="glass p-5">
        <h3 className="font-semibold mb-3">Recent Allocations</h3>
        {data.allocations.filter(al => al.status === 'Active').slice(0, 5).length === 0 ? (
          <p className="text-sm text-muted-foreground">No active allocations in your department.</p>
        ) : (
          <div className="space-y-2">
            {data.allocations.filter(al => al.status === 'Active').slice(0, 5).map(al => {
              const asset = data.assets.find(a => a.id === al.assetId);
              const holder = data.users.find(u => u.id === al.userId);
              return (
                <div key={al.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 text-sm">
                  <span>{asset?.name || 'Unknown'} — {holder?.name || 'Unknown'}</span>
                  <span className="text-xs text-muted-foreground">Due: {new Date(al.expectedReturnAt).toLocaleDateString()}</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}