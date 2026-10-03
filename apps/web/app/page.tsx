'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { PageTransition } from '@/components/PageTransition';
import {
  Sparkles,
  Award,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Users,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize
} from 'lucide-react';
import { Footer } from '@/components/Footer';
import { AnimatedPeopleBackground } from '@/components/AnimatedPeopleBackground';
import { useTranslation } from "react-i18next";

const VIDEO_CHAPTERS = [
  { label: 'Introduction', start: 0 },
  { label: 'Trainee Portal', start: 49 },
  { label: 'Trainer Studio', start: 78 },
  { label: 'Admin Dashboard', start: 105 },
  { label: 'Verification', start: 124 },
  { label: 'Outro', start: 134 }
];

export default function LandingPage() {
    const { t } = useTranslation();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeChapter, setActiveChapter] = useState<number>(0);
  
  // Custom Video Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p || 0);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleChapterClick = (seconds: number) => {
    setActiveChapter(seconds);
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(e => console.log('Autoplay blocked:', e));
    }
  };

  return (
    <PageTransition className="flex flex-col bg-background text-foreground overflow-x-hidden min-h-[calc(100vh-3.5rem)]">
      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-10 relative">
          <AnimatedPeopleBackground />
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-accent border border-border text-muted-foreground text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span> {t("industrial_capacity_building__")} </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.15] mb-5 text-foreground">
               {t("automate_competency_growth")} <br className="hidden sm:block" />
              {' '} {t("with_ai_driven_learning")} </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mb-8 leading-relaxed font-normal">
               {t("bridge_workforce_skill_gaps_au")} </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/login"
                className="btn-primary px-6 py-2.5 text-sm inline-flex items-center justify-center gap-2"
              >
                 {t("launch_platform_portal")} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/trainee/courses"
                className="btn-secondary px-6 py-2.5 text-sm"
              >
                 {t("explore_catalog")} </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full h-full justify-center relative z-10">
            {/* Premium Native HTML5 Player with Custom Controls */}
            <div 
              className="relative w-full aspect-video rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-border bg-black group"
              onMouseEnter={() => setShowControls(true)}
              onMouseLeave={() => isPlaying && setShowControls(false)}
            >
              <video
                ref={videoRef}
                className="absolute top-0 left-0 w-full h-full object-contain"
                src="https://nvmerpleyyxbdhodwdcz.supabase.co/storage/v1/object/public/demo-videos/demo.mp4"
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onClick={togglePlay}
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                poster="/thumbnail.jpg"
              />
              
              {/* Center Play Button Overlay (fades out when playing) */}
              <div 
                className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100 bg-black/40 backdrop-blur-[2px]'}`}
              >
                <div className="w-16 h-16 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25">
                  <Play className="w-8 h-8 ml-1" />
                </div>
              </div>

              {/* Bottom Control Bar */}
              <div 
                className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}
              >
                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-white/20 rounded-full mb-4 overflow-hidden cursor-pointer" onClick={(e) => {
                  if (videoRef.current) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pos = (e.clientX - rect.left) / rect.width;
                    videoRef.current.currentTime = pos * videoRef.current.duration;
                  }
                }}>
                  <div className="h-full bg-primary transition-all duration-100" style={{ width: `${progress}%` }} />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-4">
                    <button onClick={togglePlay} className="hover:text-primary transition-colors">
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    <button onClick={toggleMute} className="hover:text-primary transition-colors">
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  <button onClick={toggleFullscreen} className="hover:text-primary transition-colors">
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Chapter Markers */}
            <div className="surface-card p-5 rounded-xl border border-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                   {t("video_navigation")} </span>
                
                {/* Watch on YouTube Redirect Button */}
                <a
                  href="https://www.youtube.com/watch?v=1YdGX3fXZtk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />  {t("watch_on_youtube")} </a>
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
                 {t("live_interactive_intelligence")} </span>
              <h2 className="text-xl font-semibold text-foreground"> {t("enterprise_analytics_matrix")} </h2>
            </div>
            <Link
              href="/login"
              className="btn-primary text-xs px-4 py-2 shrink-0 inline-flex items-center justify-center"
            >
               {t("access_full_console")} </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Skill Gap chart */}
            <div className="p-4 rounded-lg bg-background border border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-4"> {t("skill_gap_priority_distributio")} </span>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-error"> {t("critical_gap___3_levels_")} </span>
                    <span className="text-muted-foreground"> {t("18_")} </span>
                  </div>
                  <div className="h-1.5 w-full bg-accent rounded-full overflow-hidden">
                    <div className="h-full bg-error/70 w-[18%] rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-warning"> {t("high_priority__2_levels_")} </span>
                    <span className="text-muted-foreground"> {t("42_")} </span>
                  </div>
                  <div className="h-1.5 w-full bg-accent rounded-full overflow-hidden">
                    <div className="h-full bg-warning/70 w-[42%] rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-success"> {t("on_track___mastered")} </span>
                    <span className="text-muted-foreground"> {t("40_")} </span>
                  </div>
                  <div className="h-1.5 w-full bg-accent rounded-full overflow-hidden">
                    <div className="h-full bg-success/70 w-[40%] rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Match scores */}
            <div className="p-4 rounded-lg bg-background border border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-4"> {t("top_matched_competency_units")} </span>
              <ul className="space-y-2">
                {[
                  { name: 'Cloud Microservices Architecture', score: '94.5%' },
                  { name: 'Financial Risk Predictive Analytics', score: '91.2%' },
                  { name: 'Enterprise Cyber Defense Auditing', score: '88.7%' },
                ].map(({ name, score }) => (
                  <li key={name} className="flex items-center justify-between p-2.5 rounded-md bg-card border border-border">
                    <span className="text-xs font-medium text-foreground">{name}</span>
                    <span className="badge-neutral ml-2 shrink-0">{score}  {t("match")} </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Verification Engine */}
            <div className="p-4 rounded-lg bg-background border border-border flex flex-col justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2"> {t("verification_engine")} </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                   {t("validate_any_issued_certificat")} </p>
              </div>
              <div className="p-3 rounded-md bg-card border border-border text-xs font-mono text-foreground flex items-center justify-between">
                <span> {t("cc_20260823_0001")} </span>
                <span className="badge-success text-xs font-semibold ml-2"> {t("verified")} </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </PageTransition>
  );
}
