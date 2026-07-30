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

  const { data: courseWithPromotion, error: promotionError } = await supabase
    .from("courses")
    .select(
      "id, price_cents, original_price_cents, promotion_enabled, promotion_text, promotion_days"
    )
    .eq("id", id)
    .single();
  const { data: legacyCourse } = promotionError
    ? await supabase.from("courses").select("id, price_cents").eq("id", id).single()
    : { data: null };
  const course = courseWithPromotion ??
    (legacyCourse
      ? {
          ...legacyCourse,
          promotion_enabled: true,
          promotion_text: "Condição especial",
          promotion_days: 7,
          original_price_cents: null,
        }
      : null);
  if (!course) notFound();

  const promotionControlAvailable = !promotionError;

  const isFree = course.price_cents === 0;

  return (
    <div>
      <h2 className="text-xl font-semibold text-text-primary">Precificação e ofertas</h2>
      <p className="mt-1 text-sm text-text-secondary">
        Defina o valor do seu produto e a estratégia de venda.
      </p>

      <form action={updateCoursePricing.bind(null, course.id)} className="mt-6 max-w-md">
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="original_price" className="text-sm font-medium text-text-primary">
                De (R$)
              </label>
              <input
                id="original_price"
                name="original_price"
                type="number"
                min="0"
                step="0.01"
                defaultValue={(course.original_price_cents ?? 0) / 100}
                className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="price" className="text-sm font-medium text-text-primary">
                Por (R$)
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
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-text-muted">
              O valor “De” aparece riscado. Deixe “Por” em 0 para oferecer gratuitamente.
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

          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background p-4">
            <input
              name="promotion_enabled"
              type="checkbox"
              defaultChecked={course.promotion_enabled}
              disabled={!promotionControlAvailable}
              className="mt-0.5 h-4 w-4 accent-primary"
            />
            <span>
              <span className="block text-sm font-medium text-text-primary">
                Ativar contagem regressiva
              </span>
              <span className="mt-1 block text-xs text-text-muted">
                Exibe o prazo e a condição especial neste curso para alunos que ainda não o possuem.
              </span>
            </span>
          </label>

          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_110px]">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="promotion_text" className="text-sm font-medium text-text-primary">
                Texto da oferta
              </label>
              <input
                id="promotion_text"
                name="promotion_text"
                type="text"
                maxLength={60}
                defaultValue={course.promotion_text}
                disabled={!promotionControlAvailable}
                className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary disabled:opacity-50 focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="promotion_days" className="text-sm font-medium text-text-primary">
                Dias
              </label>
              <input
                id="promotion_days"
                name="promotion_days"
                type="number"
                min="1"
                max="365"
                defaultValue={course.promotion_days}
                disabled={!promotionControlAvailable}
                className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary disabled:opacity-50 focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {!promotionControlAvailable && (
            <p className="mt-2 text-xs text-text-muted">
              A contagem permanece ativa. O botão ficará disponível assim que a atualização do banco for concluída.
            </p>
          )}

          <Button type="submit" className="mt-5 w-fit">
            Salvar
          </Button>
        </div>
      </form>
    </div>
  );
}
