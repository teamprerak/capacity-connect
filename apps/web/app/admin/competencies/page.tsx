'use client';

import React, { useState } from 'react';
import { Target, CheckCircle2, TrendingUp, Plus } from 'lucide-react';

// Replace with actual database fetching when API is ready
const fetchFrameworkData = () => [];
const fetchGapResults = () => [];

export default function CompetenciesPage() {
  const frameworkData = fetchFrameworkData();
  const gapResults = fetchGapResults();

  const metrics = [
    { title: 'ROLE MAPPINGS', value: frameworkData.length > 0 ? frameworkData.length : 'N/A', icon: Target },
    { title: 'RECORDED CHECKS', value: gapResults.length > 0 ? gapResults.length : 'N/A', icon: CheckCircle2 },
    { title: 'ADVANCED TARGETS', value: frameworkData.length > 0 ? '4' : 'N/A', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Competency Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Role requirements, current levels and organization-wide development gaps.
        </p>
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
            <h3 className="text-sm font-semibold text-foreground">Required competency framework</h3>
            <p className="text-xs text-muted-foreground">Prototype role to competency matrix</p>
          </div>
          <button className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add competency category
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] uppercase text-muted-foreground bg-accent/50">
              <tr>
                <th className="px-5 py-3 font-semibold">JOB ROLE</th>
                <th className="px-5 py-3 font-semibold">SUBJECT</th>
                <th className="px-5 py-3 font-semibold">REQUIRED LEVEL</th>
                <th className="px-5 py-3 font-semibold">COMPETENCIES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {frameworkData.length > 0 ? (
                frameworkData.map((row: any, i) => (
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
                    N/A (No competency frameworks defined)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent competency gap results table */}
      <div className="surface-card rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Recent competency gap results</h3>
          <p className="text-xs text-muted-foreground">Latest trainee evaluations</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] uppercase text-muted-foreground bg-accent/50">
              <tr>
                <th className="px-5 py-3 font-semibold">TRAINEE</th>
                <th className="px-5 py-3 font-semibold">SUBJECT</th>
                <th className="px-5 py-3 font-semibold">CURRENT</th>
                <th className="px-5 py-3 font-semibold">REQUIRED</th>
                <th className="px-5 py-3 font-semibold">SCORE</th>
                <th className="px-5 py-3 font-semibold">MISSING COMPETENCIES</th>
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
                    N/A (No evaluations recorded yet)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
