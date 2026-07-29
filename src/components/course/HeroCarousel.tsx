const VIDEO_ID = "RLBZNpJHjpI";

export function HeroVideo() {
  return (
    <div className="relative aspect-video w-full overflow-hidden bg-black md:aspect-[21/9]">
      <iframe
        className="pointer-events-none absolute left-1/2 top-1/2 aspect-video h-auto w-full -translate-x-1/2 -translate-y-1/2"
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
    </div>
  );
}
