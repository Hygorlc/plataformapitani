import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_var(--primary)_0%,_transparent_65%)] opacity-[0.1]" />

      <Link href="/" className="mb-8 flex items-center gap-2">
        <GraduationCap className="text-primary" size={26} />
        <span className="text-lg font-semibold text-text-primary">
          Pitani <span className="font-normal text-text-secondary">Academy</span>
        </span>
      </Link>

      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface/90 p-8 backdrop-blur-sm">
        <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
        <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>

        <div className="mt-6">{children}</div>

        <div className="mt-6 text-center text-sm text-text-secondary">
          {footer}
        </div>
      </div>
    </div>
  );
}
