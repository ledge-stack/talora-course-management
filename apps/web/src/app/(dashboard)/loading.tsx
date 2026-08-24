import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 h-full p-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="page-header border-b border-border-subtle pb-6 mb-2">
        <div className="flex flex-col gap-2">
          <div className="h-8 bg-bg-surface-active rounded-md w-64"></div>
          <div className="h-4 bg-bg-surface-hover rounded-md w-48"></div>
        </div>
      </div>

      {/* Stats/KPI Row Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-bg-surface border border-border-subtle rounded-xl p-6 shadow-sm">
            <div className="h-3 bg-bg-surface-hover rounded-md w-24 mb-3"></div>
            <div className="h-8 bg-bg-surface-active rounded-md w-16"></div>
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="bg-bg-surface border border-border-subtle rounded-xl flex-1 flex flex-col gap-4 p-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 items-center py-3 border-b border-border-subtle last:border-0">
            <div className="w-10 h-10 rounded-full bg-bg-surface-hover"></div>
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-4 bg-bg-surface-active rounded-md w-1/3"></div>
              <div className="h-3 bg-bg-surface-hover rounded-md w-1/2"></div>
            </div>
            <div className="h-8 w-20 bg-bg-surface-hover rounded-md"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
