import { createCourse } from "@/lib/actions/admin/courses";
import { Button } from "@/components/ui/Button";

export default function NewCoursePage() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold text-text-primary">Adicionar Novo Curso</h1>
      <p className="mt-1 text-text-secondary">
        O curso será criado como rascunho. Publique quando estiver pronto.
      </p>

      <form action={createCourse} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className="text-sm text-text-secondary">
            Título
          </label>
          <input
            id="title"
            name="title"
            required
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="text-sm text-text-secondary">
            Descrição
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="instructor_name" className="text-sm text-text-secondary">
            Instrutor
          </label>
          <input
            id="instructor_name"
            name="instructor_name"
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="price" className="text-sm text-text-secondary">
            Preço (R$) — deixe 0 para curso gratuito
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={0}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
          />
        </div>

        <Button type="submit" className="mt-2 w-fit">
          Criar Curso
        </Button>
      </form>
    </div>
  );
}
