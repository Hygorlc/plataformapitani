const VIDEO_ID = "RLBZNpJHjpI";

export function HeroVideo() {
  return (
    <div className="relative mx-auto aspect-video w-full overflow-hidden bg-black lg:w-[92%]">
      <iframe
        className="absolute inset-0 h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0&rel=0&modestbranding=1&playsinline=1`}
        title="Vídeo em destaque"
        allow="autoplay; encrypted-media; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}
