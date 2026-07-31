"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PromotionTimer } from "@/components/course/PromotionCountdown";

export interface HeroSlide {
  imageUrl: string;
  title: string;
  subtitle: string;
}

function getYoutubeId(url: string) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return match?.[1] ?? "RLBZNpJHjpI";
}

export function HeroMedia({
  mode,
  videoUrl,
  slides,
  promotionEndsAt,
  originalPriceCents,
  priceCents,
  offerTitle,
  offerHref,
}: {
  mode: "video" | "carousel";
  videoUrl: string;
  slides: HeroSlide[];
  promotionEndsAt: string | null;
  originalPriceCents: number | null;
  priceCents: number | null;
  offerTitle: string;
  offerHref: string | null;
}) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (mode !== "carousel" || slides.length < 2) return;
    const interval = window.setInterval(
      () => setActiveSlide((current) => (current + 1) % slides.length),
      6000
    );
    return () => window.clearInterval(interval);
  }, [mode, slides.length]);

  const videoId = getYoutubeId(videoUrl);
  const validSlides = slides.filter((slide) => slide.imageUrl);
  const formatPrice = (value: number) =>
    (value / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-black md:aspect-[5/2]">
      {mode === "carousel" && validSlides.length > 0 ? (
        <>
          {validSlides.map((slide, index) => (
            <div
              key={`${slide.imageUrl}-${index}`}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                index === activeSlide ? "opacity-100" : "opacity-0"
              }`}
              style={{ backgroundImage: `url("${slide.imageUrl.replaceAll('"', "%22")}")` }}
            >
              {(slide.title || slide.subtitle) && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent px-6 pb-14 pt-24 md:px-12">
                  {slide.title && (
                    <h2 className="text-2xl font-bold text-white md:text-4xl">{slide.title}</h2>
                  )}
                  {slide.subtitle && (
                    <p className="mt-2 max-w-2xl text-sm text-white/80 md:text-lg">
                      {slide.subtitle}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
          {validSlides.length > 1 && (
            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
              {validSlides.map((slide, index) => (
                <button
                  key={`${slide.imageUrl}-dot-${index}`}
                  type="button"
                  aria-label={`Ir para slide ${index + 1}`}
                  onClick={() => setActiveSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === activeSlide ? "w-7 bg-primary" : "w-2 bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <iframe
          className="hero-video-reveal pointer-events-none absolute left-1/2 top-1/2 aspect-video h-auto w-full -translate-x-1/2 -translate-y-1/2"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&disablekb=1&fs=0&iv_load_policy=3&rel=0&modestbranding=1&playsinline=1`}
          title="Vídeo em destaque"
          allow="autoplay; encrypted-media"
          referrerPolicy="strict-origin-when-cross-origin"
          tabIndex={-1}
        />
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.78)_100%)] shadow-[inset_0_0_70px_18px_rgba(0,0,0,0.55)]"
      />
      {mode !== "carousel" && (
        <div className="absolute bottom-5 left-5 z-10 flex flex-col items-start gap-2 md:bottom-8 md:left-10">
          <p className="text-2xl font-bold tracking-wide text-white drop-shadow-lg md:text-4xl">
            {offerTitle}
          </p>
          {promotionEndsAt && <PromotionTimer endAt={promotionEndsAt} />}
          {priceCents !== null && priceCents > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-md bg-black/75 px-3 py-1.5 text-sm font-semibold shadow-lg backdrop-blur-sm md:text-base">
                {originalPriceCents !== null && originalPriceCents > priceCents && (
                  <span className="text-white/65 line-through">
                    De {formatPrice(originalPriceCents)}
                  </span>
                )}
                <span className="text-emerald-400">Por {formatPrice(priceCents)}</span>
              </div>
              {offerHref && (
                <Link
                  href={offerHref}
                  className="pointer-events-auto rounded-md bg-primary px-4 py-2 text-sm font-bold text-black shadow-lg transition-colors hover:bg-primary-light md:text-base"
                >
                  Saiba mais
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
