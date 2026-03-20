'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function HomeButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/') return null;

  return (
    <button
      onClick={() => router.push('/')}
      title="Go back home"
      className="fixed top-4 left-4 z-50 px-4 h-12 rounded-full bg-white/30 hover:bg-white/45 backdrop-blur-sm text-xl flex items-center gap-1 transition-all duration-150 hover:scale-105 active:scale-95 shadow-lg font-black"
    >
      🔙🧙‍♂️
    </button>
  );
}
