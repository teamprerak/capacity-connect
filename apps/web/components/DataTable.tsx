'use client';

import React from 'react';
import { Inbox } from 'lucide-react';
import { useTranslation } from "react-i18next";

interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  isLoading,
  emptyMessage = 'No records found',
}: DataTableProps<T>) {
    const { t } = useTranslation();
  if (isLoading) {
    return (
      <div className="bg-card border border-border shadow-sm rounded-lg p-8 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-medium text-muted-foreground"> {t("loading_data___")} </span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-card border border-border shadow-sm rounded-lg p-12 flex flex-col items-center justify-center text-center gap-3">
        <div className="p-3 rounded-full bg-card text-muted-foreground">
          <Inbox className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border shadow-sm rounded-lg overflow-hidden border border-border">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-muted-foreground">
          <thead className="bg-background text-xs uppercase font-semibold text-muted-foreground border-b border-border">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-6 py-4 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((item, rowIdx) => (
              <tr
                key={item.id ?? rowIdx}
                className="hover:bg-card transition-colors"
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`px-6 py-4 ${col.className || ''}`}>
                    {col.accessor(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
