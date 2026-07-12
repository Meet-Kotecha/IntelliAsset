// Rule-based predictive maintenance engine
export function computeAssetHealth(asset, maintenanceRecords = []) {
  const now = Date.now();
  const purchase = asset.purchaseDate ? new Date(asset.purchaseDate).getTime() : now;
  const ageYears = Math.max(0, (now - purchase) / (365 * 86400000));

  const repairs = maintenanceRecords.filter(m => m.assetId === asset.id).length;
  const completed = maintenanceRecords
    .filter(m => m.assetId === asset.id && m.status === 'Completed')
    .sort((a, b) => new Date(b.performedAt) - new Date(a.performedAt));
  const lastServiceAt = completed[0]?.performedAt || asset.purchaseDate;
  const daysSinceService = lastServiceAt
    ? Math.max(0, (now - new Date(lastServiceAt).getTime()) / 86400000)
    : 999;

  let health = 100;
  const ageImpact = Math.min(ageYears * 4, 40);
  const repairImpact = Math.min(repairs * 5, 30);
  const serviceImpact = Math.min(daysSinceService / 30, 20);
  const condMap = { Excellent: 0, Good: 5, Fair: 15, Poor: 30 };
  const condImpact = condMap[asset.condition] ?? 10;

  health -= ageImpact + repairImpact + serviceImpact + condImpact;
  health = Math.max(0, Math.min(100, Math.round(health)));

  let risk = 'Low';
  if (health < 35) risk = 'Critical';
  else if (health < 55) risk = 'High';
  else if (health < 75) risk = 'Medium';

  const failureProbability = Math.min(95, Math.max(3, 100 - health + repairs * 2));

  const factors = [];
  if (ageYears >= 3) factors.push(`Age: ${ageYears.toFixed(1)} years old`);
  if (repairs >= 2) factors.push(`Repair history: ${repairs} records`);
  if (daysSinceService > 180) factors.push(`Last serviced ${Math.round(daysSinceService)} days ago`);
  if (['Fair', 'Poor'].includes(asset.condition)) factors.push(`Condition: ${asset.condition}`);

  const explanation = factors.length
    ? `Risk factors — ${factors.join(' • ')}.`
    : 'Asset is in strong operational condition with minimal risk indicators.';

  let action = 'Continue normal operations';
  if (risk === 'Critical') action = 'Immediate inspection required — remove from active use';
  else if (risk === 'High') action = 'Schedule preventive maintenance within 14 days';
  else if (risk === 'Medium') action = 'Schedule routine inspection within 60 days';

  return { health, risk, failureProbability, explanation, action, ageYears: +ageYears.toFixed(1), repairs, daysSinceService: Math.round(daysSinceService) };
}

export function enrichAssets(assets, maintenance) {
  return assets.map(a => ({ ...a, prediction: computeAssetHealth(a, maintenance) }));
}
