'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/StatCard';

const api = async (path) => {
  const res = await fetch(`/api${path}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export default function EmployeeDashboard() {
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
        <div className="text-muted-foreground animate-pulse">Loading your assets...</div>
      </div>
    );
  }

  if (!data) return <div>Error loading data</div>;

  const { assets, allocations, bookings } = data;
  const stored = localStorage.getItem('user');
  const user = stored ? JSON.parse(stored) : null;
  const userId = user?.id;

  const myAllocs = allocations.filter(al => al.userId === userId && al.status === 'Active');
  const myAssets = assets.filter(a => myAllocs.some(al => al.assetId === a.id));
  const myBookings = bookings.filter(b => b.userId === userId && b.status !== 'Cancelled');
  const upcomingBookings = myBookings.filter(b => new Date(b.endAt) >= new Date());
  const overdue = myAllocs.filter(al => new Date(al.expectedReturnAt) < new Date());

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="Package" label="My Assets" value={myAssets.length} color="purple" />
        <StatCard icon="Calendar" label="Upcoming Bookings" value={upcomingBookings.length} color="blue" />
        <StatCard icon="Clock" label="Overdue Returns" value={overdue.length} color={overdue.length > 0 ? 'red' : 'emerald'} />
        <StatCard icon="ShieldCheck" label="Health Score" value="Good" color="emerald" />
      </div>

      <Card className="glass p-5">
        <h3 className="font-semibold mb-3">Your Assets</h3>
        {myAssets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No assets allocated to you.</p>
        ) : (
          <div className="space-y-2">
            {myAssets.map(a => {
              const alloc = myAllocs.find(al => al.assetId === a.id);
              const health = a.prediction?.health || 0;
              return (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                  <div>
                    <div className="text-sm font-medium">{a.name}</div>
                    <div className="text-xs text-muted-foreground">{a.code} • {a.brand}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      Due: {alloc?.expectedReturnAt ? new Date(alloc.expectedReturnAt).toDateString() : 'N/A'}
                    </span>
                    <span className={`text-xs font-semibold ${health >= 75 ? 'text-emerald-400' : health >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                      Health: {health}/100
                    </span>
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