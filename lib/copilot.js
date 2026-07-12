import { computeAssetHealth } from './predictive.js';

// Rule-based AI Copilot with intent detection
export function copilotAnswer(query, ctx) {
  const q = (query || '').toLowerCase().trim();
  const { assets = [], users = [], allocations = [], maintenance = [], bookings = [], departments = [], categories = [] } = ctx;

  const enriched = assets.map(a => ({ ...a, prediction: computeAssetHealth(a, maintenance) }));
  const findAsset = (text) => {
    return enriched.find(a => text.includes(a.code?.toLowerCase()) || (a.name && text.includes(a.name.toLowerCase()))) ||
           enriched.find(a => a.name && a.name.toLowerCase().split(' ').some(w => w.length > 3 && text.includes(w)));
  };
  const findUser = (text) => users.find(u => u.name && text.includes(u.name.toLowerCase().split(' ')[0]));

  // 1. Idle / Available assets
  if (/\b(idle|unused|not.{0,10}(alloc|assign|used)|available)\b/.test(q)) {
    const idle = enriched.filter(a => a.status === 'Available');
    return {
      answer: `I found **${idle.length} idle asset${idle.length !== 1 ? 's' : ''}** currently available for allocation.`,
      cards: idle.slice(0, 8).map(a => ({ type: 'asset', asset: a })),
      intent: 'idle_assets'
    };
  }

  // 2. Overdue allocations
  if (/\b(overdue|late|past due|not returned)\b/.test(q)) {
    const now = new Date();
    const overdue = allocations.filter(al => al.status === 'Active' && al.expectedReturnAt && new Date(al.expectedReturnAt) < now);
    const items = overdue.map(al => {
      const asset = enriched.find(a => a.id === al.assetId);
      const user = users.find(u => u.id === al.userId);
      const days = Math.floor((now - new Date(al.expectedReturnAt)) / 86400000);
      return { type: 'overdue', asset, user, days, allocation: al };
    });
    return {
      answer: `Detected **${overdue.length} overdue return${overdue.length !== 1 ? 's' : ''}**. These assets are past their expected return date.`,
      cards: items.slice(0, 10),
      intent: 'overdue'
    };
  }

  // 3. High risk assets
  if (/\b(high risk|risky|critical|at risk|risk)\b/.test(q) && !q.includes('why')) {
    const risky = enriched.filter(a => ['High', 'Critical'].includes(a.prediction.risk))
      .sort((a, b) => a.prediction.health - b.prediction.health);
    return {
      answer: `Identified **${risky.length} high-risk asset${risky.length !== 1 ? 's' : ''}** requiring attention. Ranked by predicted failure probability.`,
      cards: risky.slice(0, 8).map(a => ({ type: 'asset', asset: a })),
      intent: 'high_risk'
    };
  }

  // 4. Why is X high risk? — explain
  if (/why.{0,20}(risk|fail|critical|bad)/.test(q) || /explain.{0,20}(risk|why)/.test(q)) {
    const asset = findAsset(q);
    if (asset) {
      const p = asset.prediction;
      return {
        answer: `**${asset.name}** (${asset.code}) has a **${p.risk} risk** rating with health score ${p.health}/100 and ${p.failureProbability}% failure probability.\n\n${p.explanation}\n\n**Recommended action:** ${p.action}`,
        cards: [{ type: 'asset', asset }],
        intent: 'explain_risk'
      };
    }
  }

  // 5. Maintenance history for asset
  if (/(maintenance|repair|service).{0,20}history/.test(q) || /history.{0,20}(maintenance|repair|service)/.test(q)) {
    const asset = findAsset(q);
    if (asset) {
      const records = maintenance.filter(m => m.assetId === asset.id)
        .sort((a, b) => new Date(b.performedAt) - new Date(a.performedAt));
      return {
        answer: `**${asset.name}** has **${records.length} maintenance record${records.length !== 1 ? 's' : ''}**.`,
        cards: [{ type: 'asset', asset }, ...records.map(r => ({ type: 'maintenance', record: r }))],
        intent: 'maintenance_history'
      };
    }
  }

  // 6. Who owns / has asset
  if (/(who|owner|owns|has|assigned|current|holder|allocated to)/.test(q)) {
    const asset = findAsset(q);
    if (asset) {
      const active = allocations.find(al => al.assetId === asset.id && al.status === 'Active');
      if (active) {
        const user = users.find(u => u.id === active.userId);
        const dept = departments.find(d => d.id === user?.departmentId);
        return {
          answer: `**${asset.name}** (${asset.code}) is currently allocated to **${user?.name || 'Unknown'}** in ${dept?.name || 'N/A'} department since ${new Date(active.allocatedAt).toDateString()}.`,
          cards: [{ type: 'asset', asset }],
          intent: 'ownership'
        };
      }
      return {
        answer: `**${asset.name}** is currently **${asset.status}** and not allocated to anyone.`,
        cards: [{ type: 'asset', asset }],
        intent: 'ownership'
      };
    }
  }

  // 7. History of asset
  if (/history/.test(q)) {
    const asset = findAsset(q);
    if (asset) {
      const allocs = allocations.filter(al => al.assetId === asset.id);
      const mnts = maintenance.filter(m => m.assetId === asset.id);
      return {
        answer: `**${asset.name}** history: ${allocs.length} allocation event${allocs.length !== 1 ? 's' : ''}, ${mnts.length} maintenance record${mnts.length !== 1 ? 's' : ''}. Registered on ${new Date(asset.purchaseDate).toDateString()}. Current status: **${asset.status}**.`,
        cards: [{ type: 'asset', asset }],
        intent: 'history'
      };
    }
  }

  // 8. Recommended next actions
  if (/(recommend|next action|what should|suggestion|action)/.test(q)) {
    const critical = enriched.filter(a => a.prediction.risk === 'Critical').slice(0, 3);
    const overdue = allocations.filter(al => al.status === 'Active' && al.expectedReturnAt && new Date(al.expectedReturnAt) < new Date()).slice(0, 3);
    const idle = enriched.filter(a => a.status === 'Available').length;
    const actions = [];
    critical.forEach(a => actions.push(`🚨 Inspect **${a.name}** (${a.code}) — Critical risk, ${a.prediction.failureProbability}% failure probability`));
    overdue.forEach(al => {
      const asset = enriched.find(a => a.id === al.assetId);
      const user = users.find(u => u.id === al.userId);
      actions.push(`⏰ Follow up with **${user?.name}** on overdue **${asset?.name}**`);
    });
    if (idle > 5) actions.push(`💡 ${idle} idle assets available for reallocation`);
    if (actions.length === 0) actions.push('✅ All assets healthy. No urgent actions needed.');
    return {
      answer: `**Top recommended actions:**\n\n${actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}`,
      cards: [],
      intent: 'recommendations'
    };
  }

  // 9. Count/summary
  if (/(how many|count|total|summary)/.test(q)) {
    const byStatus = enriched.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {});
    return {
      answer: `**Fleet summary:** ${enriched.length} total assets. ${Object.entries(byStatus).map(([k, v]) => `${v} ${k}`).join(', ')}. Fleet health: ${Math.round(enriched.reduce((s, a) => s + a.prediction.health, 0) / (enriched.length || 1))}/100.`,
      cards: [],
      intent: 'summary'
    };
  }

  // 10. Department query
  if (/department|team/.test(q)) {
    const dept = departments.find(d => q.includes(d.name.toLowerCase()));
    if (dept) {
      const deptUsers = users.filter(u => u.departmentId === dept.id);
      const deptAssets = enriched.filter(a => allocations.find(al => al.status === 'Active' && al.assetId === a.id && deptUsers.find(u => u.id === al.userId)));
      return {
        answer: `**${dept.name}** department: ${deptUsers.length} members, ${deptAssets.length} allocated assets.`,
        cards: deptAssets.slice(0, 6).map(a => ({ type: 'asset', asset: a })),
        intent: 'department'
      };
    }
  }

  // Fallback: try to find an asset mentioned
  const asset = findAsset(q);
  if (asset) {
    const p = asset.prediction;
    return {
      answer: `**${asset.name}** (${asset.code}) — Status: ${asset.status}, Health: ${p.health}/100, Risk: ${p.risk}. ${p.explanation}`,
      cards: [{ type: 'asset', asset }],
      intent: 'asset_lookup'
    };
  }

  return {
    answer: `I can help you with:\n• Finding idle assets\n• Identifying overdue returns\n• Explaining why an asset is high risk\n• Showing asset ownership & history\n• Recommending next actions\n• Maintenance history\n\nTry: *"Show high risk assets"* or *"What are the overdue returns?"*`,
    cards: [],
    intent: 'help'
  };
}
