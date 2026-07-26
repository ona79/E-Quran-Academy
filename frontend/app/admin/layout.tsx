'use client';

import { GardeRoute } from '@/composants/auth/garde-route';
import type { ReactNode } from 'react';

export default function LayoutAdmin({ children }: { children: ReactNode }) {
  return (
    <GardeRoute rolesAutorises={['ADMIN']}>
      {children}
    </GardeRoute>
  );
}
