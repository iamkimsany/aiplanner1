'use client';

import { useRouter } from 'next/navigation';

const ROUTES = ['/', '/energy', '/tasks', '/overview', '/end'];

interface NavigationDotsProps {
  total: number;
  current: number; // 0-indexed
}

export default function NavigationDots({ total, current }: NavigationDotsProps) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-2 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => router.push(ROUTES[i] ?? '/')}
          aria-label={`Go to screen ${i + 1}`}
          style={{
            width:        i === current ? '18px' : '6px',
            height:       '6px',
            borderRadius: i === current ? '3px' : '50%',
            background:   i === current ? 'var(--color-purple)' : 'var(--color-border-medium)',
            transition:   'width 0.2s ease, border-radius 0.2s ease',
            border:       'none',
            padding:      0,
            cursor:       'pointer',
            flexShrink:   0,
          }}
        />
      ))}
    </div>
  );
}
