// src/components/auth/AuthCard.tsx
import Link from "next/link";

type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkHref: string;
  footerLinkLabel: string;
};

export default function AuthCard({
  title,
  description,
  children,
  footerText,
  footerLinkHref,
  footerLinkLabel,
}: Props) {
  return (
    <section className="w-full max-w-sm">
      <div className="glass-panel glass-panel--strong p-8">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 text-sm text-white/70">{description}</p>
          ) : null}
        </header>

        {children}

        <div className="mt-6 text-center text-sm text-white/70">
          {footerText}{" "}
          <Link
            href={footerLinkHref}
            className="font-medium text-white underline underline-offset-4 hover:text-white"
          >
            {footerLinkLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
