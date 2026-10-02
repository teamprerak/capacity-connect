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
              {/* Figure 1: Scientist with glasses */}
              <g transform="translate(10, 30)">
                <circle cx="30" cy="20" r="12" stroke="currentColor" strokeWidth="2" />
                <path d="M22,18 h16 M22,18 a4,4 0 0,0 0,8 a4,4 0 0,0 0,-8 M38,18 a4,4 0 0,0 0,8 a4,4 0 0,0 0,-8" stroke="currentColor" strokeWidth="1.5" />
                <path d="M15,40 C20,32 40,32 45,40 L55,120 L5,120 Z" stroke="currentColor" strokeWidth="2" />
                <path d="M20,42 L25,70 L40,65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <rect x="38" y="55" width="6" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
              </g>

              {/* Figure 2: Person with Laptop (sitting) */}
              <g transform="translate(110, 50)">
                <circle cx="25" cy="15" r="11" stroke="currentColor" strokeWidth="2" />
                <path d="M12,35 C20,30 35,32 40,45 L45,100 L10,100 Z" stroke="currentColor" strokeWidth="2" />
                <path d="M45,65 L60,65 L55,50 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <path d="M25,40 C30,55 40,60 45,62" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </g>

              {/* Figure 3: Professional standing with tablet */}
              <g transform="translate(200, 20)">
                <circle cx="25" cy="15" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12,32 C18,26 32,26 38,32 L42,130 L8,130 Z" stroke="currentColor" strokeWidth="2" />
                <g transform="translate(40, 60) rotate(-15)">
                  <rect x="-8" y="-11" width="16" height="22" rx="2" stroke="currentColor" strokeWidth="2" />
                </g>
                <path d="M15,38 L35,55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </g>

              {/* Figure 4: Woman pointing / presenting */}
              <g transform="translate(300, 35)">
                <circle cx="25" cy="15" r="11" stroke="currentColor" strokeWidth="2" />
                <path d="M14,15 C14,0 36,0 36,15 L38,25 C30,28 20,28 12,25 Z" stroke="currentColor" strokeWidth="2" />
                <path d="M15,35 C20,30 30,30 35,35 L42,115 L8,115 Z" stroke="currentColor" strokeWidth="2" />
                <path d="M28,35 L55,20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </g>

              {/* Figure 5: Person reading */}
              <g transform="translate(410, 45)">
                <circle cx="25" cy="15" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12,35 C20,28 30,30 38,40 L45,105 L5,105 Z" stroke="currentColor" strokeWidth="2" />
                <path d="M35,55 L55,50 L60,70 L40,75 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <path d="M38,60 L52,56" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              </g>

              {/* Figure 6: Professional with tie */}
              <g transform="translate(500, 25)">
                <circle cx="25" cy="15" r="12" stroke="currentColor" strokeWidth="2" />
                <path d="M10,35 C18,28 32,28 40,35 L48,125 L2,125 Z" stroke="currentColor" strokeWidth="2" />
                <path d="M25,30 L28,50 L25,55 L22,50 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <path d="M12,45 L35,50 M38,45 L15,52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </g>

              {/* Figure 7: Two people talking */}
              <g transform="translate(600, 40)">
                <circle cx="15" cy="15" r="9" stroke="currentColor" strokeWidth="2" />
                <path d="M5,32 C10,28 20,28 25,32 L28,110 L2,110 Z" stroke="currentColor" strokeWidth="2" />
                
                <circle cx="45" cy="10" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M35,28 C40,22 50,22 55,28 L60,110 L30,110 Z" stroke="currentColor" strokeWidth="2" />
                <path d="M40,35 L25,45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
