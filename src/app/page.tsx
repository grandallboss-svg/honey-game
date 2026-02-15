'use client';

import dynamic from 'next/dynamic';

// Динамический импорт для избежания SSR проблем с framer-motion
const HoneyGame = dynamic(
  () => import('@/components/game/HoneyGame').then((mod) => mod.HoneyGame),
  { ssr: false }
);

export default function Home() {
  return <HoneyGame />;
}
