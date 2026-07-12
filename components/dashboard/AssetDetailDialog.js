'use client';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { HealthRing } from './HealthRing';
import { X, Wrench, Calendar, DollarSign, MapPin, Barcode, History, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const STATUS_COLORS = {
  Available: 'bg-emerald-500/10 text-emerald-400',
  Allocated: 'bg-blue-500/10 text-blue-400',
  Reserved: 'bg-purple-500/10 text-purple-400',
  'Under Maintenance': 'bg-amber-500/10 text-amber-400',
  Lost: 'bg-red-500/10 text-red-400',
  Retired: 'bg-gray-500/10 text-gray-400',
  Disposed: 'bg-gray-500/5 text-gray-500',
};

const RISK_COLORS = {
  Low: 'text-emerald-400',
  Medium: 'text-amber-400',
  High: 'text-orange-400',
  Critical: 'text-red-400',
};

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

export function AssetDetailDialog({ asset, open, onOpenChange, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [allocating, setAllocating] = useState(false);
  const [users, setUsers] = useState([]);

  if (!asset) return null;

  const p = asset.prediction || {};
  const color = p.health >= 75 ? '#10b981' : p.health >= 55 ? '#f59e0b' : p.health >= 35 ? '#f97316' : '#ef4444';

  const handleAllocate = async (userId) => {
    if (!userId) return;
    setAllocating(true);
    try {
      await api('/allocations', {
        method: 'POST',
        body: {
          assetId: asset.id,
          userId,
          expectedReturnAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        },
      });
      toast.success('Asset allocated successfully');
      onRefresh();
      onOpenChange(false);
    } catch (e) {
      toast.error(e.message);
    }
    setAllocating(false);
  };

  const handleReturn = async () => {
    const activeAlloc = asset.currentAllocationId;
    if (!activeAlloc) return;
    setLoading(true);
    try {
      await api(`/allocations/${activeAlloc}/return`, { method: 'POST' });
      toast.success('Asset returned successfully');
      onRefresh();
      onOpenChange(false);
    } catch (e) {
      toast.error(e.message);
    }
    setLoading(false);
  };

  const handleScheduleMaintenance = async () => {
    setLoading(true);
    try {
      await api('/maintenance', {
        method: 'POST',
        body: {
          assetId: asset.id,
          type: 'Preventive',
          description: 'Scheduled preventive maintenance',
          cost: 200,
          status: 'Scheduled',
        },
      });
      toast.success('Maintenance scheduled');
      onRefresh();
      onOpenChange(false);
    } catch (e) {
      toast.error(e.message);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center text-4xl">
              {asset.categoryIcon || '📦'}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{asset.name}</DialogTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-mono">{asset.code}</span>
                <span>•</span>
                <span>{asset.brand || 'No brand'}</span>
                <span>•</span>
                <span>{asset.model || 'No model'}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className={STATUS_COLORS[asset.status] || ''}>{asset.status}</Badge>
                {p.risk && (
                  <Badge className={`bg-white/5 ${RISK_COLORS[p.risk]}`}>{p.risk} Risk</Badge>
                )}
                {asset.condition && (
                  <Badge className="bg-white/5 text-muted-foreground">{asset.condition}</Badge>
                )}
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 mt-2">
          <div className="flex flex-col items-center p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-xs text-muted-foreground">Health Score</span>
            <div className="flex items-center gap-2 mt-1">
              <HealthRing health={p.health || 0} size={40} />
              <span className="text-lg font-bold" style={{ color }}>{p.health || 0}/100</span>
            </div>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-xs text-muted-foreground">Failure Probability</span>
            <span className="text-xl font-bold mt-1">{p.failureProbability || 0}%</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-xs text-muted-foreground">Age</span>
            <span className="text-xl font-bold mt-1">{p.ageYears || 0} years</span>
          </div>
        </div>

        {p.explanation && (
          <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold">AI Analysis</span>
            </div>
            <p className="text-sm text-muted-foreground">{p.explanation}</p>
            <div className="mt-2 text-sm">
              <span className="text-purple-300">Recommended:</span> {p.action || 'No action needed'}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="w-4 h-4" /> Purchase Cost
            </div>
            <div className="font-medium mt-1">${asset.purchaseCost?.toLocaleString() || 0}</div>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" /> Purchase Date
            </div>
            <div className="font-medium mt-1">
              {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" /> Location
            </div>
            <div className="font-medium mt-1">{asset.location || 'N/A'}</div>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Barcode className="w-4 h-4" /> Serial Number
            </div>
            <div className="font-medium mt-1 font-mono text-xs">{asset.serialNumber || 'N/A'}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
          {asset.status === 'Available' && (
            <Select onValueChange={handleAllocate}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Allocate to..." />
              </SelectTrigger>
              <SelectContent>
                {/* Users will be loaded here; for now, static list */}
                <SelectItem value="4d6f7a8e-2b1c-4e5f-8a9b-1c2d3e4f5a6b">Sarah Williams</SelectItem>
                <SelectItem value="5e7f8a9b-3c2d-4f6e-9a0b-2d3e4f5a6b7c">David Kim</SelectItem>
                <SelectItem value="6f8a9b0c-4d3e-5f7a-0b1c-3e4f5a6b7c8d">Lisa Rodriguez</SelectItem>
              </SelectContent>
            </Select>
          )}
          {asset.status === 'Allocated' && (
            <Button variant="outline" onClick={handleReturn} disabled={loading}>
              <Clock className="w-4 h-4 mr-2" /> Mark Returned
            </Button>
          )}
          {asset.status !== 'Under Maintenance' && asset.status !== 'Retired' && asset.status !== 'Disposed' && (
            <Button variant="outline" onClick={handleScheduleMaintenance} disabled={loading}>
              <Wrench className="w-4 h-4 mr-2" /> Schedule Maintenance
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}