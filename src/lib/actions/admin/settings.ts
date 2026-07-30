"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function saveHomeHeroSettings(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") throw new Error("Acesso não autorizado.");

  const mode = formData.get("home_hero_mode") === "carousel" ? "carousel" : "video";
  const videoUrl =
    String(formData.get("home_video_url") ?? "").trim() ||
    "https://www.youtube.com/watch?v=RLBZNpJHjpI";
  const slides = String(formData.get("home_carousel_slides") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 10)
    .map((line) => {
      const [imageUrl, title = "", subtitle = ""] = line
        .split("|")
        .map((part) => part.trim());
      return { imageUrl, title, subtitle };
    })
    .filter((slide) => /^https?:\/\//i.test(slide.imageUrl));

  if (mode === "carousel" && slides.length === 0) {
    throw new Error("Adicione pelo menos uma imagem válida para o carrossel.");
  }

  const admin = createAdminClient();
  const { error } = await admin.from("platform_settings").upsert({
    id: "main",
    home_hero_mode: mode,
    home_video_url: videoUrl,
    home_carousel_slides: slides,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/settings");
  revalidatePath("/catalog");
}
