'use client';
import { Badge } from '@/components/ui/badge';
import { HealthRing } from './HealthRing';

const STATUS_COLORS = {
  Available: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Allocated: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Reserved: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Under Maintenance': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Lost: 'bg-red-500/10 text-red-400 border-red-500/20',
  Retired: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  Disposed: 'bg-gray-500/5 text-gray-500 border-gray-500/10',
};

const RISK_COLORS = {
  Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  High: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Critical: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export function AssetRow({ asset, categories, onClick }) {
  const category = categories?.find(c => c.id === asset.categoryId);

  // Fallback values if fields are missing
  const displayName = asset.name || 'Unnamed Asset';
  const displayCode = asset.code || asset.id?.slice(0, 8) || 'N/A';
  const displayBrand = asset.brand || 'No brand';
  const displayCategory = category?.name || 'Uncategorized';
  const displayIcon = category?.icon || '📦';
  const displayLocation = asset.location || '';
  const displayStatus = asset.status || 'Unknown';
  const displayRisk = asset.prediction?.risk || 'Low';
  const displayHealth = asset.prediction?.health || 0;

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-all group"
    >
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center text-xl flex-shrink-0">
        {displayIcon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{displayName}</span>
          <span className="text-xs text-muted-foreground font-mono">{displayCode}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{displayBrand}</span>
          <span>•</span>
          <span>{displayCategory}</span>
          {displayLocation && (
            <>
              <span>•</span>
              <span>{displayLocation}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <Badge variant="outline" className={`${STATUS_COLORS[displayStatus] || ''} border-0 text-xs`}>
          {displayStatus}
        </Badge>

        <Badge variant="outline" className={`${RISK_COLORS[displayRisk] || ''} border-0 text-xs`}>
          {displayRisk}
        </Badge>

        <HealthRing health={displayHealth} size={36} />
      </div>
    </div>
  );
}