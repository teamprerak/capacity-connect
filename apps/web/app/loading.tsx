"use client";
import React from 'react';
import { Spinner } from '@/components/Spinner';
import { useTranslation } from "react-i18next";

export default function Loading() {
    const { t } = useTranslation();
  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <Spinner size="lg" label={t("loading_workspace___")} />
    </div>
  );
}
