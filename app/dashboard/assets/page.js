'use client';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Search, Plus, Package, Filter, Download, RefreshCw, QrCode } from 'lucide-react';
import { AssetRow } from '@/components/dashboard/AssetRow';
import { RegisterAssetDialog } from '@/components/dashboard/RegisterAssetDialog';
import { AssetDetailDialog } from '@/components/dashboard/AssetDetailDialog';

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

export default function AssetsPage() {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const userRole = useMemo(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored).role : null;
  }, []);

  const canManage = ['Admin', 'Asset Manager'].includes(userRole);

  const fetchAssets = async () => {
    try {
      const data = await api('/assets');
      setAssets(data);
    } catch (e) {
      toast.error('Failed to load assets');
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await api('/categories');
      setCategories(data);
    } catch (e) {
      toast.error('Failed to load categories');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchAssets(), fetchCategories()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      const matchesSearch = 
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.code.toLowerCase().includes(search.toLowerCase()) ||
        a.brand?.toLowerCase().includes(search.toLowerCase()) ||
        a.serialNumber?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || a.categoryId === categoryFilter;
      const matchesRisk = riskFilter === 'all' || a.prediction?.risk === riskFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesRisk;
    });
  }, [assets, search, statusFilter, categoryFilter, riskFilter]);

  const handleExportCSV = () => {
    try {
      const headers = ['Code', 'Name', 'Brand', 'Category', 'Status', 'Condition', 'Location', 'Health'];
      const rows = filteredAssets.map(a => [
        a.code,
        a.name,
        a.brand || '',
        categories.find(c => c.id === a.categoryId)?.name || '',
        a.status,
        a.condition,
        a.location || '',
        a.prediction?.health || 0
      ]);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Assets_${new Date().toISOString().slice(0,10)}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success('CSV exported successfully!');
    } catch (e) {
      toast.error('Failed to export CSV');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground animate-pulse">Loading assets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Asset Directory</h2>
          <p className="text-sm text-muted-foreground">
            {filteredAssets.length} asset{filteredAssets.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          {canManage && (
            <Button onClick={() => setRegisterOpen(true)} className="bg-gradient-to-r from-purple-500 to-blue-500">
              <Plus className="w-4 h-4 mr-2" /> Register Asset
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, code, brand..."
            className="pl-9 bg-black/20 border-white/10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 bg-black/20 border-white/10">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="Allocated">Allocated</SelectItem>
            <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
            <SelectItem value="Reserved">Reserved</SelectItem>
            <SelectItem value="Lost">Lost</SelectItem>
            <SelectItem value="Retired">Retired</SelectItem>
            <SelectItem value="Disposed">Disposed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40 bg-black/20 border-white/10">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-32 bg-black/20 border-white/10">
            <SelectValue placeholder="Risk" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risks</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Asset List */}
      <Card className="glass p-4">
        {filteredAssets.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No assets found</p>
            <p className="text-sm text-muted-foreground/60">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filteredAssets.map(asset => (
              <AssetRow
                key={asset.id}
                asset={asset}
                categories={categories}
                onClick={() => {
                  setSelectedAsset(asset);
                  setDetailOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Dialogs */}
      <RegisterAssetDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        categories={categories}
        onSuccess={fetchData}
      />

      <AssetDetailDialog
        asset={selectedAsset}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelectedAsset(null);
        }}
        onRefresh={fetchData}
      />
    </div>
  );
}