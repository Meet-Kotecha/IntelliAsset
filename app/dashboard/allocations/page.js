'use client';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, RefreshCw, ArrowRightLeft, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

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

export default function AllocationsPage() {
  const [allocations, setAllocations] = useState([]);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ assetId: '', userId: '', expectedReturnAt: '' });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const fetchData = async () => {
    try {
      const [allocs, assetsData, usersData] = await Promise.all([
        api('/allocations'),
        api('/assets'),
        api('/users')
      ]);
      setAllocations(allocs);
      setAssets(assetsData);
      setUsers(usersData);
    } catch (e) {
      toast.error('Failed to load data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAllocate = async (e) => {
    e.preventDefault();
    try {
      await api('/allocations', {
        method: 'POST',
        body: {
          assetId: form.assetId,
          userId: form.userId,
          expectedReturnAt: form.expectedReturnAt || new Date(Date.now() + 30 * 86400000).toISOString(),
        },
      });
      toast.success('Asset allocated successfully');
      setDialogOpen(false);
      fetchData();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleReturn = async (allocationId) => {
    if (!confirm('Return this asset?')) return;
    try {
      await api(`/allocations/${allocationId}/return`, { method: 'POST' });
      toast.success('Asset returned');
      fetchData();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const canManage = user?.role === 'Admin' || user?.role === 'Asset Manager';

  // Get available assets (not allocated and not under maintenance)
  const availableAssets = assets.filter(a => a.status === 'Available');

  // Find active users
  const activeUsers = users.filter(u => u.status !== 'Inactive');

  const rows = allocations.map(alloc => ({
    ...alloc,
    asset: assets.find(a => a.id === alloc.assetId),
    user: users.find(u => u.id === alloc.userId),
  }));

  const activeAllocations = rows.filter(r => r.status === 'Active');
  const overdue = activeAllocations.filter(r => new Date(r.expectedReturnAt) < new Date());

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-muted-foreground animate-pulse">Loading allocations...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Allocations</h2>
          <p className="text-sm text-muted-foreground">
            {activeAllocations.length} active allocation{activeAllocations.length !== 1 ? 's' : ''}
            {overdue.length > 0 && ` (${overdue.length} overdue)`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          {canManage && (
            <Button onClick={() => setDialogOpen(true)} className="bg-gradient-to-r from-purple-500 to-blue-500">
              <Plus className="w-4 h-4 mr-2" /> New Allocation
            </Button>
          )}
        </div>
      </div>

      <Card className="glass p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Allocated To</TableHead>
              <TableHead>Allocated At</TableHead>
              <TableHead>Expected Return</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No allocations found
                </TableCell>
              </TableRow>
            ) : (
              rows.map(row => {
                const isOverdue = row.status === 'Active' && new Date(row.expectedReturnAt) < new Date();
                return (
                  <TableRow key={row.id} className={isOverdue ? 'bg-red-500/5' : ''}>
                    <TableCell className="font-medium">
                      <div>{row.asset?.name || 'Unknown'}</div>
                      <div className="text-xs text-muted-foreground">{row.asset?.code || 'N/A'}</div>
                    </TableCell>
                    <TableCell>{row.user?.name || 'Unknown'}</TableCell>
                    <TableCell>{format(new Date(row.allocatedAt), 'PP')}</TableCell>
                    <TableCell className={isOverdue ? 'text-red-400 font-semibold' : ''}>
                      {format(new Date(row.expectedReturnAt), 'PP')}
                      {isOverdue && ' ⚠️'}
                    </TableCell>
                    <TableCell>
                      <Badge className={row.status === 'Active' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}>
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {row.status === 'Active' && canManage && (
                        <Button variant="outline" size="sm" onClick={() => handleReturn(row.id)}>
                          <CheckCircle className="w-4 h-4 mr-2" /> Return
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* New Allocation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle>New Allocation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAllocate} className="space-y-4">
            <div>
              <Label>Asset</Label>
              <Select value={form.assetId} onValueChange={v => setForm({...form, assetId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an asset" />
                </SelectTrigger>
                <SelectContent>
                  {availableAssets.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name} ({a.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>User</Label>
              <Select value={form.userId} onValueChange={v => setForm({...form, userId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {activeUsers.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Expected Return Date</Label>
              <Input
                type="date"
                value={form.expectedReturnAt}
                onChange={e => setForm({...form, expectedReturnAt: e.target.value})}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-gradient-to-r from-purple-500 to-blue-500">Allocate</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}