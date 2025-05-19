"use client";

import { StatCard } from './StatCard'; // Assuming StatCard.tsx is in the same directory

interface StatData {
  id: string;
  label: string;
  value: string;
  subtext?: string;
  icon?: React.ReactNode;
}

interface OverviewStatsProps {
  stats: StatData[];
}

export function OverviewStats({ stats }: OverviewStatsProps) {
  if (!stats || stats.length === 0) {
    return null; // Or some placeholder if no stats
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <StatCard
          key={stat.id}
          label={stat.label}
          value={stat.value}
          subtext={stat.subtext}
          icon={stat.icon} // Pass icon if you add it to StatData
        />
      ))}
    </div>
  );
}