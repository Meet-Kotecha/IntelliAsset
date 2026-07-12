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
import { Plus, RefreshCw, ClipboardCheck, User, Calendar, FileText, CheckCircle, XCircle, AlertTriangle, Eye } from 'lucide-react';
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

export default function AuditsPage() {
  const [audits, setAudits] = useState([]);
  const [users, setUsers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [form, setForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    status: 'Scheduled',
    auditorId: '',
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const fetchData = async () => {
    try {
      const [auditsData, usersData, assetsData] = await Promise.all([
        api('/audits'),
        api('/users'),
        api('/assets')
      ]);
      setAudits(auditsData);
      setUsers(usersData);
      setAssets(assetsData);
    } catch (e) {
      toast.error('Failed to load audit data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const canManage = user?.role === 'Admin' || user?.role === 'Asset Manager';

  const createAudit = async (e) => {
    e.preventDefault();
    try {
      await api('/audits', {
        method: 'POST',
        body: {
          name: form.name,
          startDate: form.startDate,
          endDate: form.endDate,
          status: form.status || 'Scheduled',
          auditorId: form.auditorId,
        },
      });
      toast.success('Audit cycle created');
      setDialogOpen(false);
      setForm({ name: '', startDate: '', endDate: '', status: 'Scheduled', auditorId: '' });
      fetchData();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const updateAuditStatus = async (id, status) => {
    try {
      await api(`/audits/${id}`, {
        method: 'PATCH',
        body: { status },
      });
      toast.success(`Audit ${status}`);
      fetchData();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      'Scheduled': 'bg-blue-500/10 text-blue-400',
      'In Progress': 'bg-amber-500/10 text-amber-400',
      'Completed': 'bg-emerald-500/10 text-emerald-400',
      'Closed': 'bg-gray-500/10 text-gray-400',
    };
    return map[status] || 'bg-gray-500/10 text-gray-400';
  };

  const openDetail = (audit) => {
    setSelectedAudit(audit);
    setDetailOpen(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-muted-foreground animate-pulse">Loading audits...</div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Audit Cycles</h2>
          <p className="text-sm text-muted-foreground">
            {audits.filter(a => a.status === 'Scheduled' || a.status === 'In Progress').length} active audits
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          {canManage && (
            <Button onClick={() => setDialogOpen(true)} className="bg-gradient-to-r from-purple-500 to-blue-500">
              <Plus className="w-4 h-4 mr-2" /> New Audit
            </Button>
          )}
        </div>
      </div>

      {/* Audit List */}
      <Card className="glass p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Auditor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {audits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No audits found
                </TableCell>
              </TableRow>
            ) : (
              audits.map(a => {
                const auditor = users.find(u => u.id === a.auditorId);
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell>{format(new Date(a.startDate), 'PP')}</TableCell>
                    <TableCell>{format(new Date(a.endDate), 'PP')}</TableCell>
                    <TableCell>{auditor?.name || 'Not assigned'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(a.status)}>{a.status || 'Scheduled'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openDetail(a)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {canManage && a.status === 'Scheduled' && (
                          <Button variant="ghost" size="sm" onClick={() => updateAuditStatus(a.id, 'In Progress')}>
                            <CheckCircle className="w-4 h-4 text-amber-400" />
                          </Button>
                        )}
                        {canManage && a.status === 'In Progress' && (
                          <Button variant="ghost" size="sm" onClick={() => updateAuditStatus(a.id, 'Completed')}>
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          </Button>
                        )}
                        {canManage && a.status === 'Completed' && (
                          <Button variant="ghost" size="sm" onClick={() => updateAuditStatus(a.id, 'Closed')}>
                            <CheckCircle className="w-4 h-4 text-gray-400" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create Audit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass max-w-md">
          <DialogHeader>
            <DialogTitle>Create Audit Cycle</DialogTitle>
          </DialogHeader>
          <form onSubmit={createAudit} className="space-y-4">
            <div>
              <Label>Audit Name</Label>
              <Input
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                placeholder="Q2 2025 Full Inventory Audit"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm({...form, startDate: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={e => setForm({...form, endDate: e.target.value})}
                  required
                />
              </div>
            </div>
            <div>
              <Label>Auditor</Label>
              <Select value={form.auditorId} onValueChange={v => setForm({...form, auditorId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an auditor" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-gradient-to-r from-purple-500 to-blue-500">Create Audit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Audit Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="glass max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedAudit && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedAudit.name}</DialogTitle>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(selectedAudit.startDate), 'PP')} → {format(new Date(selectedAudit.endDate), 'PP')}
                </div>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusBadge(selectedAudit.status)}>{selectedAudit.status}</Badge>
                  {selectedAudit.auditorId && (
                    <Badge variant="outline">
                      <User className="w-3 h-3 mr-1" /> {users.find(u => u.id === selectedAudit.auditorId)?.name || 'N/A'}
                    </Badge>
                  )}
                </div>
                {selectedAudit.findings && selectedAudit.findings.length > 0 ? (
                  <div>
                    <h4 className="font-semibold mb-2">Findings</h4>
                    <div className="space-y-2">
                      {selectedAudit.findings.map((f, i) => (
                        <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-start gap-2">
                          {f.severity === 'warning' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                          )}
                          <span className="text-sm">{f.note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No findings recorded yet.</p>
                )}
                {selectedAudit.status !== 'Closed' && canManage && (
                  <div className="flex gap-2 pt-4 border-t border-border/50">
                    <Button variant="outline" size="sm" onClick={() => updateAuditStatus(selectedAudit.id, 'In Progress')}>
                      Start Audit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => updateAuditStatus(selectedAudit.id, 'Completed')}>
                      Complete Audit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => updateAuditStatus(selectedAudit.id, 'Closed')}>
                      Close Audit
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}