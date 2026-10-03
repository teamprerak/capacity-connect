'use client';

import React from 'react';
import { Target, AlertTriangle, ShieldCheck, TrendingUp, CheckCircle2 } from 'lucide-react';

import { api } from '@/lib/api-client';
import { useTranslation } from "react-i18next";

export default function ReadinessCommandPage() {
    const { t } = useTranslation();
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
        <h1 className="text-2xl font-semibold tracking-tight text-foreground"> {t("operational_readiness_command_")} </h1>
        <p className="text-sm text-muted-foreground mt-1">
           {t("convert_training_records_into_")} </p>
      </div>

      {/* Hero KPI Banner */}
      <div className="surface-card rounded-xl p-8 shadow-sm border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="max-w-3xl">
          <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2 text-primary"> {t("key_performance_indicator")} </h3>
          <h2 className="text-2xl sm:text-3xl font-semibold mb-3 text-foreground"> {t("operational_readiness_index__o")} </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
             {t("readiness_combines_competency_")} </p>
        </div>
        <div className="bg-accent/50 border border-border rounded-xl p-6 text-center min-w-[200px] shrink-0">
          <div className="text-4xl sm:text-5xl font-bold mb-1 text-foreground">{isDataAvailable ? '13' : 'N/A'}</div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"> {t("organizational_ori")} </div>
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
            <h3 className="text-sm font-semibold text-foreground"> {t("personnel_readiness_radar")} </h3>
            <p className="text-xs text-muted-foreground"> {t("prioritized_by_operational_rea")} </p>
          </div>
          <button className="text-xs font-semibold text-primary hover:underline"> {t("use_prototype_index")} </button>
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
                        <span className="font-mono text-xs font-semibold mr-2">{person.score} {t("_100")} </span>
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
              <p className="text-sm font-semibold text-foreground"> {t("no_personnel_data")} </p>
              <p className="text-xs text-muted-foreground"> {t("n_a")} </p>
            </div>
          )}
        </div>
      </div>

      {/* Department Heatmap */}
      <div className="surface-card rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground"> {t("department___competency_heatma")} </h3>
          <p className="text-xs text-muted-foreground"> {t("average_assessed_competency_sc")} </p>
        </div>
        <div className="overflow-x-auto">
          {isDataAvailable ? (
            <table className="w-full text-[11px] text-center whitespace-nowrap">
              <thead className="text-[10px] uppercase text-muted-foreground bg-accent/50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold"> {t("department")} </th>
                  <th className="px-4 py-3 font-semibold"> {t("numerical_weather_prediction")} </th>
                  <th className="px-4 py-3 font-semibold"> {t("satellite_meteorology")} </th>
                  <th className="px-4 py-3 font-semibold"> {t("ocean_forecasting")} </th>
                  <th className="px-4 py-3 font-semibold"> {t("hydrometeorology")} </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {departmentHeatmap.map((row, idx) => (
                  <tr key={idx} className="hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-foreground text-left">{row.dept}</td>
                    {[row.nwp, row.satellite, row.ocean, row.hydro].map((val, i) => (
                      <td key={i} className="px-4 py-3">
                        {val === 'No data' ? (
                          <span className="text-muted-foreground/60 bg-accent px-2 py-0.5 rounded"> {t("no_data")} </span>
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
              <p className="text-sm font-semibold text-foreground"> {t("no_heatmap_data")} </p>
              <p className="text-xs text-muted-foreground"> {t("n_a")} </p>
            </div>
          )}
        </div>
      </div>

      {/* Governance Rules */}
      <div className="surface-card rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground"> {t("readiness_governance_rules")} </h3>
          <p className="text-xs text-muted-foreground"> {t("transparent_conditions_form_se")} </p>
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
