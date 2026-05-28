'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/app', label: '오늘' },
  { href: '/tasks', label: '할 일 관리' },
  { href: '/calendar', label: '달력' },
];

export default function Navbar() {
  const path = usePathname();
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 flex items-center gap-1 h-14">
        <Link href="/" className="font-bold text-indigo-600 text-lg mr-4 tracking-tight hover:text-indigo-800 transition-colors">
          플래너
        </Link>
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              path === href
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
