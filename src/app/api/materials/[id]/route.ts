import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const admin = createAdminClient();
  const [{ data: material }, { data: profile }] = await Promise.all([
    admin
      .from("lesson_materials")
      .select("course_id, storage_path")
      .eq("id", id)
      .maybeSingle(),
    admin.from("profiles").select("role").eq("id", user.id).maybeSingle(),
  ]);

  if (!material) {
    return NextResponse.json({ error: "Material não encontrado." }, { status: 404 });
  }

  if (profile?.role !== "admin") {
    const { data: enrollment } = await admin
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", material.course_id)
      .eq("status", "active")
      .maybeSingle();

    if (!enrollment) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }
  }

  const { data, error } = await admin.storage
    .from("lesson-materials")
    .createSignedUrl(material.storage_path, 60);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Arquivo indisponível." }, { status: 404 });
  }

  return NextResponse.redirect(data.signedUrl, 307);
}
