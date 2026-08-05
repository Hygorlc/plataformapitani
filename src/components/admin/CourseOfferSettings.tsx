"use client";

import { useState } from "react";
import { updateCoursePricing } from "@/lib/actions/admin/courses";
import { Button } from "@/components/ui/Button";

export interface OfferCourse {
  id: string;
  title: string;
  price_cents: number;
  original_price_cents: number | null;
  promotion_enabled: boolean;
  promotion_text: string;
  promotion_days: number;
}

export function CourseOfferSettings({ courses }: { courses: OfferCourse[] }) {
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id ?? "");
  const selectedCourse =
    courses.find((course) => course.id === selectedCourseId) ?? courses[0];

  if (!selectedCourse) return null;

  const isFree = selectedCourse.price_cents === 0;

  return (
    <section
      id="course-offer-settings"
      className="mt-6 rounded-xl border border-border bg-surface p-5"
    >
      <h2 className="text-lg font-semibold text-text-primary">
        Oferta e contagem da capa
      </h2>
      <p className="mt-1 text-sm text-text-secondary">
        Escolha o curso e defina os valores e a contagem exibidos para alunos que
        ainda não possuem o produto.
      </p>

      <div className="mt-4 max-w-xl">
        <label htmlFor="offer-course" className="text-sm font-medium text-text-primary">
          Curso
        </label>
        <select
          id="offer-course"
          value={selectedCourse.id}
          onChange={(event) => setSelectedCourseId(event.target.value)}
          className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
        >
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      <form
        key={selectedCourse.id}
        action={updateCoursePricing.bind(null, selectedCourse.id)}
        className="mt-4 max-w-xl rounded-xl border border-border bg-background p-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`original-price-${selectedCourse.id}`} className="text-sm font-medium text-text-primary">
              De (R$)
            </label>
            <input
              id={`original-price-${selectedCourse.id}`}
              name="original_price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={(selectedCourse.original_price_cents ?? 0) / 100}
              className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`price-${selectedCourse.id}`} className="text-sm font-medium text-text-primary">
              Por (R$)
            </label>
            <input
              id={`price-${selectedCourse.id}`}
              name="price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={selectedCourse.price_cents / 100}
              className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            />
          </div>
        </div>
        <p className="mt-1.5 text-xs text-text-muted">
          O valor “De” aparece riscado. Deixe “Por” em 0 para oferecer gratuitamente.
        </p>

        <div className="mt-4 rounded-lg border border-border bg-surface p-4">
          <p className="text-sm font-medium text-text-primary">Forma de pagamento atual</p>
          <p className="mt-1 text-sm text-text-secondary">
            {isFree
              ? "Curso gratuito — o aluno se matricula na hora, sem checkout."
              : "Curso pago — o aluno é levado ao checkout do Stripe para concluir a compra."}
          </p>
        </div>

        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface p-4">
          <input
            name="promotion_enabled"
            type="checkbox"
            defaultChecked={selectedCourse.promotion_enabled}
            className="mt-0.5 h-4 w-4 accent-primary"
          />
          <span>
            <span className="block text-sm font-medium text-text-primary">
              Ativar contagem regressiva na capa
            </span>
            <span className="mt-1 block text-xs text-text-muted">
              Desmarque para ocultar a contagem deste curso.
            </span>
          </span>
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_110px]">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`promotion-text-${selectedCourse.id}`} className="text-sm font-medium text-text-primary">
              Texto da oferta
            </label>
            <input
              id={`promotion-text-${selectedCourse.id}`}
              name="promotion_text"
              type="text"
              maxLength={60}
              defaultValue={selectedCourse.promotion_text}
              className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`promotion-days-${selectedCourse.id}`} className="text-sm font-medium text-text-primary">
              Dias
            </label>
            <input
              id={`promotion-days-${selectedCourse.id}`}
              name="promotion_days"
              type="number"
              min="1"
              max="365"
              defaultValue={selectedCourse.promotion_days}
              className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <Button type="submit" className="mt-5">
          Salvar oferta do curso
        </Button>
      </form>
    </section>
  );
}
