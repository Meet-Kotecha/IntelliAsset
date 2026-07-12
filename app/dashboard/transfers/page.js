'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { RefreshCw, ArrowRightLeft, CheckCircle, XCircle } from 'lucide-react';
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

export default function TransfersPage() {
  const [transfers, setTransfers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ assetId: '', toUserId: '' });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const fetchData = async () => {
    try {
      const [transfersData, assetsData, usersData] = await Promise.all([
        api('/transfers'),
        api('/assets'),
        api('/users')
      ]);
      setTransfers(transfersData);
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

  const handleRequestTransfer = async (e) => {
    e.preventDefault();
    try {
      // Need current user ID and asset allocation holder
      const asset = assets.find(a => a.id === form.assetId);
      if (!asset) return toast.error('Asset not found');
      const activeAlloc = await api('/allocations').then(data => data.find(a => a.assetId === form.assetId && a.status === 'Active'));
      if (!activeAlloc) return toast.error('Asset is not allocated');
      await api('/transfers', {
        method: 'POST',
        body: {
          assetId: form.assetId,
          fromUserId: activeAlloc.userId,
          toUserId: form.toUserId,
        },
      });
      toast.success('Transfer completed');
      setDialogOpen(false);
      fetchData();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const canApprove = user?.role === 'Admin' || user?.role === 'Asset Manager' || user?.role === 'Department Head';
  const canRequest = user?.role === 'Employee' || user?.role === 'Department Head';

  const rows = transfers.map(t => ({
    ...t,
    asset: assets.find(a => a.id === t.assetId),
    fromUser: users.find(u => u.id === t.fromUserId),
    toUser: users.find(u => u.id === t.toUserId),
  }));

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-muted-foreground animate-pulse">Loading transfers...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Transfers</h2>
          <p className="text-sm text-muted-foreground">
            {transfers.length} transfer{transfers.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          {canRequest && (
            <Button onClick={() => setDialogOpen(true)} className="bg-gradient-to-r from-purple-500 to-blue-500">
              <ArrowRightLeft className="w-4 h-4 mr-2" /> Request Transfer
            </Button>
          )}
        </div>
      </div>

      <Card className="glass p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No transfers found
                </TableCell>
              </TableRow>
            ) : (
              rows.map(row => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">
                    <div>{row.asset?.name || 'Unknown'}</div>
                    <div className="text-xs text-muted-foreground">{row.asset?.code || 'N/A'}</div>
                  </TableCell>
                  <TableCell>{row.fromUser?.name || 'Unknown'}</TableCell>
                  <TableCell>{row.toUser?.name || 'Unknown'}</TableCell>
                  <TableCell>{format(new Date(row.requestedAt), 'PP')}</TableCell>
                  <TableCell>
                    <Badge className={row.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}>
                      {row.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Request Transfer Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle>Request Asset Transfer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRequestTransfer} className="space-y-4">
            <div>
              <Label>Asset to Transfer</Label>
              <Select value={form.assetId} onValueChange={v => setForm({...form, assetId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an asset" />
                </SelectTrigger>
                <SelectContent>
                  {assets
                    .filter(a => a.status === 'Allocated')
                    .map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.name} ({a.code})</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Transfer To</Label>
              <Select value={form.toUserId} onValueChange={v => setForm({...form, toUserId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(u => u.status !== 'Inactive').map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-gradient-to-r from-purple-500 to-blue-500">Request Transfer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}