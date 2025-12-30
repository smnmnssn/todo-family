"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import AuthField from "@/components/auth/AuthField";
import { Button } from "@/components/ui/button";

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();

  const [isLoading, setIsLoading] = useState(false);

  function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setEmailError(undefined);
    setPasswordError(undefined);
    setFormError(undefined);

    if (!isValidEmail(email)) {
      setEmailError("Måste vara en giltig emailadress");
      return;
    }

    if (password.length < 6) {
      setPasswordError("Lösenordet måste vara minst 6 tecken långt");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setFormError(data?.error ?? "Kunde inte skapa konto.");
        return;
      }

      const loginRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (loginRes?.error) {
        setFormError("Kontot skapades, men inloggningen misslyckades.");
        return;
      }

      router.push("/");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AuthField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        placeholder="namn@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
        errorMessage={emailError}
      />

      <AuthField
        id="password"
        label="Lösenord (minst 6 tecken)"
        type="password"
        autoComplete="new-password"
        minLength={6}
        required
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
        errorMessage={passwordError}
      />

      {formError ? <p className="text-sm text-red-200">{formError}</p> : null}

      <Button
        type="submit"
        className="mt-2 w-full bg-emerald-500 text-white hover:bg-emerald-400"
        disabled={isLoading}
      >
        {isLoading ? "Skapar konto..." : "Skapa konto"}
      </Button>
    </form>
  );
}
