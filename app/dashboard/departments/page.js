'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';

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

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', headId: '' });

  const fetchData = async () => {
    try {
      const [depts, usersData] = await Promise.all([
        api('/departments'),
        api('/users')
      ]);
      setDepartments(depts);
      setUsers(usersData);
    } catch (e) {
      toast.error('Failed to load data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await api(`/departments/${editingDept.id}`, { method: 'PUT', body: form });
        toast.success('Department updated');
      } else {
        await api('/departments', { method: 'POST', body: form });
        toast.success('Department created');
      }
      setDialogOpen(false);
      fetchData();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this department?')) return;
    try {
      await api(`/departments/${id}`, { method: 'DELETE' });
      toast.success('Department deleted');
      fetchData();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const openEdit = (dept) => {
    setEditingDept(dept);
    setForm({ name: dept.name, code: dept.code, headId: dept.headId || '' });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingDept(null);
    setForm({ name: '', code: '', headId: '' });
    setDialogOpen(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-muted-foreground animate-pulse">Loading...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Departments</h2>
          <p className="text-sm text-muted-foreground">Manage organizational departments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button onClick={openCreate} className="bg-gradient-to-r from-purple-500 to-blue-500">
            <Plus className="w-4 h-4 mr-2" /> New Department
          </Button>
        </div>
      </div>

      <Card className="glass p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Head</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No departments found
                </TableCell>
              </TableRow>
            ) : (
              departments.map((dept) => {
                const head = users.find(u => u.id === dept.headId);
                return (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell>{dept.code}</TableCell>
                    <TableCell>{head?.name || '—'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(dept)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(dept.id)}>
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle>{editingDept ? 'Edit Department' : 'Create Department'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>Code</Label>
              <Input
                value={form.code}
                onChange={e => setForm({...form, code: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>Department Head</Label>
              <Select value={form.headId} onValueChange={v => setForm({...form, headId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a department head" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.name} ({u.role})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-gradient-to-r from-purple-500 to-blue-500">
                {editingDept ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}