'use client';

import { GardeRoute } from '@/composants/auth/garde-route';
import type { ReactNode } from 'react';

export default function LayoutProfesseur({ children }: { children: ReactNode }) {
  return (
    <GardeRoute rolesAutorises={['PROFESSEUR']}>
      {children}
    </GardeRoute>
  );
}
