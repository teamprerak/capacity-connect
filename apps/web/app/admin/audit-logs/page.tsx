'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/DataTable';
import { api } from '@/lib/api-client';
import { ShieldCheck, Calendar, Globe, Code, Search } from 'lucide-react';
import { Modal } from '@/components/Modal';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedMeta, setSelectedMeta] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api
      .get('/admin/audit-logs?limit=50')
      .then((res) => setLogs(res.data || res || []))
      .catch(() => setLogs([]))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredLogs = logs.filter(
    (log) =>
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.actor?.email?.toLowerCase().includes(search.toLowerCase()) ||
      log.entityType?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: 'Timestamp',
      accessor: (log: any) => (
        <span className="text-xs text-muted-foreground font-mono">
          {new Date(log.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Actor User',
      accessor: (log: any) => (
        <span className="text-xs text-foreground font-semibold">
          {log.actor?.email || log.actorUserId || 'System / Public'}
        </span>
      ),
    },
    {
      header: 'Action Executed',
      accessor: (log: any) => (
        <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
          {log.action}
        </span>
      ),
    },
    {
      header: 'Target Entity',
      accessor: (log: any) => (
        <span className="text-xs text-muted-foreground">
          {log.entityType} <span className="text-[10px] text-muted-foreground font-mono">({log.entityId || 'N/A'})</span>
        </span>
      ),
    },
    {
      header: 'Client IP',
      accessor: (log: any) => (
        <span className="text-xs text-muted-foreground font-mono">{log.ipAddress || '127.0.0.1'}</span>
      ),
    },
    {
      header: 'Metadata Payload',
      accessor: (log: any) => (
        <button
          onClick={() => setSelectedMeta(log.metadata)}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-card text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <Code className="w-3.5 h-3.5 text-muted-foreground" /> View JSON
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Audit Log Stream
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Immutable audit trails recording user actions, status modifications, and course approvals.
        </p>
      </div>

      <div className="bg-card border border-border shadow-sm rounded-lg p-4 border border-border">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, actor email, or entity..."
            className="w-full pl-10 pr-4 py-2.5 rounded-md bg-background border border-border text-foreground text-sm focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
        </div>
      </div>

      <DataTable columns={columns} data={filteredLogs} isLoading={isLoading} />

      <Modal
        isOpen={!!selectedMeta}
        onClose={() => setSelectedMeta(null)}
        title="Audit Event Metadata Inspector"
      >
        <pre className="p-4 rounded-md bg-background border border-border text-xs font-mono text-emerald-700 overflow-x-auto">
          {JSON.stringify(selectedMeta, null, 2)}
        </pre>
      </Modal>
    </div>
  );
}
