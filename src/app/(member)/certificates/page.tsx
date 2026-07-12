import { redirect } from "next/navigation";
import { Award } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function CertificatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: certificates } = await supabase
    .from("certificates")
    .select("id, certificate_number, issued_at, course_id, courses(title)")
    .eq("user_id", user.id)
    .order("issued_at", { ascending: false });

  return (
    <div className="px-6 py-8 lg:px-12">
      <h1 className="text-2xl font-semibold text-text-primary">Certificados</h1>
      <p className="mt-1 text-text-secondary">
        Certificados emitidos pelos cursos concluídos.
      </p>

      {!certificates || certificates.length === 0 ? (
        <p className="mt-8 text-text-secondary">
          Conclua todas as aulas de um curso para receber seu certificado aqui.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="flex items-start gap-4 rounded-xl border border-border bg-surface p-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-status-completed/15 text-status-completed">
                <Award size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">
                  {(cert.courses as unknown as { title: string } | null)?.title ?? "Curso"}
                </h3>
                <p className="mt-1 text-xs text-text-muted">{cert.certificate_number}</p>
                <p className="text-xs text-text-muted">
                  Emitido em {new Date(cert.issued_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
