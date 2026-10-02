'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/DataTable';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Users, AlertTriangle } from 'lucide-react';

export default function TrainerStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'suspended'>('pending');

  useEffect(() => {
    fetchStudents(activeTab);
  }, [activeTab]);

  const fetchStudents = (status: string) => {
    setIsLoading(true);
    api
      .get(`/trainer/students?status=${status}`)
      .then((res) => setStudents(res || []))
      .catch(() => setStudents([]))
      .finally(() => setIsLoading(false));
  };

  const handleUpdateStatus = async (studentId: string, newStatus: string) => {
    try {
      await api.patch(`/trainer/students/${studentId}/status`, { status: newStatus });
      toast.success(`Student status updated to ${newStatus}`);
      fetchStudents(activeTab);
    } catch (err: any) {
      toast.error(err.message || 'Status update failed');
    }
  };

  const columns = [
    {
      header: 'Trainee Information',
      accessor: (user: any) => (
        <div>
          <span className="font-bold text-foreground block">
            {user.traineeProfile?.fullName || 'Anonymous Trainee'}
          </span>
          <span className="text-xs text-muted-foreground block">{user.email}</span>
          {user.traineeProfile?.mobileNumber && (
            <span className="text-[10px] text-muted-foreground">Phone: {user.traineeProfile.mobileNumber}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Registration Date',
      accessor: (user: any) => (
        <span className="text-sm text-muted-foreground">
          {new Date(user.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Account Status',
      accessor: (user: any) => (
        <div className="flex flex-col gap-1 items-start">
          <span
            className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
              user.status === 'active'
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                : user.status === 'suspended'
                ? 'bg-rose-100 text-rose-700 border-rose-200'
                : 'bg-amber-100 text-amber-700 border-amber-200'
            }`}
          >
            {user.status}
          </span>
          {user.status === 'suspended' && user.suspendedBy === 'admin' && (
            <span className="text-[10px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3 h-3" /> Suspended by Admin
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: (user: any) => {
        const isAdminSuspended = user.suspendedBy === 'admin';

        return (
          <div className="flex gap-2">
            {user.status === 'pending' && (
              <button
                onClick={() => handleUpdateStatus(user.id, 'active')}
                disabled={isAdminSuspended}
                className="btn-secondary text-xs px-2.5 py-1 text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title={isAdminSuspended ? 'Cannot approve an admin-suspended account' : 'Approve Trainee'}
              >
                Approve
              </button>
            )}
            {user.status === 'suspended' && (
              <button
                onClick={() => handleUpdateStatus(user.id, 'active')}
                disabled={isAdminSuspended}
                className="btn-secondary text-xs px-2.5 py-1 text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title={isAdminSuspended ? 'Only admin can reactivate this trainee' : 'Activate Trainee'}
              >
                Activate
              </button>
            )}
            {user.status === 'active' && (
              <button
                onClick={() => handleUpdateStatus(user.id, 'suspended')}
                className="btn-secondary text-xs px-2.5 py-1 text-rose-600"
              >
                Suspend
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          Student Approval &amp; Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Approve new trainee registrations and manage their account status.
        </p>
      </div>

      <div className="flex items-center gap-2 border-b border-border mb-4">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'pending'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Pending Registrations
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'active'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Active Trainees
        </button>
        <button
          onClick={() => setActiveTab('suspended')}
          className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'suspended'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Suspended
        </button>
      </div>

      <div className="surface-card p-6 rounded-lg border border-border shadow-sm">
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground text-sm flex flex-col items-center">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
            Loading trainees...
          </div>
        ) : students.length > 0 ? (
          <DataTable columns={columns} data={students} />
        ) : (
          <div className="py-12 text-center text-muted-foreground text-sm bg-accent/30 rounded-lg border border-dashed border-border">
            No trainees found in this category.
          </div>
        )}
      </div>
    </div>
  );
}
