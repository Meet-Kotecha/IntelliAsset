'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/StatCard';

const api = async (path) => {
  const res = await fetch(`/api${path}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export default function ManagerDashboard() {
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
        <div className="text-muted-foreground animate-pulse">Loading asset data...</div>
      </div>
    );
  }

  if (!data) return <div>Error loading data</div>;

  const { assets, allocations } = data;
  const available = assets.filter(a => a.status === 'Available').length;
  const allocated = assets.filter(a => a.status === 'Allocated').length;
  const inMaint = assets.filter(a => a.status === 'Under Maintenance').length;
  const avgHealth = Math.round(assets.reduce((s, a) => s + (a.prediction?.health || 0), 0) / (assets.length || 1));
  const overdue = allocations.filter(a => a.status === 'Active' && new Date(a.expectedReturnAt) < new Date()).length;

  // Top 5 high-risk assets
  const highRisk = [...assets]
    .filter(a => ['High', 'Critical'].includes(a.prediction?.risk))
    .sort((a, b) => (a.prediction?.health || 0) - (b.prediction?.health || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="Package" label="Total Assets" value={assets.length} color="purple" />
        <StatCard icon="CheckCircle" label="Available" value={available} color="emerald" />
        <StatCard icon="AlertTriangle" label="Overdue" value={overdue} color={overdue > 0 ? 'red' : 'emerald'} />
        <StatCard icon="ShieldCheck" label="Avg Health" value={avgHealth} suffix="/100" color="blue" />
      </div>

      <Card className="glass p-5">
        <h3 className="font-semibold mb-3">High-Risk Assets (Attention Needed)</h3>
        {highRisk.length === 0 ? (
          <p className="text-sm text-muted-foreground">No high-risk assets detected.</p>
        ) : (
          <div className="space-y-2">
            {highRisk.map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                <div>
                  <div className="text-sm font-medium">{a.name}</div>
                  <div className="text-xs text-muted-foreground">{a.code} • {a.status}</div>
                </div>
                <div className="text-sm">
                  <span className="text-red-400 font-semibold">{a.prediction?.risk}</span>
                  <span className="text-muted-foreground ml-2">Health: {a.prediction?.health}/100</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}