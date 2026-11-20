'use client';

import React from 'react';
import { DashboardSkeleton } from '@/components/ui/DataSkeletonLoader';

export default function DashboardLoading() {
  return (
    <>
      <div className="laser-progress-bar" />
      <DashboardSkeleton />
    </>
  );
}
