'use client';

import { GardeRoute } from '@/composants/auth/garde-route';
import type { ReactNode } from 'react';

export default function LayoutEleve({ children }: { children: ReactNode }) {
  return (
    <GardeRoute rolesAutorises={['ELEVE']}>
      {children}
    </GardeRoute>
  );
}
