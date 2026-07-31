import { createClient } from "@/lib/supabase/server";
import { saveHomeHeroSettings } from "@/lib/actions/admin/settings";
import { Button } from "@/components/ui/Button";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("platform_settings")
    .select("home_hero_mode, home_video_url, home_carousel_slides")
    .eq("id", "main")
    .maybeSingle();
  const settings = data ?? {
    home_hero_mode: "video",
    home_video_url: "https://www.youtube.com/watch?v=RLBZNpJHjpI",
    home_carousel_slides: [],
  };
  const settingItems = Array.isArray(settings.home_carousel_slides)
    ? settings.home_carousel_slides
    : [];
  const supportWhatsappNumber = settingItems.find(
    (item) =>
      item &&
      typeof item === "object" &&
      !Array.isArray(item) &&
      (item as Record<string, unknown>).kind === "support"
  );
  const whatsappNumber =
    supportWhatsappNumber && typeof supportWhatsappNumber === "object"
      ? String((supportWhatsappNumber as Record<string, unknown>).whatsappNumber ?? "")
      : "";
  const slides = Array.isArray(settings.home_carousel_slides)
    ? settings.home_carousel_slides
        .map((slide) => {
          if (!slide || typeof slide !== "object" || Array.isArray(slide)) return "";
          const item = slide as Record<string, unknown>;
          return [item.imageUrl, item.title, item.subtitle]
            .filter((value) => typeof value === "string" && value)
            .join(" | ");
        })
        .filter(Boolean)
        .join("\n")
    : "";

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-primary">Configurações</h1>
      <p className="mt-1 text-text-secondary">
        Escolha o conteúdo de destaque exibido no topo da página principal.
      </p>

      <form action={saveHomeHeroSettings} className="mt-6 max-w-3xl rounded-xl border border-border bg-surface p-5">
        <h2 className="text-lg font-semibold text-text-primary">Destaque da página principal</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background p-4">
            <input
              type="radio"
              name="home_hero_mode"
              value="video"
              defaultChecked={settings.home_hero_mode !== "carousel"}
              className="accent-primary"
            />
            <span className="font-medium text-text-primary">Exibir vídeo</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background p-4">
            <input
              type="radio"
              name="home_hero_mode"
              value="carousel"
              defaultChecked={settings.home_hero_mode === "carousel"}
              className="accent-primary"
            />
            <span className="font-medium text-text-primary">Exibir carrossel</span>
          </label>
        </div>

        <div className="mt-5 flex flex-col gap-1.5">
          <label htmlFor="home_video_url" className="text-sm font-medium text-text-primary">
            Link do vídeo do YouTube
          </label>
          <input
            id="home_video_url"
            name="home_video_url"
            type="url"
            defaultValue={settings.home_video_url}
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
          />
        </div>

        <div className="mt-5 flex flex-col gap-1.5">
          <label htmlFor="home_carousel_slides" className="text-sm font-medium text-text-primary">
            Imagens do carrossel
          </label>
          <textarea
            id="home_carousel_slides"
            name="home_carousel_slides"
            rows={7}
            defaultValue={slides}
            placeholder={"Uma imagem por linha:\nhttps://site.com/imagem.jpg | Título | Subtítulo"}
            className="resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
          />
          <span className="text-xs text-text-muted">
            Use uma linha para cada slide: link da imagem | título | subtítulo. Máximo de 10 slides.
          </span>
        </div>

        <Button type="submit" className="mt-5">
          Salvar destaque
        </Button>
      </form>

      <form action={saveHomeHeroSettings} className="mt-6 max-w-3xl rounded-xl border border-border bg-surface p-5">
        <input type="hidden" name="settings_section" value="whatsapp" />
        <h2 className="text-lg font-semibold text-text-primary">Recuperação de senha</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Informe o WhatsApp da empresa que receberá os pedidos dos alunos.
        </p>
        <div className="mt-4 flex flex-col gap-1.5">
          <label htmlFor="support_whatsapp_number" className="text-sm font-medium text-text-primary">
            WhatsApp da empresa
          </label>
          <input
            id="support_whatsapp_number"
            name="support_whatsapp_number"
            type="tel"
            defaultValue={whatsappNumber}
            placeholder="Ex.: 5551999999999"
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
          />
          <span className="text-xs text-text-muted">
            Use o código do país e o DDD. Exemplo: 55 + DDD + número.
          </span>
        </div>
        <Button type="submit" className="mt-5">Salvar WhatsApp</Button>
      </form>
    </div>
  );
}
