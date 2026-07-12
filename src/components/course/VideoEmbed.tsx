import { normalizeVideoUrl } from "@/lib/utils/embed";

export function VideoEmbed({ url, title }: { url: string; title: string }) {
  const src = normalizeVideoUrl(url);

  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
      <iframe
        src={src}
        title={title}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
