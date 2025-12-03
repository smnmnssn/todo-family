'use client';

import { signOut } from 'next-auth/react';

export function LogoutButton() {
  async function handleLogout() {
    await signOut({
      callbackUrl: '/login', // vart man hamnar efter logout
    });
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-red-600 hover:underline"
      type="button"
    >
      Logga ut
    </button>
  );
}
