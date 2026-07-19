import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateCoursePricing } from "@/lib/actions/admin/courses";
import { Button } from "@/components/ui/Button";

export default async function CoursePricingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, price_cents")
    .eq("id", id)
    .single();
  if (!course) notFound();

  const isFree = course.price_cents === 0;

  return (
    <div>
      <h2 className="text-xl font-semibold text-text-primary">Precificação e ofertas</h2>
      <p className="mt-1 text-sm text-text-secondary">
        Defina o valor do seu produto e a estratégia de venda.
      </p>

      <form action={updateCoursePricing.bind(null, course.id)} className="mt-6 max-w-md">
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="price" className="text-sm font-medium text-text-primary">
              Preço (R$)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={course.price_cents / 100}
              className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            />
            <span className="text-xs text-text-muted">
              Deixe 0 para oferecer o curso gratuitamente.
            </span>
          </div>

          <div className="mt-4 rounded-lg border border-border bg-background p-4">
            <p className="text-sm font-medium text-text-primary">
              Forma de pagamento atual
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              {isFree
                ? "Curso gratuito — o aluno se matricula na hora, sem checkout."
                : "Curso pago — o aluno é levado ao checkout do Stripe para concluir a compra."}
            </p>
          </div>

          <Button type="submit" className="mt-5 w-fit">
            Salvar
          </Button>
        </div>
      </form>
    </div>
  );
}
