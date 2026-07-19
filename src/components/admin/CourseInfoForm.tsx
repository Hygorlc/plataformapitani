"use client";

import { useState } from "react";
import { ImageDropzone } from "@/components/admin/ImageDropzone";
import { Button } from "@/components/ui/Button";
import {
  COURSE_CATEGORIES,
  COURSE_LANGUAGES,
  COURSE_COUNTRIES,
} from "@/lib/constants/courseOptions";

interface CourseInfo {
  title: string;
  description: string | null;
  language: string | null;
  sales_country: string | null;
  category: string | null;
  instructor_name: string | null;
  thumbnail_url: string | null;
}

export function CourseInfoForm({ course }: { course: CourseInfo }) {
  const [description, setDescription] = useState(course.description ?? "");
  const [category, setCategory] = useState(course.category ?? "");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-medium text-text-primary">
          Nome do produto
        </label>
        <input
          id="title"
          name="title"
          defaultValue={course.title}
          required
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
            defaultValue={course.language ?? ""}
            className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
          >
            <option value="">Qual o idioma do seu produto?</option>
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
            defaultValue={course.sales_country ?? ""}
            className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
          >
            <option value="">Em qual país você quer vender?</option>
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
          defaultValue={course.instructor_name ?? ""}
          placeholder="Nome de quem ministra o curso"
          className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-text-primary">Imagem do seu produto</span>
        <ImageDropzone name="image" currentUrl={course.thumbnail_url} />
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

      <Button type="submit" className="w-fit">
        Salvar
      </Button>
    </div>
  );
}
