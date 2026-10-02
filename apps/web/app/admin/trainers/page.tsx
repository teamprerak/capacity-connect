'use client';

import React from 'react';
import { Search } from 'lucide-react';

const trainersData = [
  {
    initials: 'DA',
    name: 'Dr. Arvind Rao',
    department: 'Meteorology',
    rating: '4.9',
    years: '16',
    level: 'Advanced',
    description: 'Specialist in operational forecasting and numerical prediction.',
    tags: ['Numerical Weather Prediction', 'Synoptic Meteorology']
  },
  {
    initials: 'DK',
    name: 'Dr. Kavita Menon',
    department: 'Ocean Services',
    rating: '4.8',
    years: '14',
    level: 'Advanced',
    description: 'Ocean information and marine forecasting specialist.',
    tags: ['Ocean Forecasting', 'Marine Services']
  },
  {
    initials: 'RD',
    name: 'Rahul Deshmukh',
    department: 'Satellite Meteorology',
    rating: '4.7',
    years: '11',
    level: 'Advanced',
    description: 'Operational satellite interpretation and nowcasting trainer.',
    tags: ['Satellite Meteorology', 'Remote Sensing']
  },
  {
    initials: 'DS',
    name: 'Dr. Sana Khan',
    department: 'Hydrometeorology',
    rating: '4.6',
    years: '12',
    level: 'Advanced',
    description: 'Focuses on hydrometeorological hazards and warning services.',
    tags: ['Hydrometeorology', 'Flood Forecasting']
  },
  {
    initials: 'VI',
    name: 'Vivek Iyer',
    department: 'Climate Services',
    rating: '4.5',
    years: '9',
    level: 'Intermediate',
    description: 'Trainer for operational climate data and services.',
    tags: ['Climate Data', 'Seasonal Outlooks']
  }
];

export default function TrainerManagementPage() {
  const isDataAvailable = true;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Trainer Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Verify expertise, review performance and manage trainer readiness.
        </p>
      </div>

      {/* Filter / Search */}
      <div className="max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search trainer or subject" 
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
                      <p className="text-xs text-muted-foreground">{trainer.department}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded">
                    Admin Verified
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 border-y border-border py-3 mb-4">
                  <div>
                    <div className="text-sm font-bold text-foreground">{trainer.rating}</div>
                    <div className="text-[10px] text-muted-foreground">Rating</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{trainer.years}</div>
                    <div className="text-[10px] text-muted-foreground">Years</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{trainer.level}</div>
                    <div className="text-[10px] text-muted-foreground">Level</div>
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
                  Review profile
                </button>
                <button className="px-3 py-1.5 text-xs font-semibold border border-destructive/30 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
                  Remove verification
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full surface-card p-12 rounded-xl border border-border flex flex-col items-center justify-center text-center">
            <h3 className="text-sm font-semibold text-foreground mb-1">No trainers available</h3>
            <p className="text-xs text-muted-foreground">N/A</p>
          </div>
        )}
      </div>
    </div>
  );
}
