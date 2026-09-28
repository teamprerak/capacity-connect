'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, Shield, FileText, Lock, Heart, Award, ArrowUpRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card/50 backdrop-blur-xs">
      {/* Upper Footer: Branding & Categorized Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="logo-tile icon-on-primary w-8 h-8 rounded-md flex items-center justify-center shadow-xs transition-all group-hover:scale-105">
                <Layers className="w-4 h-4" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold tracking-tight text-foreground">
                  Capacity Connect
                </span>
                <span className="text-[10px] tracking-widest uppercase font-semibold text-primary -mt-0.5">
                  Enterprise LMS
                </span>
              </div>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Industrial-grade learning and capacity building platform engineered by <strong>Team Prerak</strong>. Automating competency mapping, skill gap analysis, and verifiable certification.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                Engineered with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> by Team Prerak
              </span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Overview &amp; Features
                </Link>
              </li>
              <li>
                <Link href="/trainee/courses" className="hover:text-foreground transition-colors">
                  Course Catalog
                </Link>
              </li>
              <li>
                <Link href="/trainee" className="hover:text-foreground transition-colors">
                  Trainee Portal
                </Link>
              </li>
              <li>
                <Link href="/trainer" className="hover:text-foreground transition-colors">
                  Trainer Studio
                </Link>
              </li>
              <li>
                <Link href="/admin/dashboard" className="hover:text-foreground transition-colors">
                  Admin Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Verification & Trust */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
              Trust &amp; Verification
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/certificates/verify/demo" className="hover:text-foreground transition-colors flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-primary" /> Certificate Verification
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-foreground transition-colors flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-primary" /> Security Architecture
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/teamprerak/capacity-connect"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground transition-colors flex items-center gap-1"
                >
                  GitHub Repository <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Company */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
              Organization &amp; Legal
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About Team Prerak &amp; Platform
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Sub-footer */}
      <div className="border-t border-border py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            &copy; {new Date().getFullYear()} Capacity Connect Platform. Crafted by <strong>Team Prerak</strong>. All rights reserved.
          </span>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/security" className="hover:text-foreground transition-colors">
              Security Architecture
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
