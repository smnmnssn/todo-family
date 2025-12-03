'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError(null);

    // signIn används även för register när vi skickar mode: 'register'
    const result = await signIn('credentials', {
      redirect: true,
      callbackUrl: '/',   // vart man hamnar efter register
      mode: 'register',   // viktigt!
      email,
      password,
    });

    // NextAuth returnerar null när redirect: true används
    // så vi hanterar bara fel vid redirect: false

    if (result?.error) {
      setError('Kunde inte skapa konto. Användaren finns kanske redan?');
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
      />

      <input
        type="password"
        placeholder="Lösenord (minst 6 tecken)"
        className="block w-full border p-2 mb-4"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && (
        <p className="text-red-600 text-sm mb-3">{error}</p>
      )}

      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded"
      >
        Skapa konto
      </button>
    </form>
  );
}
