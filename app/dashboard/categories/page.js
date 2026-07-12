'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';

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

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', icon: '📦', description: '' });

  const fetchData = async () => {
    try {
      const data = await api('/categories');
      setCategories(data);
    } catch (e) {
      toast.error('Failed to load categories');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api(`/categories/${editing.id}`, { method: 'PUT', body: form });
        toast.success('Category updated');
      } else {
        await api('/categories', { method: 'POST', body: form });
        toast.success('Category created');
      }
      setDialogOpen(false);
      fetchData();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api(`/categories/${id}`, { method: 'DELETE' });
      toast.success('Category deleted');
      fetchData();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, icon: cat.icon, description: cat.description });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', icon: '📦', description: '' });
    setDialogOpen(true);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-muted-foreground animate-pulse">Loading...</div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Asset Categories</h2>
          <p className="text-sm text-muted-foreground">Manage asset categories</p>
        </div>
        <Button onClick={openCreate} className="bg-gradient-to-r from-purple-500 to-blue-500">
          <Plus className="w-4 h-4 mr-2" /> New Category
        </Button>
      </div>

      <Card className="glass p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Icon</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="text-2xl">{cat.icon || '📦'}</TableCell>
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell>{cat.description}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(cat)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id)}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Category' : 'Create Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div>
              <Label>Icon (emoji)</Label>
              <Input value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} placeholder="📦" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-gradient-to-r from-purple-500 to-blue-500">
                {editing ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}