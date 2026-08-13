'use client';

import React from 'react';

export function SkeletonBloc({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md ${className}`}
    />
  );
}

export function SkeletonCarteProfesseur() {
  return (
    <div className="p-4 border rounded-xl space-y-3 bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-3">
        <SkeletonBloc className="w-14 h-14 rounded-full" />
        <div className="space-y-2 flex-1">
          <SkeletonBloc className="h-4 w-32" />
          <SkeletonBloc className="h-3 w-20" />
        </div>
      </div>
      <SkeletonBloc className="h-3 w-full" />
      <SkeletonBloc className="h-3 w-4/5" />
      <div className="flex justify-between items-center pt-2">
        <SkeletonBloc className="h-5 w-24" />
        <SkeletonBloc className="h-9 w-28 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonTableauDeBord() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SkeletonBloc className="h-28 rounded-xl" />
        <SkeletonBloc className="h-28 rounded-xl" />
        <SkeletonBloc className="h-28 rounded-xl" />
      </div>
      <div className="space-y-4">
        <SkeletonBloc className="h-6 w-48" />
        <SkeletonBloc className="h-40 rounded-xl" />
      </div>
    </div>
  );
}
