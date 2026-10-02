'use client';

import React from 'react';

export function AnimatedPeopleBackground() {
  return (
    <div className="absolute bottom-[-20px] left-[50%] w-[100vw] h-[200px] -translate-x-1/2 overflow-hidden pointer-events-none z-0 opacity-[0.12] dark:opacity-[0.16] flex items-end">
      {/* 
        The theme color is controlled via 'text-foreground' which 
        resolves to navy in light mode and off-white in dark mode. 
        Using currentColor on the SVG inherits this seamlessly.
      */}
      <div 
        className="text-foreground animate-pan-crowd will-change-transform flex"
        style={{ width: '4200px' }}
      >
        <svg 
          width="4200" 
          height="150" 
          viewBox="0 0 4200 150" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMinYMax meet"
        >
          <defs>
            <g id="crowd-segment">
              {/* Figure 1: Educator & Board (Warli Style) */}
              <g transform="translate(20, 20)">
                <circle cx="20" cy="15" r="10" fill="currentColor" />
                <path d="M20,55 L5,30 L35,30 Z M20,55 L5,80 L35,80 Z" fill="currentColor" />
                <path d="M 12,80 L 12,110 M 28,80 L 28,110" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M 5,30 L -5,45 L 5,60 M 35,30 L 55,20 L 75,15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <rect x="70" y="-5" width="45" height="55" fill="none" stroke="currentColor" strokeWidth="2.5" />
                <path d="M 75,45 L 85,30 L 95,35 L 105,15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </g>

              {/* Figure 2: Working on Laptop (Warli Style) */}
              <g transform="translate(180, 40)">
                <circle cx="20" cy="15" r="10" fill="currentColor" />
                <path d="M20,55 L5,30 L35,30 Z M20,55 L5,80 L35,80 Z" fill="currentColor" />
                <path d="M 5,80 L -10,90 L 15,90 M 35,80 L 50,90 L 25,90" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M 35,30 L 50,45 L 40,65 M 5,30 L -5,45 L 10,60" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M 35,75 L 55,75 L 45,55 L 60,55" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </g>

              {/* Figure 3: Industry / Gear (Warli Style) */}
              <g transform="translate(320, 20)">
                <circle cx="20" cy="15" r="10" fill="currentColor" />
                <path d="M20,55 L5,30 L35,30 Z M20,55 L5,80 L35,80 Z" fill="currentColor" />
                <path d="M 10,80 L -5,95 L -5,110 M 30,80 L 45,95 L 35,110" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M 5,30 L -10,10 L 0,0 M 35,30 L 50,10 L 40,0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <circle cx="20" cy="-5" r="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 4" />
                <circle cx="20" cy="-5" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
              </g>

              {/* Figure 4: Collaboration (Two Warli People) */}
              <g transform="translate(460, 20)">
                {/* Person A */}
                <circle cx="15" cy="15" r="10" fill="currentColor" />
                <path d="M15,55 L0,30 L30,30 Z M15,55 L0,80 L30,80 Z" fill="currentColor" />
                <path d="M 5,80 L -5,110 M 25,80 L 35,110" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M 0,30 L -10,45 L 0,60" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M 30,30 L 50,25 L 65,35" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

                {/* Person B */}
                <circle cx="105" cy="15" r="10" fill="currentColor" />
                <path d="M105,55 L90,30 L120,30 Z M105,55 L90,80 L120,80 Z" fill="currentColor" />
                <path d="M 95,80 L 85,110 M 115,80 L 125,110" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M 120,30 L 130,45 L 120,60" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M 90,30 L 70,25 L 65,35" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </g>

              {/* Figure 5: Reading / Book (Warli Style) */}
              <g transform="translate(640, 20)">
                <circle cx="20" cy="15" r="10" fill="currentColor" />
                <path d="M20,55 L5,30 L35,30 Z M20,55 L5,80 L35,80 Z" fill="currentColor" />
                <path d="M 10,80 L 5,110 M 30,80 L 35,110" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M 5,30 L -10,45 L 10,55 M 35,30 L 50,45 L 30,55" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M 20,45 L 35,52 L 20,60 L 5,52 Z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 20,45 L 20,60" stroke="currentColor" strokeWidth="1.5" />
              </g>
            </g>
          </defs>

          {/* Repeat the crowd segment to create a continuous panoramic loop */}
          {/* Each segment is ~700px wide. 6 segments = 4200px width. */}
          <use href="#crowd-segment" x="0" y="0" />
          <use href="#crowd-segment" x="700" y="10" transform="scale(0.98)" style={{ transformOrigin: '700px 150px' }} />
          <use href="#crowd-segment" x="1400" y="-5" transform="scale(1.02)" style={{ transformOrigin: '1400px 150px' }} />
          <use href="#crowd-segment" x="2100" y="0" />
          <use href="#crowd-segment" x="2800" y="15" transform="scale(0.95)" style={{ transformOrigin: '2800px 150px' }} />
          <use href="#crowd-segment" x="3500" y="5" transform="scale(0.99)" style={{ transformOrigin: '3500px 150px' }} />
        </svg>
      </div>

      <style jsx>{`
        @keyframes pan-crowd {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(-2100px, 0, 0);
          }
        }
        
        .animate-pan-crowd {
          animation: pan-crowd 45s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-pan-crowd {
            animation: none;
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>
    </div>
  );
}
