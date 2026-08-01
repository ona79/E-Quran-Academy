'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useInView, animate } from 'framer-motion';

const FLAGS = [
  { flag: '🇫🇷', name: 'France' },
  { flag: '🇧🇪', name: 'Belgique' },
  { flag: '🇨🇭', name: 'Suisse' },
  { flag: '🇨🇦', name: 'Canada' },
  { flag: '🇸🇳', name: 'Sénégal' },
  { flag: '🇲🇱', name: 'Mali' },
  { flag: '🇨🇮', name: 'Côte d\'Ivoire' },
  { flag: '🇬🇳', name: 'Guinée' },
  { flag: '🇲🇦', name: 'Maroc' },
  { flag: '🇩🇿', name: 'Algérie' },
  { flag: '🇺🇸', name: 'États-Unis' },
  { flag: '🇬🇧', name: 'Royaume-Uni' },
];

function AnimatedNumber({ finalValue, suffix }: { finalValue: number; suffix: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (inView) {
      const controls = animate(0, finalValue, {
        duration: 2.2,
        ease: "easeOut",
        onUpdate(value) {
          const isFloat = finalValue % 1 !== 0;
          setDisplayValue(isFloat ? value.toFixed(1) : Math.round(value).toString());
        }
      });
      return controls.stop;
    }
  }, [finalValue, inView]);

  return <span ref={ref}>{displayValue}{suffix}</span>;
}

const STATS = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    value: 500,
    suffix: '+',
    label: 'Étudiants satisfaits',
    color: '#1F6948',
    bg: '#E8F5EF',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    ),
    value: 50,
    suffix: '+',
    label: 'Professeurs certifiés',
    color: '#B8923A',
    bg: '#FEF3E2',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    value: 4.9,
    suffix: '/5',
    label: 'Note moyenne',
    color: '#7C3AED',
    bg: '#EDE9FE',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    value: 12,
    suffix: '+',
    label: 'Pays représentés',
    color: '#0891B2',
    bg: '#E0F2FE',
  },
];

export function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section className="py-8 md:py-12 px-4 md:px-6 bg-[#FDFBF6]" ref={ref}>
      <div className="max-w-[1100px] mx-auto">

        {/* ── Label ── */}
        <motion.div
          className="flex items-center justify-center mb-6 md:mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4C5A9] bg-white shadow-sm">
            <img src="/mascotte/logo_equran_accademy.png" alt="logo" className="w-5 h-5 object-contain" />
            <span className="text-[10px] md:text-[11px] font-bold text-[#B8923A] uppercase tracking-widest whitespace-nowrap">
              La confiance de notre communauté
            </span>
          </div>
        </motion.div>

        {/* ── Stats Cards Row ── */}
        <div className="grid grid-cols-4 gap-1.5 md:gap-5">
          {STATS.map((stat, idx) => (
            <motion.div
              key={idx}
              className="relative flex flex-col items-center justify-center text-center p-2 md:p-6 rounded-[12px] md:rounded-[24px] bg-white border border-[#F0EBE1] shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden min-h-[90px] md:min-h-auto"
              initial={{ opacity: 0, y: 35, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Decorative glow circle in corner */}
              <div
                className="absolute -top-4 -right-4 md:-top-6 md:-right-6 w-12 h-12 md:w-20 md:h-20 rounded-full opacity-10 blur-md md:blur-xl"
                style={{ background: stat.color }}
              />

              {/* Icon */}
              <div
                className="w-6 h-6 md:w-12 md:h-12 rounded-lg md:rounded-2xl flex items-center justify-center mb-1.5 md:mb-4"
                style={{ background: stat.bg, color: stat.color }}
              >
                <div className="scale-[0.6] md:scale-100">
                  {stat.icon}
                </div>
              </div>

              {/* Number */}
              <div
                className="text-[12px] md:text-[38px] font-extrabold leading-none mb-0.5 md:mb-2 tabular-nums"
                style={{ color: stat.color }}
              >
                <AnimatedNumber finalValue={stat.value} suffix={stat.suffix} />
              </div>

              {/* Label */}
              <p className="text-[7px] md:text-[13px] text-[#888888] font-medium leading-[1.1] md:leading-snug">
                {stat.label}
              </p>

              {/* Bottom accent line */}
              <div
                className="absolute bottom-0 left-0 w-full h-[3px] rounded-b-[24px]"
                style={{ background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)` }}
              />
            </motion.div>
          ))}
        </div>

        {/* ── Marquee Drapeaux Pays ── */}
        <div className="mt-12 md:mt-16 w-full overflow-hidden relative">
          {/* Fading edges */}
          <div className="absolute top-0 left-0 w-12 md:w-32 h-full bg-gradient-to-r from-[#FDFBF6] to-transparent z-10"></div>
          <div className="absolute top-0 right-0 w-12 md:w-32 h-full bg-gradient-to-l from-[#FDFBF6] to-transparent z-10"></div>

          <div className="flex w-fit animate-marquee hover:pause-animation">
            {/* Double the array for seamless infinite scroll */}
            {[...FLAGS, ...FLAGS, ...FLAGS].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-2 md:px-5 md:py-3 mx-2 bg-white rounded-full border border-[#F0EBE1] shadow-sm whitespace-nowrap group hover:border-[#1F6948] transition-colors cursor-default"
              >
                <span className="text-xl md:text-2xl group-hover:scale-110 transition-transform">{item.flag}</span>
                <span className="text-[11px] md:text-sm font-medium text-[#444444]">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .pause-animation {
          animation-play-state: paused;
        }
      `}} />
    </section>
  );
}
