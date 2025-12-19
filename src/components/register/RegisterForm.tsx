'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? 'Kunde inte skapa konto.');
        return;
      }

      const loginRes = await signIn('credentials', {
        redirect: false,
        callbackUrl: '/',
        mode: 'login',
        email,
        password,
      });

      if (loginRes?.error) {
        setError('Kontot skapades, men inloggningen misslyckades. Försök logga in.');
        router.push('/login');
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('Något gick fel. Försök igen.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-sm mx-auto">
      <h1 className="text-xl font-semibold mb-4">Skapa konto</h1>

      <input
        type="email"
        placeholder="Email"
        className="block w-full border p-2 mb-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
      />

      <input
        type="password"
        placeholder="Lösenord (minst 6 tecken)"
        className="block w-full border p-2 mb-4"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
      />

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded"
        disabled={isLoading}
      >
        {isLoading ? 'Skapar konto...' : 'Skapa konto'}
      </button>
    </form>
  );
}
