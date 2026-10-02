'use client';

import React from 'react';
import { Search } from 'lucide-react';

const mediaData: any[] = [];
export default function MediaGovernancePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Media Governance & Learning Repository</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review trainer uploads and verify that every IMD learning asset is mapped to the right course, lesson and competency.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search media, subject or competency" 
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select className="px-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none">
          <option>All statuses</option>
          <option>Published</option>
          <option>Pending</option>
        </select>
      </div>

      {/* Table */}
      <div className="surface-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] uppercase text-muted-foreground bg-accent/50">
              <tr>
                <th className="px-5 py-3 font-semibold">RESOURCE</th>
                <th className="px-5 py-3 font-semibold">MAPPING</th>
                <th className="px-5 py-3 font-semibold">TRAINER</th>
                <th className="px-5 py-3 font-semibold">MEDIA</th>
                <th className="px-5 py-3 font-semibold">STATUS</th>
                <th className="px-5 py-3 font-semibold text-right">GOVERNANCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mediaData.length > 0 ? (
                mediaData.map((row: any, i) => (
                  <tr key={i} className="hover:bg-accent/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground">{row.title}</p>
                      <p className="text-[11px] text-muted-foreground">{row.subtitle}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground">{row.mappingType}</p>
                      <p className="text-[11px] text-muted-foreground">{row.mappingDetails}</p>
                    </td>
                    <td className="px-5 py-4 font-medium text-foreground">{row.trainer}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground">{row.mediaType}</p>
                      <p className="text-[11px] text-muted-foreground">{row.mediaLang}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-emerald-500/10 text-emerald-500">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className="px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    N/A (No media uploads found)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
