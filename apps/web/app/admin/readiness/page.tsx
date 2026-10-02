'use client';

import React from 'react';
import { Target, AlertTriangle, ShieldCheck, TrendingUp, CheckCircle2 } from 'lucide-react';

import { api } from '@/lib/api-client';

export default function ReadinessCommandPage() {
  const [personnelReadiness, setPersonnel] = React.useState<any[]>([]);
  const [departmentHeatmap, setHeatmap] = React.useState<any[]>([]);

  React.useEffect(() => {
    Promise.all([
      api.get('/analytics/readiness/personnel').catch(() => []),
      api.get('/analytics/readiness/departments').catch(() => [])
    ]).then(([p, d]) => {
      setPersonnel(p);
      setHeatmap(d);
    });
  }, []);

  const isDataAvailable = personnelReadiness.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Operational Readiness Command Center</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Convert training records into a decision-ready view of who is actually prepared for operational responsibilities.
        </p>
      </div>

      {/* Hero KPI Banner */}
      <div className="surface-card rounded-xl p-8 shadow-sm border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="max-w-3xl">
          <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2 text-primary">Key Performance Indicator</h3>
          <h2 className="text-2xl sm:text-3xl font-semibold mb-3 text-foreground">Operational Readiness Index (ORI)</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Readiness combines competency assessment, learning completion, post-test performance, trainer-verified evidence and scenario performance. No single course completion metric can mark a learner ready.
          </p>
        </div>
        <div className="bg-accent/50 border border-border rounded-xl p-6 text-center min-w-[200px] shrink-0">
          <div className="text-4xl sm:text-5xl font-bold mb-1 text-foreground">{isDataAvailable ? '13' : 'N/A'}</div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Organizational ORI</div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { title: 'OPERATIONALLY READY', val: isDataAvailable ? '10%' : 'N/A', sub: 'ORI > 70', icon: Target },
          { title: 'HIGH-RISK LEARNERS', val: isDataAvailable ? '9' : 'N/A', sub: 'ORI below 40', icon: AlertTriangle },
          { title: 'EVIDENCE VERIFICATION', val: isDataAvailable ? '75%' : 'N/A', sub: '3 submissions verified', icon: ShieldCheck },
          { title: 'AVG. LEARNING GAIN', val: isDataAvailable ? '+50 pts' : 'N/A', sub: 'Pre-test → post-test', icon: TrendingUp },
        ].map((kpi, idx) => (
          <div key={idx} className="surface-card p-5 rounded-xl border border-border flex items-center gap-4">
            <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
              <kpi.icon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{kpi.title}</h4>
              <div className="text-2xl font-bold text-foreground mt-0.5">{kpi.val}</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Personnel readiness radar */}
      <div className="surface-card rounded-xl border border-border overflow-hidden">
        <div className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Personnel readiness radar</h3>
            <p className="text-xs text-muted-foreground">Prioritized by operational readiness, not course attendance.</p>
          </div>
          <button className="text-xs font-semibold text-primary hover:underline">Use Prototype Index</button>
        </div>

        <div className="overflow-x-auto">
          {isDataAvailable ? (
            <table className="w-full text-sm text-left">
              <tbody className="divide-y divide-border">
                {personnelReadiness.map((person, idx) => (
                  <tr key={idx} className="hover:bg-accent/30 transition-colors">
                    <td className="px-5 py-4 w-1/3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {person.initials}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{person.name}</p>
                          <p className="text-[10px] text-muted-foreground">{person.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 w-1/3">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-semibold text-foreground">{person.status}</span>
                        <div className="w-full h-1.5 bg-accent rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${person.score >= 70 ? 'bg-emerald-500' : person.score > 0 ? 'bg-amber-500' : 'bg-slate-300'}`} 
                            style={{ width: `${Math.max(person.score, 2)}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 w-1/3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-mono text-xs font-semibold mr-2">{person.score}/100</span>
                        {['C', 'L', 'A', 'E', 'S'].map((letter, i) => (
                          <div key={i} className={`flex items-center justify-center px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            person.score > 0 ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-accent text-muted-foreground border border-border'
                          }`}>
                            {letter}: {person.score > 0 ? '10' : '0'}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center flex flex-col items-center">
              <Target className="w-8 h-8 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-semibold text-foreground">No personnel data</p>
              <p className="text-xs text-muted-foreground">N/A</p>
            </div>
          )}
        </div>
      </div>

      {/* Department Heatmap */}
      <div className="surface-card rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Department × competency heatmap</h3>
          <p className="text-xs text-muted-foreground">Average assessed competency score. (If sub-metrics missing, it is not yet available - actionable data gap)</p>
        </div>
        <div className="overflow-x-auto">
          {isDataAvailable ? (
            <table className="w-full text-[11px] text-center whitespace-nowrap">
              <thead className="text-[10px] uppercase text-muted-foreground bg-accent/50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">DEPARTMENT</th>
                  <th className="px-4 py-3 font-semibold">NUMERICAL WEATHER PREDICTION</th>
                  <th className="px-4 py-3 font-semibold">SATELLITE METEOROLOGY</th>
                  <th className="px-4 py-3 font-semibold">OCEAN FORECASTING</th>
                  <th className="px-4 py-3 font-semibold">HYDROMETEOROLOGY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {departmentHeatmap.map((row, idx) => (
                  <tr key={idx} className="hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-foreground text-left">{row.dept}</td>
                    {[row.nwp, row.satellite, row.ocean, row.hydro].map((val, i) => (
                      <td key={i} className="px-4 py-3">
                        {val === 'No data' ? (
                          <span className="text-muted-foreground/60 bg-accent px-2 py-0.5 rounded">No data</span>
                        ) : (
                          <span className="text-destructive bg-destructive/10 px-2 py-0.5 rounded font-bold">{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
             <div className="py-12 text-center">
              <p className="text-sm font-semibold text-foreground">No heatmap data</p>
              <p className="text-xs text-muted-foreground">N/A</p>
            </div>
          )}
        </div>
      </div>

      {/* Governance Rules */}
      <div className="surface-card rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Readiness governance rules</h3>
          <p className="text-xs text-muted-foreground">Transparent conditions form secure escalations and verification available.</p>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-accent/30">
          {[
            { t: 'Knowledge', d: 'Pre/post competency assessment establishes the baseline.' },
            { t: 'Learning', d: 'Assigned modules must be completed and marked.' },
            { t: 'Evidence', d: 'An operational artifact must be reviewed by a verified trainer.' },
            { t: 'Scenario', d: 'Decision-making is tested in a job-relevant situation.' },
          ].map((rule, idx) => (
            <div key={idx} className="bg-background border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-semibold text-foreground">{rule.t}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{rule.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
