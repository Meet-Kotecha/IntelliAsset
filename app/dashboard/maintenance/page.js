'use client';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, RefreshCw, Wrench, CheckCircle, XCircle, Clock, AlertTriangle, User, Calendar, FileText } from 'lucide-react';
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

export default function MaintenancePage() {
  const [maintenance, setMaintenance] = useState([]);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, in-progress, resolved
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    assetId: '',
    type: 'Preventive',
    description: '',
    cost: '',
    performedBy: '',
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const fetchData = async () => {
    try {
      const [maintData, assetsData, usersData] = await Promise.all([
        api('/maintenance'),
        api('/assets'),
        api('/users')
      ]);
      setMaintenance(maintData);
      setAssets(assetsData);
      setUsers(usersData);
    } catch (e) {
      toast.error('Failed to load maintenance data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper to get asset and requester names
  const rows = useMemo(() => {
    return maintenance.map(m => ({
      ...m,
      asset: assets.find(a => a.id === m.assetId),
      requester: users.find(u => u.id === m.userId),
    }));
  }, [maintenance, assets, users]);

  const filteredRows = useMemo(() => {
    if (filter === 'all') return rows;
    return rows.filter(r => r.status?.toLowerCase().replace(' ', '-') === filter);
  }, [rows, filter]);

  const canManage = user?.role === 'Admin' || user?.role === 'Asset Manager';
  const canRequest = user?.role === 'Employee' || user?.role === 'Department Head' || canManage;

  const createMaintenance = async (e) => {
    e.preventDefault();
    try {
      await api('/maintenance', {
        method: 'POST',
        body: {
          assetId: form.assetId,
          type: form.type,
          description: form.description,
          cost: parseFloat(form.cost) || 0,
          performedBy: form.performedBy || 'Internal Team',
          status: 'Pending', // default
        },
      });
      toast.success('Maintenance request created');
      setDialogOpen(false);
      setForm({ assetId: '', type: 'Preventive', description: '', cost: '', performedBy: '' });
      fetchData();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await api(`/maintenance/${id}`, {
        method: 'PATCH',
        body: { status: newStatus },
      });
      toast.success(`Maintenance ${newStatus}`);
      fetchData();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      'Pending': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'Approved': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'In Progress': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'Resolved': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'Rejected': 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return map[status] || 'bg-gray-500/10 text-gray-400';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-muted-foreground animate-pulse">Loading maintenance records...</div></div>;
  }

  const availableAssets = assets.filter(a => a.status !== 'Retired' && a.status !== 'Disposed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Maintenance</h2>
          <p className="text-sm text-muted-foreground">
            {maintenance.filter(m => m.status === 'Pending').length} pending requests
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          {canRequest && (
            <Button onClick={() => setDialogOpen(true)} className="bg-gradient-to-r from-purple-500 to-blue-500">
              <Plus className="w-4 h-4 mr-2" /> Request Maintenance
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border/50 pb-2">
        {['all', 'pending', 'approved', 'in-progress', 'resolved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === status
                ? 'bg-purple-500/20 text-purple-400'
                : 'text-muted-foreground hover:bg-white/5'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="glass p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No maintenance records found
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map(row => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">
                    <div>{row.asset?.name || 'Unknown'}</div>
                    <div className="text-xs text-muted-foreground">{row.asset?.code || 'N/A'}</div>
                  </TableCell>
                  <TableCell>{row.type || '—'}</TableCell>
                  <TableCell className="max-w-xs truncate">{row.description}</TableCell>
                  <TableCell>{row.requester?.name || 'System'}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(row.status)}>
                      {row.status || 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {row.status === 'Pending' && canManage && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateStatus(row.id, 'Approved')}
                            className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateStatus(row.id, 'Rejected')}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {row.status === 'Approved' && canManage && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateStatus(row.id, 'In Progress')}
                          className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                        >
                          <Clock className="w-4 h-4" />
                        </Button>
                      )}
                      {row.status === 'In Progress' && canManage && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateStatus(row.id, 'Resolved')}
                          className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create Maintenance Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass max-w-md">
          <DialogHeader>
            <DialogTitle>Request Maintenance</DialogTitle>
          </DialogHeader>
          <form onSubmit={createMaintenance} className="space-y-4">
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
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Preventive">Preventive</SelectItem>
                  <SelectItem value="Corrective">Corrective</SelectItem>
                  <SelectItem value="Inspection">Inspection</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                placeholder="Describe the issue..."
                rows={2}
                required
              />
            </div>
            <div>
              <Label>Estimated Cost ($)</Label>
              <Input
                type="number"
                value={form.cost}
                onChange={e => setForm({...form, cost: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Technician / Performed By</Label>
              <Input
                value={form.performedBy}
                onChange={e => setForm({...form, performedBy: e.target.value})}
                placeholder="Internal Team"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-gradient-to-r from-purple-500 to-blue-500">
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}