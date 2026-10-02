'use client';

import React from 'react';

import { api } from '@/lib/api-client';

export default function ContentNotificationsPage() {
  const [publishedContent, setPublished] = React.useState<any[]>([]);

  React.useEffect(() => {
    api.get('/admin/announcements').then(setPublished).catch(() => []);
  }, []);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Content & Notifications</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Publish announcements, achievements, new courses, resources and deadlines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column - Publish Form */}
        <div className="surface-card p-6 rounded-xl border border-border">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-foreground">Publish update</h2>
            <p className="text-xs text-muted-foreground">Visible to selected audience</p>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Title</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Message</label>
              <textarea 
                rows={4}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Type</label>
                <select className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option>announcement</option>
                  <option>course</option>
                  <option>deadline</option>
                  <option>achievement</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Audience</label>
                <select className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option>all</option>
                  <option>trainees</option>
                  <option>trainers</option>
                </select>
              </div>
            </div>

            <button type="submit" className="w-full btn-primary py-2.5 mt-2">
              Publish notification
            </button>
          </form>
        </div>

        {/* Right Column - Published Content List */}
        <div className="surface-card p-6 rounded-xl border border-border">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-foreground">Published content</h2>
            <p className="text-xs text-muted-foreground">Newest first</p>
          </div>

          <div className="space-y-4">
            {publishedContent.length > 0 ? publishedContent.map((item, idx) => (
              <div key={idx} className="pb-4 border-b border-border last:border-0 last:pb-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-primary/10 text-primary">
                    {item.type}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-accent text-muted-foreground">
                    {item.audience}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-foreground mb-1">{item.title}</h4>
                <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{item.message}</p>
                <span className="text-[10px] text-muted-foreground">{item.date}</span>
              </div>
            )) : (
              <div className="text-center py-10 text-sm text-muted-foreground">
                N/A (No updates published yet)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
