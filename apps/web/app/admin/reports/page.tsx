'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Printer, Download } from 'lucide-react';

// Real mechanism not yet implemented on backend, showing N/A fallback as requested.
const participationData: any[] = [];

const competencyData: any[] = [];

// Fallback logic applied to KPI data
const kpiData = [
  { title: 'COURSE COMPLETION', value: participationData.length ? '78%' : 'N/A', subtext: 'Across active prototype enrollments' },
  { title: 'PRE - POST IMPROVEMENT', value: participationData.length ? '+50 pts' : 'N/A', subtext: 'Average verified learning uplift' },
  { title: 'TRAINER EFFECTIVENESS', value: participationData.length ? '4.7 / 5' : 'N/A', subtext: 'Average verified trainer rating' },
  { title: 'OPERATIONAL READINESS', value: participationData.length ? '10%' : 'N/A', subtext: 'Personnel at ORI 70 or above' },
  { title: 'EVIDENCE VERIFICATION', value: participationData.length ? '75%' : 'N/A', subtext: 'Operational evidence received' },
  { title: 'KNOWLEDGE CONTINUITY', value: participationData.length ? '4' : 'N/A', subtext: 'Expert assets preserved' },
  { title: 'CERTIFICATES ISSUED', value: participationData.length ? '2' : 'N/A', subtext: 'Verification-backed certificates' },
  { title: 'TRAINING PARTICIPATION', value: participationData.length ? '82%' : 'N/A', subtext: 'Sample reporting indicator' },
];

const assessmentData: any[] = [];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card text-card-foreground border border-border p-3 rounded-lg shadow-md z-50">
        <p className="text-sm font-semibold mb-1">{label}</p>
        <p className="text-sm" style={{ color: payload[0].color || 'hsl(var(--primary))' }}>
          Value: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export default function ReportsAnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Participation, completion, assessment improvement and competency trends.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary px-4 py-2 text-sm flex items-center gap-2">
            <Printer className="w-4 h-4" /> Print / PDF
          </button>
          <button className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Top Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Participation Bar Chart */}
        <div className="surface-card p-5 rounded-xl border border-border flex flex-col">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground">Training participation</h3>
            <p className="text-xs text-muted-foreground">Department distribution</p>
          </div>
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {participationData.length > 0 ? (
                <BarChart data={participationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'currentColor' }} 
                    className="text-muted-foreground"
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                    className="text-muted-foreground"
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                  />
                  <RechartsTooltip cursor={{ fill: 'hsl(var(--accent))' }} content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground text-sm">N/A</div>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Competency Line Chart */}
        <div className="surface-card p-5 rounded-xl border border-border flex flex-col">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground">Competency improvement</h3>
            <p className="text-xs text-muted-foreground">Verified learning trend</p>
          </div>
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {competencyData.length > 0 ? (
                <LineChart data={competencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                    className="text-muted-foreground"
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                    className="text-muted-foreground"
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Line 
                    type="linear" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: 'hsl(var(--background))', stroke: '#3b82f6', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#3b82f6', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                  />
                </LineChart>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground text-sm">N/A</div>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <div key={index} className="surface-card p-5 rounded-xl border border-border flex flex-col justify-between">
            <h4 className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{kpi.title}</h4>
            <div className="mt-1">
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">{kpi.value}</div>
              <p className="text-[11px] sm:text-xs text-muted-foreground">{kpi.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Assessment Comparison */}
      <div className="surface-card p-5 rounded-xl border border-border">
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground">Assessment comparison</h3>
          <p className="text-xs text-muted-foreground">Pre-test versus post-test results</p>
        </div>

        <div className="space-y-5">
          {assessmentData.length > 0 ? assessmentData.map((item, idx) => (
            <div key={idx} className="flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">{item.name}</span>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    <span className="text-muted-foreground">Pre-test {item.preTest}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-emerald-500">Post-test {item.postTest}%</span>
                  </div>
                </div>
              </div>
              
              {/* Dual Progress Bar */}
              <div className="relative w-full h-2.5 bg-accent rounded-full overflow-hidden">
                {/* Post test bar (background fill) */}
                <div 
                  className="absolute top-0 left-0 h-full bg-emerald-500/20" 
                  style={{ width: `${item.postTest}%` }} 
                />
                {/* Pre test bar (darker fill) */}
                <div 
                  className="absolute top-0 left-0 h-full bg-slate-400" 
                  style={{ width: `${item.preTest}%`, zIndex: 10 }} 
                />
                {/* Post test extension (solid green) */}
                {item.postTest > item.preTest && (
                  <div 
                    className="absolute top-0 h-full bg-emerald-500" 
                    style={{ left: `${item.preTest}%`, width: `${item.postTest - item.preTest}%`, zIndex: 10 }} 
                  />
                )}
              </div>
            </div>
          )) : (
            <div className="text-sm text-muted-foreground">N/A</div>
          )}
        </div>
      </div>
    </div>
  );
}
