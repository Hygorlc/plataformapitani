import { createClient } from "@/lib/supabase/server";
import { CopyButton } from "@/components/admin/CopyButton";

export default async function CourseLinksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("slug, status")
    .eq("id", id)
    .single();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const salesUrl = `${siteUrl}/courses/${course?.slug ?? ""}`;
  const checkoutUrl = `${siteUrl}/courses/${course?.slug ?? ""}?comprar=1`;

  const links = [
    {
      label: "Página do produto",
      description: "Link para a página de apresentação do curso.",
      url: salesUrl,
    },
    {
      label: "Link direto de compra",
      description: "Leva o aluno direto para a matrícula ou checkout.",
      url: checkoutUrl,
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-text-primary">Links de divulgação</h2>
      <p className="mt-1 text-sm text-text-secondary">
        Use estes links para divulgar seu curso nas redes sociais, e-mail ou anúncios.
      </p>

      {course?.status !== "published" && (
        <p className="mt-4 rounded-lg border border-status-progress/40 bg-status-progress/10 px-4 py-3 text-sm text-status-progress">
          Este curso ainda está como rascunho. Publique-o para que os links fiquem
          acessíveis aos alunos.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {links.map((link) => (
          <div key={link.label} className="rounded-xl border border-border bg-surface p-5">
            <p className="font-medium text-text-primary">{link.label}</p>
            <p className="mt-0.5 text-xs text-text-muted">{link.description}</p>
            <div className="mt-3 flex items-center gap-2">
              <input
                readOnly
                value={link.url}
                className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-secondary"
              />
              <CopyButton value={link.url} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
