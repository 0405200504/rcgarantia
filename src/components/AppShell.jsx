'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

// Ícones SVG inline (sem dependência)
function Icon({ name }) {
  const icons = {
    home: <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />,
    list: <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />,
    plus: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />,
    cog: <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />,
    logout: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />,
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-6 w-6">
      {icons[name]}
    </svg>
  );
}

const BOTTOM_NAV = [
  { href: '/dashboard', label: 'Início', icon: 'home' },
  { href: '/garantias', label: 'Garantias', icon: 'list' },
  { href: '/configuracoes', label: 'Config.', icon: 'cog' },
];

const SIDEBAR_NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: 'home' },
  { href: '/garantias', label: 'Garantias', icon: 'list' },
  { href: '/garantias/nova', label: 'Nova garantia', icon: 'plus' },
  { href: '/configuracoes', label: 'Configurações', icon: 'cog' },
];

export default function AppShell({ user, children }) {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href) {
    if (href === '/garantias') return pathname === '/garantias';
    return pathname === href || pathname.startsWith(href + '/');
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Sidebar desktop ── */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 lg:flex z-10">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white shadow-sm">
            RC
          </div>
          <span className="text-lg font-semibold text-slate-900">RC Garantia</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {SIDEBAR_NAV.map((item) => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive(item.href)
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className={isActive(item.href) ? 'text-brand-500' : 'text-slate-400'}>
                <Icon name={item.icon} />
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-slate-100 pt-4">
          <div className="mb-3 px-2">
            <p className="truncate text-sm font-medium text-slate-700">{user?.nome}</p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
          </div>
          <button onClick={logout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all">
            <span className="text-slate-400"><Icon name="logout" /></span>
            Sair
          </button>
        </div>
      </aside>

      {/* ── Conteúdo principal ── */}
      <div className="lg:ml-64">
        {/* Header mobile */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-sm lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">RC</div>
            <span className="font-semibold text-slate-900">RC Garantia</span>
          </div>
          <button onClick={logout} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <Icon name="logout" />
          </button>
        </header>

        {/* Página */}
        <main className="px-4 py-5 pb-28 sm:px-6 lg:px-8 lg:py-7 lg:pb-8">
          {children}
        </main>
      </div>

      {/* ── Bottom nav mobile (app-style) ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-sm lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="mx-auto flex max-w-md items-end">
          {BOTTOM_NAV.map((item) => (
            <Link key={item.href} href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
                isActive(item.href) ? 'text-brand-600' : 'text-slate-400'
              }`}>
              <span className={`transition-transform ${isActive(item.href) ? 'scale-110' : ''}`}>
                <Icon name={item.icon} />
              </span>
              <span className="font-medium">{item.label}</span>
              {isActive(item.href) && (
                <span className="mt-0.5 h-1 w-1 rounded-full bg-brand-500" />
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* ── FAB nova garantia (canto inferior direito) ── */}
      <Link href="/garantias/nova"
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl shadow-brand-300 transition-transform active:scale-90 lg:hidden"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-7 w-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </Link>
    </div>
  );
}
