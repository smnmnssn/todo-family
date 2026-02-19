"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import AuthField from "@/components/auth/AuthField";
import { Button } from "@/components/ui/button";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();

  const [isLoading, setIsLoading] = useState(false);

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
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setFormError("Fel email eller lösenord");
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
        label="Lösenord"
        type="password"
        autoComplete="current-password"
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
        className="mt-2 w-full bg-sky-500 text-white hover:bg-sky-400"
        disabled={isLoading}
      >
        {isLoading ? "Loggar in..." : "Logga in"}
      </Button>
    </form>
  );
}
