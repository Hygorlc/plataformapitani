import { PromotionTimer } from "@/components/course/PromotionCountdown";

const VIDEO_ID = "RLBZNpJHjpI";

export function HeroVideo({ promotionEndsAt }: { promotionEndsAt: string | null }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden bg-black md:aspect-[5/2]">
      <iframe
        className="hero-video-reveal pointer-events-none absolute left-1/2 top-1/2 aspect-video h-auto w-full -translate-x-1/2 -translate-y-1/2"
        src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0&disablekb=1&fs=0&iv_load_policy=3&rel=0&modestbranding=1&playsinline=1`}
        title="Vídeo em destaque"
        allow="autoplay; encrypted-media"
        referrerPolicy="strict-origin-when-cross-origin"
        tabIndex={-1}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.78)_100%)] shadow-[inset_0_0_70px_18px_rgba(0,0,0,0.55)]"
      />
      <div className="absolute bottom-5 left-5 z-10 flex flex-col items-start gap-2 md:bottom-8 md:left-10">
        <p className="text-2xl font-bold tracking-wide text-white drop-shadow-lg md:text-4xl">
          IPL
        </p>
        {promotionEndsAt && <PromotionTimer endAt={promotionEndsAt} />}
      </div>
    </div>
  );
}
