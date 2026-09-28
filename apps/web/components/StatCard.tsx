'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'blue' | 'purple' | 'emerald' | 'amber' | 'rose';
  trend?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend,
}: StatCardProps) {
  // All icon containers use one neutral style — color prop kept for API compatibility
  return (
    <div className="surface-card p-5 flex flex-col justify-between hover:shadow-md transition-shadow duration-150">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">{title}</span>
        {/* Neutral icon container — no colored translucency */}
        <div className="p-2 rounded-md bg-accent border border-border text-primary">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div>
        <div className="text-2xl font-semibold tracking-tight text-foreground">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{subtitle}</p>}
        {trend && (
          <span className="badge-success inline-flex mt-2 text-xs font-medium">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
