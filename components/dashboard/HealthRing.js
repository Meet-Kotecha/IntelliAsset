'use client';

export function HealthRing({ health, size = 44 }) {
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  const offset = c - (health / 100) * c;
  const color = health >= 75 ? '#10b981' : health >= 55 ? '#f59e0b' : health >= 35 ? '#f97316' : '#ef4444';

  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size/2}
          cy={size/2}
          r={r}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="3"
          fill="none"
        />
        <circle
          cx={size/2}
          cy={size/2}
          r={r}
          stroke={color}
          strokeWidth="3"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute text-[10px] font-bold" style={{ color }}>{health}</div>
    </div>
  );
}