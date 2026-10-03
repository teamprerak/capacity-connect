'use client';

import React from 'react';
import { Database, ShieldAlert, AlertTriangle, Layers } from 'lucide-react';

import { api } from '@/lib/api-client';
import { useTranslation } from "react-i18next";

export default function KnowledgeContinuityPage() {
    const { t } = useTranslation();
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    api.get('/admin/knowledge-vault').then(setData).catch(() => null);
  }, []);

  const vaultAssets = data?.assets || [];
  const isDataAvailable = vaultAssets.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground"> {t("knowledge_continuity_vault")} </h1>
        <p className="text-sm text-muted-foreground mt-1">
           {t("preserve_hard_to_replace_opera")} </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { title: 'CAPTURED ASSETS', value: isDataAvailable ? data.metrics.capturedAssets : 'N/A', icon: Database },
          { title: 'MISSION CRITICAL', value: isDataAvailable ? data.metrics.missionCritical : 'N/A', icon: ShieldAlert },
          { title: 'HIGH SUCCESSION RISK', value: isDataAvailable ? data.metrics.highRisk : 'N/A', icon: AlertTriangle },
          { title: 'COVERED DOMAINS', value: isDataAvailable ? data.metrics.domains : 'N/A', icon: Layers },
        ].map((metric, idx) => (
          <div key={idx} className="surface-card p-5 rounded-xl border border-border flex items-center gap-4">
            <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
              <metric.icon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{metric.title}</h4>
              <div className="text-2xl font-bold text-foreground mt-0.5">{metric.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Retention Engine Hero */}
      <div className="surface-card rounded-xl p-8 shadow-sm border border-border">
        <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 opacity-90 text-primary"> {t("knowledge_retention_engine")} </h3>
        <p className="text-xl sm:text-2xl font-semibold mb-3 leading-tight text-foreground">
           {t("training_content_tells_people_")} </p>
        <p className="text-sm opacity-90 max-w-4xl leading-relaxed text-muted-foreground">
           {t("expert_debriefs__case_archives")} </p>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {isDataAvailable ? (
          vaultAssets.map((asset: any, idx: number) => (
            <div key={idx} className="surface-card p-6 rounded-xl border border-border flex flex-col justify-between hover:border-primary/50 transition-colors cursor-pointer">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    asset.criticality === 'Mission Critical' ? 'text-destructive' : 'text-amber-500'
                  }`}>
                    {asset.criticality}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    asset.risk === 'High' ? 'text-destructive' : asset.risk === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                     {t("succession_risk_")} {asset.risk}
                  </span>
                </div>
                
                <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">{asset.type}: {asset.domain}</h4>
                <h3 className="text-base font-semibold text-foreground mb-2 leading-tight">{asset.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-6">{asset.description}</p>
              </div>
              
              <div className="flex justify-between items-center text-[10px] text-muted-foreground border-t border-border pt-4">
                <span> {t("captured_by")} <strong className="text-foreground">{asset.author}</strong></span>
                <span>{asset.date}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full surface-card p-12 rounded-xl border border-border flex flex-col items-center justify-center text-center">
            <Database className="w-8 h-8 text-muted-foreground/50 mb-3" />
            <h3 className="text-sm font-semibold text-foreground mb-1"> {t("no_assets_captured")} </h3>
            <p className="text-xs text-muted-foreground"> {t("the_knowledge_continuity_vault")} </p>
          </div>
        )}
      </div>
    </div>
  );
}
