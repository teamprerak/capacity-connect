'use client';

import React from 'react';
import { 
  BookOpen, 
  User, 
  Users, 
  CheckSquare, 
  ShieldCheck, 
  Award, 
  Network 
} from 'lucide-react';

export function CapabilityNetwork() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-end justify-end md:items-center pr-0 md:pr-16 pb-32 md:pb-0">
      <div className="relative w-[300px] h-[300px] md:w-[600px] md:h-[600px] opacity-40 md:opacity-60 -mr-20 md:-mr-32">
        
        {/* SVG Network Lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 600">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(56, 189, 248, 0)" />
              <stop offset="50%" stopColor="rgba(56, 189, 248, 0.5)" />
              <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
            </linearGradient>
            
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <g className="animate-spin-slow" style={{ transformOrigin: '300px 300px' }}>
            {/* Center to Node 1 (Learning) */}
            <path d="M300,300 L200,150" stroke="url(#lineGrad)" strokeWidth="1" fill="none" />
            
            {/* Center to Node 2 (Trainer) */}
            <path d="M300,300 L450,180" stroke="url(#lineGrad)" strokeWidth="1" fill="none" />
            
            {/* Center to Node 3 (Trainee) */}
            <path d="M300,300 L500,350" stroke="url(#lineGrad)" strokeWidth="1" fill="none" />
            
            {/* Center to Node 4 (Assessment) */}
            <path d="M300,300 L380,480" stroke="url(#lineGrad)" strokeWidth="1" fill="none" />
            
            {/* Center to Node 5 (Verification) */}
            <path d="M300,300 L180,420" stroke="url(#lineGrad)" strokeWidth="1" fill="none" />
            
            {/* Center to Node 6 (Certification) */}
            <path d="M300,300 L120,280" stroke="url(#lineGrad)" strokeWidth="1" fill="none" />
            
            {/* Inter-node connecting lines for structural feel */}
            <path d="M200,150 L450,180 L500,350 L380,480 L180,420 L120,280 Z" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
          </g>
        </svg>

        {/* Central Core: Competency */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 flex items-center justify-center scale-75 md:scale-100">
          <div className="absolute inset-0 bg-sky-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="relative w-16 h-16 border border-sky-400/40 bg-[#0B3B59]/80 backdrop-blur-sm rounded-xl transform rotate-45 flex items-center justify-center shadow-[0_0_30px_rgba(56,189,248,0.2)] overflow-hidden">
            <div className="w-full h-full border border-sky-300/20 rounded-xl transform scale-75 animate-reverse-spin-slow"></div>
            <Network className="absolute transform -rotate-45 text-sky-400 w-6 h-6 opacity-90" />
          </div>
        </div>

        {/* Surrounding Nodes (Animated via CSS) */}
        <div className="absolute inset-0 animate-spin-slow origin-center scale-75 md:scale-100">
          
          {/* Node 1: Learning */}
          <div className="absolute top-[150px] left-[200px] -translate-x-1/2 -translate-y-1/2 animate-reverse-spin-slow origin-center">
            <div className="w-10 h-10 rounded-lg border border-white/20 bg-[#0B3B59]/80 backdrop-blur-md flex items-center justify-center shadow-lg">
              <BookOpen className="w-4 h-4 text-white/70" />
            </div>
          </div>

          {/* Node 2: Trainer */}
          <div className="absolute top-[180px] left-[450px] -translate-x-1/2 -translate-y-1/2 animate-reverse-spin-slow origin-center">
            <div className="w-10 h-10 rounded-lg border border-white/20 bg-[#0B3B59]/80 backdrop-blur-md flex items-center justify-center shadow-lg">
              <User className="w-4 h-4 text-white/70" />
            </div>
          </div>

          {/* Node 3: Trainee */}
          <div className="absolute top-[350px] left-[500px] -translate-x-1/2 -translate-y-1/2 animate-reverse-spin-slow origin-center">
            <div className="w-10 h-10 rounded-lg border border-white/20 bg-[#0B3B59]/80 backdrop-blur-md flex items-center justify-center shadow-lg">
              <Users className="w-4 h-4 text-white/70" />
            </div>
          </div>

          {/* Node 4: Assessment */}
          <div className="absolute top-[480px] left-[380px] -translate-x-1/2 -translate-y-1/2 animate-reverse-spin-slow origin-center">
            <div className="w-10 h-10 rounded-lg border border-white/20 bg-[#0B3B59]/80 backdrop-blur-md flex items-center justify-center shadow-lg">
              <CheckSquare className="w-4 h-4 text-white/70" />
            </div>
          </div>

          {/* Node 5: Verification */}
          <div className="absolute top-[420px] left-[180px] -translate-x-1/2 -translate-y-1/2 animate-reverse-spin-slow origin-center">
            <div className="w-10 h-10 rounded-lg border border-white/20 bg-[#0B3B59]/80 backdrop-blur-md flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-4 h-4 text-white/70" />
            </div>
          </div>

          {/* Node 6: Certification */}
          <div className="absolute top-[280px] left-[120px] -translate-x-1/2 -translate-y-1/2 animate-reverse-spin-slow origin-center">
            <div className="w-10 h-10 rounded-lg border border-white/20 bg-[#0B3B59]/80 backdrop-blur-md flex items-center justify-center shadow-lg">
              <Award className="w-4 h-4 text-white/70" />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
