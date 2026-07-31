'use client';

import { useEffect, useState } from 'react';

export function CurseurPersonnalise() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Désactiver sur mobile/tablette
    if (window.innerWidth <= 1024) return;

    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement;
      setIsPointer(
        window.getComputedStyle(target).cursor === 'pointer' ||
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button'
      );
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '10px',
        height: '10px',
        backgroundColor: '#0B5E45',
        borderRadius: '50%',
        opacity: 0.6,
        pointerEvents: 'none',
        zIndex: 9999,
        transform: `translate3d(${position.x - 5}px, ${position.y - 5}px, 0) scale(${isPointer ? 1.8 : 1})`,
        transition: 'transform 0.15s ease',
      }}
    />
  );
}
