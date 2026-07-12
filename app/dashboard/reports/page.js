'use client';
import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Download, FileText, TrendingUp, Package, AlertTriangle, Calendar, Clock, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

const api = async (path) => {
  const res = await fetch(`/api${path}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const d = await api('/bootstrap');
      setData(d);
    } catch (e) {
      toast.error('Failed to load report data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Prepare data for charts
  const chartData = useMemo(() => {
    if (!data) return null;

    const { assets, allocations, bookings, maintenance, departments, users } = data;

    // 1. Asset Status Distribution
    const statusCounts = {};
    assets.forEach(a => {
      statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
    });
    const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    const STATUS_COLORS = ['#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#94a3b8', '#64748b'];

    // 2. Department Allocation
    const deptAlloc = {};
    departments.forEach(dept => {
      const deptUsers = users.filter(u => u.departmentId === dept.id);
      const count = allocations.filter(al => 
        al.status === 'Active' && deptUsers.some(u => u.id === al.userId)
      ).length;
      deptAlloc[dept.name] = count;
    });
    const deptData = Object.entries(deptAlloc).map(([name, value]) => ({ name, value }));

    // 3. Maintenance Frequency (last 30 days)
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    }).reverse();
    const maintCount = {};
    maintenance.forEach(m => {
      const day = new Date(m.performedAt).toISOString().slice(0, 10);
      maintCount[day] = (maintCount[day] || 0) + 1;
    });
    const maintData = last30Days.map(day => ({
      day: format(new Date(day), 'MMM dd'),
      count: maintCount[day] || 0,
    }));

    // 4. Idle assets (Available)
    const idleAssets = assets.filter(a => a.status === 'Available');

    // 5. Upcoming returns (allocations with expectedReturnAt in next 7 days)
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 86400000);
    const upcomingReturns = allocations.filter(al => 
      al.status === 'Active' && 
      new Date(al.expectedReturnAt) >= now &&
      new Date(al.expectedReturnAt) <= nextWeek
    );

    // 6. Assets near retirement (health < 40 or age > 5 years)
    const nearRetirement = assets.filter(a => 
      (a.prediction?.health || 0) < 40 || (a.prediction?.ageYears || 0) > 5
    );

    // 7. Booking heatmap (bookings per day last 14 days)
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    }).reverse();
    const bookingCount = {};
    bookings.forEach(b => {
      const day = new Date(b.startAt).toISOString().slice(0, 10);
      bookingCount[day] = (bookingCount[day] || 0) + 1;
    });
    const bookingData = last14Days.map(day => ({
      day: format(new Date(day), 'MMM dd'),
      bookings: bookingCount[day] || 0,
    }));

    return {
      statusData,
      STATUS_COLORS,
      deptData,
      maintData,
      idleAssets: idleAssets.length,
      upcomingReturns,
      nearRetirement,
      bookingData,
      totalAssets: assets.length,
      allocatedCount: allocations.filter(al => al.status === 'Active').length,
      availableCount: idleAssets.length,
      underMaintenance: assets.filter(a => a.status === 'Under Maintenance').length,
    };
  }, [data]);

  const handleExportCSV = () => {
    if (!data) return;
    try {
      const { assets } = data;
      const headers = ['Code', 'Name', 'Brand', 'Status', 'Health', 'Risk'];
      const rows = assets.map(a => [
        a.code,
        a.name,
        a.brand || '',
        a.status,
        a.prediction?.health || 0,
        a.prediction?.risk || 'N/A'
      ]);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Asset_Report_${new Date().toISOString().slice(0,10)}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success('CSV exported successfully');
    } catch (e) {
      toast.error('Failed to export CSV');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-muted-foreground animate-pulse">Loading reports...</div></div>;
  }

  if (!data || !chartData) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">No data available</div>;
  }

  const { 
    statusData, STATUS_COLORS, deptData, maintData, 
    idleAssets, upcomingReturns, nearRetirement, bookingData,
    totalAssets, allocatedCount, availableCount, underMaintenance
  } = chartData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-sm text-muted-foreground">Live insights from your asset data</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass p-4 text-center">
          <div className="text-3xl font-bold gradient-text">{totalAssets}</div>
          <div className="text-xs text-muted-foreground mt-1">Total Assets</div>
        </Card>
        <Card className="glass p-4 text-center">
          <div className="text-3xl font-bold text-blue-400">{allocatedCount}</div>
          <div className="text-xs text-muted-foreground mt-1">Allocated</div>
        </Card>
        <Card className="glass p-4 text-center">
          <div className="text-3xl font-bold text-emerald-400">{availableCount}</div>
          <div className="text-xs text-muted-foreground mt-1">Available</div>
        </Card>
        <Card className="glass p-4 text-center">
          <div className="text-3xl font-bold text-amber-400">{underMaintenance}</div>
          <div className="text-xs text-muted-foreground mt-1">Under Maintenance</div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Status Distribution */}
        <Card className="glass p-5">
          <h3 className="font-semibold mb-3">Asset Status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {statusData.map((_, i) => (
                  <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Department Allocation */}
        <Card className="glass p-5">
          <h3 className="font-semibold mb-3">Allocations by Department</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#666" fontSize={10} />
              <YAxis stroke="#666" fontSize={11} />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Bar dataKey="value" fill="#a78bfa" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Frequency */}
        <Card className="glass p-5">
          <h3 className="font-semibold mb-3">Maintenance Frequency (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={maintData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#666" fontSize={10} />
              <YAxis stroke="#666" fontSize={11} />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Line type="monotone" dataKey="count" stroke="#60a5fa" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Booking Heatmap */}
        <Card className="glass p-5">
          <h3 className="font-semibold mb-3">Bookings (Last 14 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={bookingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#666" fontSize={10} />
              <YAxis stroke="#666" fontSize={11} />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Area type="monotone" dataKey="bookings" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Package className="w-4 h-4" /> Idle Assets
          </div>
          <div className="text-2xl font-bold">{idleAssets}</div>
          <div className="text-xs text-muted-foreground">Assets available for allocation</div>
        </Card>
        <Card className="glass p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="w-4 h-4" /> Upcoming Returns
          </div>
          <div className="text-2xl font-bold">{upcomingReturns.length}</div>
          <div className="text-xs text-muted-foreground">Due in next 7 days</div>
        </Card>
        <Card className="glass p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <AlertTriangle className="w-4 h-4" /> Near Retirement
          </div>
          <div className="text-2xl font-bold">{nearRetirement.length}</div>
          <div className="text-xs text-muted-foreground">Health &lt; 40 or age &gt; 5 years</div>
        </Card>
      </div>
    </div>
  );
}