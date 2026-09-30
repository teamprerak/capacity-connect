'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import {
  Sparkles,
  Award,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Users,
  Play
} from 'lucide-react';
import { AuthModal } from '@/components/AuthModal';
import { Footer } from '@/components/Footer';

const VIDEO_CHAPTERS = [
  { label: 'Introduction', start: 0 },
  { label: 'Trainee Portal', start: 49 },
  { label: 'Trainer Studio', start: 78 },
  { label: 'Admin Dashboard', start: 105 },
  { label: 'Verification', start: 124 },
  { label: 'Outro', start: 134 }
];

export default function LandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeChapter, setActiveChapter] = useState<number>(0);

  const handleChapterClick = (seconds: number) => {
    setActiveChapter(seconds);
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(e => console.log('Autoplay blocked:', e));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-accent border border-border text-muted-foreground text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Industrial Capacity Building &amp; LMS Platform</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.15] mb-5 text-foreground">
              Automate Competency Growth<br className="hidden sm:block" />
              {' '}with AI-Driven Learning
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mb-8 leading-relaxed font-normal">
              Bridge workforce skill gaps automatically. Match trainees with expert trainers, author
              interactive assessments, and issue cryptographically verifiable QR certificates.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setIsAuthOpen(true)}
                className="btn-primary px-6 py-2.5 text-sm"
              >
                Launch Platform Portal <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                href="/trainee/courses"
                className="btn-secondary px-6 py-2.5 text-sm"
              >
                Explore Catalog
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full h-full justify-center">
            {/* Custom Native HTML5 Player */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-xl border border-border bg-black">
              <video
                ref={videoRef}
                className="absolute top-0 left-0 w-full h-full object-cover"
                src="https://nvmerpleyyxbdhodwdcz.supabase.co/storage/v1/object/public/demo-videos/demo.mp4"
                controls
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                poster="/thumbnail.jpg" // Optional placeholder
              />
            </div>

            {/* Interactive Chapter Markers */}
            <div className="surface-card p-5 rounded-xl border border-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Video Navigation
                </span>
                
                {/* Watch on YouTube Redirect Button */}
                <a
                  href="https://www.youtube.com/watch?v=1YdGX3fXZtk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" /> Watch on YouTube
                </a>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {VIDEO_CHAPTERS.map((chapter) => (
                  <button
                    key={chapter.label}
                    onClick={() => handleChapterClick(chapter.start)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                      activeChapter === chapter.start
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-105'
                        : 'bg-accent/50 hover:bg-accent text-foreground border-border hover:scale-105'
                    }`}
                  >
                    <Play className="w-3 h-3" /> {chapter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-20 w-full">
          {[
            { Icon: BrainCircuit, title: 'Competency Engine', desc: 'Automated skill gap matrix computation comparing target vs actual proficiency levels.' },
            { Icon: Users, title: 'Smart Matching', desc: 'Algorithmic trainer-to-trainee pairing based on skill gaps, expertise, and schedule.' },
            { Icon: TrendingUp, title: 'Pre/Post Test Efficacy', desc: 'Server-graded MCQ assessments measuring exact learning score delta improvements.' },
            { Icon: Award, title: 'Verifiable QR Certs', desc: 'Cryptographically signed digital credentials verifiable without authentication.' },
          ].map(({ Icon, title, desc }) => (
            <div key={title} className="surface-card p-5 hover:shadow-md transition-shadow duration-150">
              <div className="p-2.5 w-fit rounded-md bg-accent border border-border mb-4">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1.5">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Live Analytics Preview */}
        <div className="mt-20 w-full surface-card p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 mb-5 border-b border-border">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">
                Live Interactive Intelligence
              </span>
              <h2 className="text-xl font-semibold text-foreground">Enterprise Analytics Matrix</h2>
            </div>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="btn-primary text-xs px-4 py-2 shrink-0"
            >
              Access Full Console
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Skill Gap chart */}
            <div className="p-4 rounded-lg bg-background border border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-4">Skill Gap Priority Distribution</span>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-error">Critical Gap (≥3 levels)</span>
                    <span className="text-muted-foreground">18%</span>
                  </div>
                  <div className="h-1.5 w-full bg-accent rounded-full overflow-hidden">
                    <div className="h-full bg-error/70 w-[18%] rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-warning">High Priority (2 levels)</span>
                    <span className="text-muted-foreground">42%</span>
                  </div>
                  <div className="h-1.5 w-full bg-accent rounded-full overflow-hidden">
                    <div className="h-full bg-warning/70 w-[42%] rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-success">On Track / Mastered</span>
                    <span className="text-muted-foreground">40%</span>
                  </div>
                  <div className="h-1.5 w-full bg-accent rounded-full overflow-hidden">
                    <div className="h-full bg-success/70 w-[40%] rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Match scores */}
            <div className="p-4 rounded-lg bg-background border border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-4">Top Matched Competency Units</span>
              <ul className="space-y-2">
                {[
                  { name: 'Cloud Microservices Architecture', score: '94.5%' },
                  { name: 'Financial Risk Predictive Analytics', score: '91.2%' },
                  { name: 'Enterprise Cyber Defense Auditing', score: '88.7%' },
                ].map(({ name, score }) => (
                  <li key={name} className="flex items-center justify-between p-2.5 rounded-md bg-card border border-border">
                    <span className="text-xs font-medium text-foreground">{name}</span>
                    <span className="badge-neutral ml-2 shrink-0">{score} Match</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Verification Engine */}
            <div className="p-4 rounded-lg bg-background border border-border flex flex-col justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Verification Engine</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Validate any issued certificate using its public cryptographic verification token.
                </p>
              </div>
              <div className="p-3 rounded-md bg-card border border-border text-xs font-mono text-foreground flex items-center justify-between">
                <span>CC-20260823-0001</span>
                <span className="badge-success text-xs font-semibold ml-2">VERIFIED</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
