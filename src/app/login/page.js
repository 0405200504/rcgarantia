'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || 'Não foi possível entrar.');
        return;
      }
      router.replace('/dashboard');
      router.refresh();
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-brand-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-2xl font-bold text-white shadow-card">
            RC
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">RC Garantia</h1>
          <p className="mt-1 text-sm text-slate-500">Painel da assistência técnica</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 sm:p-8">
          <h2 className="mb-6 text-lg font-semibold text-slate-900">Acessar painel</h2>

          {erro && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {erro}
            </div>
          )}

          <div className="mb-4">
            <label className="label" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="voce@assistencia.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="mb-6">
            <label className="label" htmlFor="senha">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              className="input"
              placeholder="••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="mt-5 rounded-lg bg-slate-50 px-3 py-2 text-center text-xs text-slate-500">
            Acesso padrão: <strong>admin@rcgarantia.com</strong> / senha <strong>123456</strong>
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          É cliente?{' '}
          <Link href="/consulta" className="font-medium text-brand-600 hover:text-brand-700">
            Consultar minha garantia
          </Link>
        </p>
      </div>
    </div>
  );
}
