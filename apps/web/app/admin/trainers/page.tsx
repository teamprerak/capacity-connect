'use client';

import React from 'react';
import { Search } from 'lucide-react';

import { api } from '@/lib/api-client';
import { useTranslation } from "react-i18next";

export default function TrainerManagementPage() {
    const { t } = useTranslation();
  const [trainersData, setTrainers] = React.useState<any[]>([]);

  React.useEffect(() => {
    api.get('/admin/trainers/all').then(setTrainers).catch(() => []);
  }, []);

  const isDataAvailable = trainersData.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground"> {t("trainer_management")} </h1>
        <p className="text-sm text-muted-foreground mt-1">
           {t("verify_expertise__review_perfo")} </p>
      </div>

      {/* Filter / Search */}
      <div className="max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder={t("search_trainer_or_subject")} 
          className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Trainers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isDataAvailable ? (
          trainersData.map((trainer, idx) => (
            <div key={idx} className="surface-card p-5 rounded-xl border border-border flex flex-col justify-between">
              <div>
                {/* Profile Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                      {trainer.initials}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{trainer.name}</h3>
                      <p className="text-xs text-foreground font-medium">{trainer.title}</p>
                      <p className="text-[10px] text-muted-foreground">{trainer.department}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded">
                     {t("admin_verified")} </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 border-y border-border py-3 mb-4">
                  <div>
                    <div className="text-sm font-bold text-foreground">{trainer.rating}</div>
                    <div className="text-[10px] text-muted-foreground"> {t("rating")} </div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{trainer.years}</div>
                    <div className="text-[10px] text-muted-foreground"> {t("years")} </div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{trainer.level}</div>
                    <div className="text-[10px] text-muted-foreground"> {t("level")} </div>
                  </div>
                </div>

                {/* Description & Badges */}
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  {trainer.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {trainer.tags.map((tag: string, tIdx: number) => (
                    <span key={tIdx} className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-accent text-muted-foreground border border-border">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-auto">
                <button className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg text-foreground hover:bg-accent transition-colors">
                   {t("review_profile")} </button>
                <button className="px-3 py-1.5 text-xs font-semibold border border-destructive/30 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
                   {t("remove_verification")} </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full surface-card p-12 rounded-xl border border-border flex flex-col items-center justify-center text-center">
            <h3 className="text-sm font-semibold text-foreground mb-1"> {t("no_trainers_available")} </h3>
            <p className="text-xs text-muted-foreground"> {t("no_trainer_records_to_display_")} </p>
          </div>
        )}
      </div>
    </div>
  );
}
