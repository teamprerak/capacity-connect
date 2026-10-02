'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/DataTable';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { Users, CheckCircle, XCircle, ShieldCheck, UserCheck } from 'lucide-react';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setIsLoading(true);
    api
      .get('/admin/users?limit=50')
      .then((res) => setUsers(res.data || []))
      .catch(() => setUsers([]))
      .finally(() => setIsLoading(false));
  };

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: newStatus });
      toast.success(`User status updated to ${newStatus}`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Status update failed');
    }
  };

  const handleVerifyTrainer = async (trainerId: string, verificationStatus: string) => {
    try {
      await api.patch(`/admin/trainers/${trainerId}/verify`, { status: verificationStatus });
      toast.success(`Trainer verification status updated to ${verificationStatus}`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Trainer verification failed');
    }
  };

  const columns = [
    {
      header: 'User Email',
      accessor: (user: any) => (
        <div>
          <span className="font-bold text-foreground block">{user.email}</span>
          <span className="text-[10px] text-muted-foreground font-mono">ID: {user.id}</span>
        </div>
      ),
    },
    {
      header: 'Assigned Roles',
      accessor: (user: any) => (
        <div className="flex flex-wrap gap-1">
          {user.userRoles?.map((ur: any, idx: number) => (
            <span
              key={idx}
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                ur.role?.name === 'admin'
                  ? 'bg-amber-100 text-amber-700 border-amber-200'
                  : ur.role?.name === 'trainer'
                  ? 'bg-purple-100 text-purple-700 border-purple-200'
                  : 'bg-primary/10 text-primary border-primary/20'
              }`}
            >
              {ur.role?.name || 'user'}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Account Status',
      accessor: (user: any) => (
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
      ),
    },
    {
      header: 'Specialty / Tags',
      accessor: (user: any) => {
        const profile = user.trainerProfile || user.traineeProfile;
        if (!profile || (!profile.jobTitle && (!profile.specialtyTags || profile.specialtyTags.length === 0))) {
          return <span className="text-muted-foreground text-xs">—</span>;
        }
        
        return (
          <div>
            {profile.jobTitle && <div className="font-semibold text-[10px] text-foreground mb-0.5">{profile.jobTitle}</div>}
            <div className="flex flex-wrap gap-1">
              {profile.specialtyTags?.map((tag: string, idx: number) => (
                <span key={idx} className="bg-slate-100 border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Actions',
      accessor: (user: any) => {
        const isAdminUser = user.userRoles?.some((ur: any) => ur.role?.name === 'admin');
        const isSelf = user.id === currentUser?.id;

        return (
          <div className="flex items-center gap-2">
            {isAdminUser || isSelf ? (
              // Admin accounts and the current session user cannot be suspended
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
                <ShieldCheck className="w-3 h-3" />
                {isSelf ? 'You' : 'Admin'}
              </span>
            ) : user.status === 'active' ? (
              <button
                onClick={() => handleUpdateStatus(user.id, 'suspended')}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-200 transition-colors"
              >
                Suspend
              </button>
            ) : (
              <button
                onClick={() => handleUpdateStatus(user.id, 'active')}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200 transition-colors"
              >
                Activate
              </button>
            )}

            {user.trainerProfile && !isAdminUser && (
              <button
                onClick={() => handleVerifyTrainer(user.trainerProfile.id, 'verified')}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200 hover:bg-purple-200 transition-colors"
              >
                Verify Trainer
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          User & Trainer Verification Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage system users, activate/suspend accounts, and moderate trainer verification applications.
        </p>
      </div>

      <DataTable columns={columns} data={users} isLoading={isLoading} />
    </div>
  );
}
