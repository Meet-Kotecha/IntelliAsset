'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';

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

export function RegisterAssetDialog({ open, onOpenChange, categories, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    brand: '',
    model: '',
    serialNumber: '',
    categoryId: categories[0]?.id || '',
    purchaseCost: '',
    purchaseDate: '',
    condition: 'Excellent',
    location: 'HQ Storage',
    warrantyExpiry: '',
    description: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api('/assets', {
        method: 'POST',
        body: {
          ...form,
          purchaseCost: parseFloat(form.purchaseCost) || 0,
          purchaseDate: form.purchaseDate || new Date().toISOString(),
          warrantyExpiry: form.warrantyExpiry || null,
        },
      });
      toast.success(`Asset ${data.code} registered successfully!`);
      setForm({
        name: '',
        brand: '',
        model: '',
        serialNumber: '',
        categoryId: categories[0]?.id || '',
        purchaseCost: '',
        purchaseDate: '',
        condition: 'Excellent',
        location: 'HQ Storage',
        warrantyExpiry: '',
        description: '',
      });
      onOpenChange(false);
      onSuccess();
    } catch (e) {
      toast.error(e.message);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register New Asset</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Asset Name *</Label>
              <Input
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                placeholder="e.g. MacBook Pro 16"
                required
              />
            </div>
            <div>
              <Label>Brand</Label>
              <Input
                value={form.brand}
                onChange={e => setForm({...form, brand: e.target.value})}
                placeholder="e.g. Apple, Dell, Lenovo"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Model</Label>
              <Input
                value={form.model}
                onChange={e => setForm({...form, model: e.target.value})}
                placeholder="Model number"
              />
            </div>
            <div>
              <Label>Serial Number</Label>
              <Input
                value={form.serialNumber}
                onChange={e => setForm({...form, serialNumber: e.target.value})}
                placeholder="SN-XXXX-XXXX"
              />
            </div>
          </div>

          <div>
            <Label>Category *</Label>
            <Select
              value={form.categoryId}
              onValueChange={v => setForm({...form, categoryId: v})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Purchase Cost</Label>
              <Input
                type="number"
                value={form.purchaseCost}
                onChange={e => setForm({...form, purchaseCost: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Purchase Date</Label>
              <Input
                type="date"
                value={form.purchaseDate}
                onChange={e => setForm({...form, purchaseDate: e.target.value})}
              />
            </div>
            <div>
              <Label>Condition</Label>
              <Select
                value={form.condition}
                onValueChange={v => setForm({...form, condition: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Location</Label>
              <Input
                value={form.location}
                onChange={e => setForm({...form, location: e.target.value})}
                placeholder="e.g. HQ Floor 3, Room 401"
              />
            </div>
            <div>
              <Label>Warranty Expiry</Label>
              <Input
                type="date"
                value={form.warrantyExpiry}
                onChange={e => setForm({...form, warrantyExpiry: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Additional notes about the asset..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-purple-500 to-blue-500">
              {loading ? 'Registering...' : 'Register Asset'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}