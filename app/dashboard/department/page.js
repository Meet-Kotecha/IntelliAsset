'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/StatCard';

const api = async (path) => {
  const res = await fetch(`/api${path}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export default function DepartmentDashboard() {
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
        <div className="text-muted-foreground animate-pulse">Loading department data...</div>
      </div>
    );
  }

  if (!data) return <div>Error loading data</div>;

  const { assets, users, allocations } = data;
  // Find department of the logged-in user
  const stored = localStorage.getItem('user');
  const user = stored ? JSON.parse(stored) : null;
  const departmentId = user?.departmentId;

  const deptUsers = users.filter(u => u.departmentId === departmentId);
  const deptAllocs = allocations.filter(al => deptUsers.some(u => u.id === al.userId));
  const deptAssets = assets.filter(a => deptAllocs.some(al => al.assetId === a.id));
  const activeAllocs = deptAllocs.filter(al => al.status === 'Active');
  const overdue = activeAllocs.filter(al => new Date(al.expectedReturnAt) < new Date());

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon="Users" label="Team Members" value={deptUsers.length} color="purple" />
        <StatCard icon="Package" label="Department Assets" value={deptAssets.length} color="blue" />
        <StatCard icon="Clock" label="Overdue Returns" value={overdue.length} color={overdue.length > 0 ? 'red' : 'emerald'} />
      </div>

      <Card className="glass p-5">
        <h3 className="font-semibold mb-3">Recent Allocations</h3>
        {activeAllocs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active allocations in your department.</p>
        ) : (
          <div className="space-y-2">
            {activeAllocs.slice(0, 5).map(al => {
              const asset = assets.find(a => a.id === al.assetId);
              const holder = users.find(u => u.id === al.userId);
              return (
                <div key={al.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                  <div>
                    <div className="text-sm font-medium">{asset?.name}</div>
                    <div className="text-xs text-muted-foreground">Held by {holder?.name}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Due {new Date(al.expectedReturnAt).toDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}