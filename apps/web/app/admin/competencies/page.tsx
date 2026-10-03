'use client';

import React, { useState } from 'react';
import { Target, CheckCircle2, TrendingUp, Plus } from 'lucide-react';

import { api } from '@/lib/api-client';
import { useTranslation } from "react-i18next";

export default function CompetenciesPage() {
    const { t } = useTranslation();
  const [charts, setCharts] = React.useState<any>(null);

  React.useEffect(() => {
    api.get('/analytics/dashboard-charts').then(setCharts).catch(() => null);
  }, []);

  const frameworkData = charts?.competencyData || [];
  const gapResults: any[] = []; // Currently no endpoint for recent gap results

  const metrics = [
    { title: 'ROLE MAPPINGS', value: frameworkData.length > 0 ? frameworkData.length : 'N/A', icon: Target },
    { title: 'RECORDED CHECKS', value: gapResults.length > 0 ? gapResults.length : 'N/A', icon: CheckCircle2 },
    { title: 'ADVANCED TARGETS', value: frameworkData.length > 0 ? `${frameworkData.filter((f: any) => f.requiredLevel > 3).length}` : 'N/A', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground"> {t("competency_management")} </h1>
        <p className="text-sm text-muted-foreground mt-1">
           {t("role_requirements__current_lev")} </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div key={idx} className="surface-card p-5 rounded-xl border border-border flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{metric.title}</h4>
                <div className="text-2xl font-bold text-foreground mt-0.5">{metric.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Required competency framework table */}
      <div className="surface-card rounded-xl border border-border overflow-hidden">
        <div className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border">
          <div>
            <h3 className="text-sm font-semibold text-foreground"> {t("required_competency_framework")} </h3>
            <p className="text-xs text-muted-foreground"> {t("prototype_role_to_competency_m")} </p>
          </div>
          <button className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />  {t("add_competency_category")} </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] uppercase text-muted-foreground bg-accent/50">
              <tr>
                <th className="px-5 py-3 font-semibold"> {t("job_role")} </th>
                <th className="px-5 py-3 font-semibold"> {t("subject")} </th>
                <th className="px-5 py-3 font-semibold"> {t("required_level")} </th>
                <th className="px-5 py-3 font-semibold"> {t("competencies")} </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {frameworkData.length > 0 ? (
                frameworkData.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-accent/30 transition-colors">
                    <td className="px-5 py-4 font-medium text-foreground">{row.jobRole}</td>
                    <td className="px-5 py-4 text-muted-foreground">{row.subject}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-blue-500/10 text-blue-500">
                        {row.requiredLevel}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {row.competencies.map((comp: string, j: number) => (
                          <span key={j} className="px-2 py-0.5 text-[11px] rounded-md bg-accent border border-border text-muted-foreground">
                            {comp}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">
                     {t("n_a__no_competency_frameworks_")} </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent competency gap results table */}
      <div className="surface-card rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground"> {t("recent_competency_gap_results")} </h3>
          <p className="text-xs text-muted-foreground"> {t("latest_trainee_evaluations")} </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] uppercase text-muted-foreground bg-accent/50">
              <tr>
                <th className="px-5 py-3 font-semibold"> {t("trainee")} </th>
                <th className="px-5 py-3 font-semibold"> {t("subject")} </th>
                <th className="px-5 py-3 font-semibold"> {t("current")} </th>
                <th className="px-5 py-3 font-semibold"> {t("required")} </th>
                <th className="px-5 py-3 font-semibold"> {t("score")} </th>
                <th className="px-5 py-3 font-semibold"> {t("missing_competencies")} </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {gapResults.length > 0 ? (
                gapResults.map((row: any, i) => (
                  <tr key={i} className="hover:bg-accent/30 transition-colors">
                    <td className="px-5 py-4 font-medium text-foreground">{row.trainee}</td>
                    <td className="px-5 py-4 text-muted-foreground">{row.subject}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-orange-500/10 text-orange-500">
                        {row.current}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-blue-500/10 text-blue-500">
                        {row.required}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-foreground">{row.score}%</td>
                    <td className="px-5 py-4 text-muted-foreground">{row.missing}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                     {t("n_a__no_evaluations_recorded_y")} </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
