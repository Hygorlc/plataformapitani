import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <GraduationCap className="text-primary" size={26} />
          <span className="text-lg font-semibold text-text-primary">
            Pitani <span className="font-normal text-text-secondary">Academy</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost">Entrar</Button>
          </Link>
          <Link href="/signup">
            <Button variant="primary">Criar conta</Button>
          </Link>
        </div>
      </header>

      <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-8 py-24 text-center">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_var(--primary)_0%,_transparent_65%)] opacity-[0.12]" />

        <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
          Aprenda no seu ritmo com a{" "}
          <span className="bg-gradient-to-r from-primary-light via-primary to-primary-hover bg-clip-text text-transparent">
            Pitani Academy
          </span>
        </h1>
        <p className="mt-4 max-w-xl text-lg text-text-secondary">
          Cursos, mentorias e uma comunidade para acompanhar sua evolução do
          início ao certificado.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="/signup">
            <Button variant="primary" size="md">
              Começar agora
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="md">
              Já tenho conta
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
