"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Check, MonitorPlay } from "lucide-react";
import { createCourseWizard } from "@/lib/actions/admin/courses";
import { ImageDropzone } from "@/components/admin/ImageDropzone";
import { Button } from "@/components/ui/Button";
import {
  COURSE_CATEGORIES,
  COURSE_LANGUAGES,
  COURSE_COUNTRIES,
} from "@/lib/constants/courseOptions";

const STEPS = [
  { key: "formato", label: "Formato", description: "Escolha o formato do produto" },
  { key: "informacoes", label: "Informações", description: "Descreva seu produto" },
  {
    key: "precificacao",
    label: "Precificação",
    description: "Defina o valor e a estratégia de venda",
  },
] as const;

export function CourseWizard() {
  const [step, setStep] = useState(0);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function next() {
    if (step === 1 && !title.trim()) {
      setError("O nome do produto é obrigatório.");
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function prev() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await createCourseWizard(formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao criar o curso.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-10 lg:flex-row">
      <aside className="w-full shrink-0 lg:w-72">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-sm text-text-secondary">Formato do produto:</p>
          <p className="text-lg font-semibold text-text-primary">Curso Online</p>
        </div>

        <ol className="mt-6 flex flex-col gap-6">
          {STEPS.map((s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <li key={s.key} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    done
                      ? "bg-primary/20 text-primary"
                      : active
                        ? "bg-primary text-background"
                        : "border border-border text-text-muted"
                  }`}
                >
                  {done ? <Check size={13} /> : i + 1}
                </span>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      active ? "text-text-primary" : "text-text-secondary"
                    }`}
                  >
                    {s.label}
                  </p>
                  {active && <p className="text-xs text-text-muted">{s.description}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      </aside>

      <form action={handleSubmit} className="min-w-0 flex-1">
        {/* Etapa 1: Formato */}
        <div className={step === 0 ? "" : "hidden"}>
          <h1 className="text-3xl font-semibold text-text-primary">Formato do produto</h1>
          <p className="mt-2 text-text-secondary">
            Escolha o formato do produto que você quer criar.
          </p>

          <div className="mt-8 flex w-full max-w-sm items-center gap-4 rounded-xl border-2 border-primary bg-surface p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <MonitorPlay size={24} />
            </div>
            <div>
              <p className="font-semibold text-text-primary">Curso Online</p>
              <p className="text-sm text-text-secondary">
                Aulas em vídeo organizadas em módulos.
              </p>
            </div>
            <Check size={20} className="ml-auto shrink-0 text-primary" />
          </div>
        </div>

        {/* Etapa 2: Informações básicas */}
        <div className={step === 1 ? "" : "hidden"}>
          <h1 className="text-3xl font-semibold text-text-primary">Informações básicas</h1>
          <p className="mt-2 text-text-secondary">
            Os dados abaixo são muito importantes para seu produto. Preencha-os com atenção.
          </p>

          <div className="mt-8 flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="title" className="text-sm font-medium text-text-primary">
                Nome do produto
              </label>
              <input
                id="title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Escolha um nome que chame a atenção de seus compradores"
                className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
              />
              <span className="text-xs text-text-muted">
                Esse nome será exibido em todos os locais da plataforma.
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="description" className="text-sm font-medium text-text-primary">
                  Descrição
                </label>
                <span className="rounded-full border border-primary/40 px-2 py-0.5 text-xs text-primary">
                  {description.length}/2000
                </span>
              </div>
              <textarea
                id="description"
                name="description"
                rows={5}
                maxLength={2000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Fale do que se trata seu produto e o que ele oferece, de forma clara e breve."
                className="resize-none rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
              />
              <span className="text-xs text-text-muted">
                Esta é a descrição do seu produto para seus compradores.
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="language" className="text-sm font-medium text-text-primary">
                  Idioma do produto
                </label>
                <select
                  id="language"
                  name="language"
                  defaultValue=""
                  className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                >
                  <option value="" disabled>
                    Qual o idioma do seu produto?
                  </option>
                  {COURSE_LANGUAGES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-text-muted">Exibido no momento da compra.</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="sales_country" className="text-sm font-medium text-text-primary">
                  Principal país para vendas
                </label>
                <select
                  id="sales_country"
                  name="sales_country"
                  defaultValue=""
                  className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                >
                  <option value="" disabled>
                    Em qual país você quer vender?
                  </option>
                  {COURSE_COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-text-muted">
                  Você também poderá vender para outros países.
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="instructor_name" className="text-sm font-medium text-text-primary">
                Instrutor
              </label>
              <input
                id="instructor_name"
                name="instructor_name"
                placeholder="Nome de quem ministra o curso"
                className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-text-primary">Imagem do seu produto</span>
              <ImageDropzone name="image" />
            </div>

            <div>
              <span className="text-sm font-medium text-text-primary">Categoria do produto</span>
              <p className="mt-1 text-xs text-text-muted">
                É através dela que seus compradores encontrarão seu produto mais facilmente.
              </p>
              <input type="hidden" name="category" value={category} />
              <div className="mt-3 flex flex-wrap gap-2">
                {COURSE_CATEGORIES.map((cat) => {
                  const selected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(selected ? "" : cat)}
                      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                        selected
                          ? "border-primary bg-primary/15 font-medium text-primary"
                          : "border-border text-text-secondary hover:border-text-muted hover:text-text-primary"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Etapa 3: Precificação */}
        <div className={step === 2 ? "" : "hidden"}>
          <h1 className="text-3xl font-semibold text-text-primary">Precificação</h1>
          <p className="mt-2 text-text-secondary">
            Defina o valor do seu produto. Deixe 0 para oferecê-lo gratuitamente.
          </p>

          <div className="mt-8 flex max-w-xs flex-col gap-1.5">
            <label htmlFor="price" className="text-sm font-medium text-text-primary">
              Preço (R$)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={0}
              className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            />
            <span className="text-xs text-text-muted">
              Cursos pagos usam o checkout do Stripe. Cursos gratuitos liberam acesso na hora.
            </span>
          </div>
        </div>

        {error && <p className="mt-6 text-sm text-status-danger">{error}</p>}

        <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={prev}
            disabled={step === 0 || pending}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Anterior
          </Button>

          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={next} className="flex items-center gap-2">
              Próximo <ArrowRight size={16} />
            </Button>
          ) : (
            <Button type="submit" disabled={pending} className="flex items-center gap-2">
              {pending ? "Criando..." : "Criar Curso"} <Check size={16} />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
