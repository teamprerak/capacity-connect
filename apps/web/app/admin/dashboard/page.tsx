'use client';

import React from 'react';
import {
  Users,
  GraduationCap,
  Clock,
  BookOpen,
  CheckCircle,
  FileText,
  Award,
  Activity,
  ShieldCheck,
  Database,
  CloudLightning,
  Radar,
  Satellite,
  CloudRain,
  AlertTriangle,
} from 'lucide-react';
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

import { api } from '@/lib/api-client';
import { useTranslation } from "react-i18next";

const CustomTooltip = ({ active, payload, label }: any) => {
    const { t } = useTranslation();
  if (active && payload && payload.length) {
    return (
      <div className="surface-card text-foreground p-3 shadow-md z-50">
        <p className="text-sm font-semibold mb-1">{label}</p>
        <p className="text-sm" style={{ color: payload[0].color || 'hsl(var(--primary))' }}>
           {t("value_")} {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboardPage() {
    const { t } = useTranslation();
  const [metrics, setMetrics] = React.useState<any>(null);
  const [charts, setCharts] = React.useState<any>(null);
  const [pending, setPending] = React.useState<any>(null);
  const [logs, setLogs] = React.useState<any[]>([]);

  React.useEffect(() => {
    Promise.all([
      api.get('/analytics/admin-dashboard').catch(() => null),
      api.get('/analytics/dashboard-charts').catch(() => null),
      api.get('/analytics/pending-actions').catch(() => null),
      api.get('/admin/audit-logs').catch(() => ({ data: [] }))
    ]).then(([m, c, p, l]) => {
      setMetrics(m);
      setCharts(c);
      setPending(p);
      setLogs(l?.data || []);
    });
  }, []);

  const isDataAvailable = !!metrics;

  const competencyData = charts?.competencyData || [];
  const participationData = charts?.participationData || [];
  const recentActivityData = logs.slice(0, 4).map(l => ({
    title: `${l.actor?.email || 'System'} performed ${l.action}`,
    time: new Date(l.createdAt).toLocaleString()
  }));
  const pendingActionsData = pending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground"> {t("admin_dashboard")} </h1>
          <p className="text-sm text-muted-foreground mt-1">
             {t("organization_wide_training__co")} </p>
        </div>
      </div>      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'TOTAL TRAINEES', val: isDataAvailable ? metrics.users.trainees : 'N/A', sub: 'Approved profiles', icon: Users },
          { title: 'TOTAL TRAINERS', val: isDataAvailable ? metrics.users.trainers : 'N/A', sub: 'Certified', icon: GraduationCap },
          { title: 'PENDING APPROVALS', val: isDataAvailable ? pendingActionsData?.pendingTrainers || 0 : 'N/A', sub: 'Requires review', icon: Clock },
          { title: 'ACTIVE COURSES', val: isDataAvailable ? metrics.courses.published : 'N/A', sub: 'Published', icon: BookOpen },
          { title: 'ENROLLMENTS', val: isDataAvailable ? metrics.enrollments.total : 'N/A', sub: 'Active', icon: CheckCircle },
          { title: 'ASSESSMENTS', val: isDataAvailable ? metrics.courses.total : 'N/A', sub: 'Live', icon: FileText },
          { title: 'CERTIFICATES', val: isDataAvailable ? metrics.certificates : 'N/A', sub: 'Issued', icon: Award },
          { title: 'COMPLETION RATE', val: isDataAvailable ? `${Math.round(metrics.enrollments.completionRate)}%` : 'N/A', sub: 'Org average', icon: Activity },
        ].map((kpi, idx) => (
          <div key={idx} className="surface-card p-5 rounded-xl border border-border flex items-start gap-4">
            <div className="p-2.5 bg-primary/10 rounded-lg text-primary mt-1">
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

      {/* Secondary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: 'OPERATIONAL READINESS', val: isDataAvailable ? (metrics.operationalReadiness ?? 'N/A') : 'N/A', sub: 'Based on ORI calculation', icon: ShieldCheck },
          { title: 'VERIFIED EVIDENCE', val: isDataAvailable ? (metrics.verifiedEvidence ?? 'N/A') : 'N/A', sub: 'Scenarios verified', icon: CheckCircle },
          { title: 'KNOWLEDGE ASSETS', val: isDataAvailable ? (metrics.knowledgeAssets ?? 'N/A') : 'N/A', sub: 'Institutional memory', icon: Database },
        ].map((kpi, idx) => (
          <div key={idx} className="surface-card p-5 rounded-xl border border-border flex items-start gap-4">
            <div className="p-2.5 bg-primary/10 rounded-lg text-primary mt-1">
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="surface-card p-5 rounded-xl border border-border flex flex-col">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h3 className="text-sm font-semibold text-foreground"> {t("competency_improvement")} </h3>
              <p className="text-xs text-muted-foreground"> {t("average_verified_score_trend")} </p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-md"> {t("_50_pts")} </span>
          </div>
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {competencyData.length > 0 ? (
                <LineChart data={competencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'currentColor' }} className="text-muted-foreground" dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'currentColor' }} className="text-muted-foreground" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Line type="linear" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--background))', stroke: '#3b82f6', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#3b82f6', stroke: 'hsl(var(--background))', strokeWidth: 2 }} />
                </LineChart>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground text-sm"> {t("n_a__no_data_")} </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-5 rounded-xl border border-border flex flex-col">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground"> {t("department_participation")} </h3>
            <p className="text-xs text-muted-foreground"> {t("active_learners_by_training_ar")} </p>
          </div>
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {participationData.length > 0 ? (
                <BarChart data={participationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'currentColor' }} className="text-muted-foreground" dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'currentColor' }} className="text-muted-foreground" />
                  <RechartsTooltip cursor={false} content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground text-sm"> {t("n_a__no_data_")} </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="surface-card p-5 rounded-xl border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-1"> {t("recent_activity")} </h3>
          <p className="text-xs text-muted-foreground mb-6"> {t("latest_workflow_events")} </p>
          <div className="space-y-4">
            {recentActivityData.length > 0 ? recentActivityData.map((event, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{event.title}</p>
                  <p className="text-[10px] text-muted-foreground">{event.time}</p>
                </div>
              </div>
            )) : (
              <div className="text-sm text-muted-foreground"> {t("n_a__no_recent_activity_")} </div>
            )}
          </div>
        </div>

        <div className="surface-card p-5 rounded-xl border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-1"> {t("pending_actions")} </h3>
          <p className="text-xs text-muted-foreground mb-6"> {t("basic_reporting_governance_rev")} </p>
          
          {pendingActionsData ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm font-medium text-foreground"> {t("user_registrations")} </span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-500">{pendingActionsData?.pendingUsers ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm font-medium text-foreground"> {t("course_proposals")} </span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-500">{pendingActionsData?.pendingCourses ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm font-medium text-foreground"> {t("enrollment_requests")} </span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-500"> {t("n_a")} </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm font-medium text-foreground"> {t("unverified_trainers")} </span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-accent text-muted-foreground">{pendingActionsData?.pendingTrainers ?? 'N/A'}</span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground"> {t("n_a__no_pending_actions_")} </div>
          )}
        </div>
      </div>
    </div>
  );
}
