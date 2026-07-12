'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const api = async (path) => {
  const res = await fetch(`/api${path}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const d = await api('/bootstrap');
        setData(d);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground animate-pulse">Loading analytics...</div>
      </div>
    );
  }

  if (!data) return <div>Error loading data</div>;

  const { assets, allocations } = data;
  const totalValue = assets.reduce((s, a) => s + (a.purchaseCost || 0), 0);
  const available = assets.filter(a => a.status === 'Available').length;
  const allocated = assets.filter(a => a.status === 'Allocated').length;
  const inMaint = assets.filter(a => a.status === 'Under Maintenance').length;
  const avgHealth = Math.round(assets.reduce((s, a) => s + (a.prediction?.health || 0), 0) / (assets.length || 1));
  const overdue = allocations.filter(a => a.status === 'Active' && new Date(a.expectedReturnAt) < new Date()).length;

  // Risk distribution
  const riskDist = {};
  assets.forEach(a => {
    const risk = a.prediction?.risk || 'Unknown';
    riskDist[risk] = (riskDist[risk] || 0) + 1;
  });
  const riskData = Object.entries(riskDist).map(([name, value]) => ({ name, value }));
  const RISK_COLORS = { Low: '#10b981', Medium: '#f59e0b', High: '#f97316', Critical: '#ef4444', Unknown: '#94a3b8' };

  // Status distribution
  const statusDist = {};
  assets.forEach(a => {
    statusDist[a.status] = (statusDist[a.status] || 0) + 1;
  });
  const statusData = Object.entries(statusDist).map(([name, value]) => ({ name, value }));
  const STATUS_COLORS = ['#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#94a3b8'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="Boxes" label="Total Assets" value={assets.length} color="purple" />
        <StatCard icon="DollarSign" label="Portfolio Value" value={`$${(totalValue / 1000).toFixed(0)}K`} color="emerald" />
        <StatCard icon="ShieldCheck" label="Fleet Health" value={avgHealth} suffix="/100" color="blue" />
        <StatCard icon="AlertTriangle" label="Overdue" value={overdue} color={overdue > 0 ? 'red' : 'emerald'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass p-5">
          <h3 className="font-semibold mb-3">Asset Status Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" label>
                {statusData.map((_, i) => (
                  <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="glass p-5">
          <h3 className="font-semibold mb-3">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={riskData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" label>
                {riskData.map((entry) => (
                  <Cell key={entry.name} fill={RISK_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}