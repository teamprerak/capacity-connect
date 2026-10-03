'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api-client';
import { Sidebar } from '@/components/Sidebar';
import { Loader2, Save, User } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: '',
    specialtyTags: '',
    detailedJobContext: ''
  });

  const role = user?.roles.includes('trainer') ? 'trainer' : user?.roles.includes('admin') ? 'admin' : 'trainee';

  useEffect(() => {
    async function fetchProfile() {
      if (!user || role === 'admin') {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/${role}/profile`);
        setFormData({
          jobTitle: res.jobTitle || '',
          specialtyTags: res.specialtyTags?.join(', ') || '',
          detailedJobContext: res.detailedJobContext || ''
        });
      } catch (error) {
        console.error('Failed to load profile', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const tags = formData.specialtyTags.split(',').map(t => t.trim()).filter(Boolean);
      await api.patch(`/${role}/profile`, {
        jobTitle: formData.jobTitle,
        specialtyTags: tags,
        detailedJobContext: formData.detailedJobContext
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        <Sidebar role={role as any} />
        
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-2xl mx-auto bg-card border border-border rounded-lg shadow-sm">
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Specialty & Job Details</h2>
                  <p className="text-sm text-muted-foreground">Update your professional profile and tags.</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : role === 'admin' ? (
              <div className="p-6 text-muted-foreground">Admins do not have professional profiles.</div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground block">Job Title</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm outline-none focus:ring-1 focus:ring-primary"
                    placeholder="e.g. Senior Radar Technician"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground block">Specialty Tags</label>
                  <p className="text-xs text-muted-foreground mb-1">Separate multiple tags with commas.</p>
                  <input
                    type="text"
                    value={formData.specialtyTags}
                    onChange={(e) => setFormData({ ...formData, specialtyTags: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm outline-none focus:ring-1 focus:ring-primary"
                    placeholder="e.g. Meteorology, Data Analysis, Leadership"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground block">Detailed Job Context</label>
                  <textarea
                    value={formData.detailedJobContext}
                    onChange={(e) => setFormData({ ...formData, detailedJobContext: e.target.value })}
                    className="w-full h-32 px-3 py-2 bg-background border border-input rounded-md text-sm outline-none focus:ring-1 focus:ring-primary resize-y"
                    placeholder="Describe your daily responsibilities and specialized skills..."
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>

              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
