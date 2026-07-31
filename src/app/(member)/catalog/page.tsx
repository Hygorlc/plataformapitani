import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCatalogCourses } from "@/lib/data/courses";
import { HeroMedia, type HeroSlide } from "@/components/course/HeroCarousel";
import { CourseRow } from "@/components/course/CourseRow";

export default async function CatalogPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const courses = await getCatalogCourses(supabase, user.id);
  const { data: heroSettings } = await supabase
    .from("platform_settings")
    .select("home_hero_mode, home_video_url, home_carousel_slides")
    .eq("id", "main")
    .maybeSingle();

  const inProgress = courses.filter((c) => c.status === "in_progress");
  const newCourses = courses.filter((c) => c.status === "new");
  const completed = courses.filter((c) => c.status === "completed");
  const iplCourse = courses.find(
    (course) =>
      course.slug.toLowerCase() === "ipl" ||
      course.title.toLocaleLowerCase("pt-BR").includes("ipl")
  );
  const heroOfferCourse =
    iplCourse ??
    courses.find(
      (course) =>
        !course.enrolled &&
        course.price_cents > 0 &&
        course.promotionOfferEndsAt !== null
    );
  const heroSlides = Array.isArray(heroSettings?.home_carousel_slides)
    ? heroSettings.home_carousel_slides
        .map((slide): HeroSlide | null => {
          if (!slide || typeof slide !== "object" || Array.isArray(slide)) return null;
          return {
            imageUrl: typeof slide.imageUrl === "string" ? slide.imageUrl : "",
            title: typeof slide.title === "string" ? slide.title : "",
            subtitle: typeof slide.subtitle === "string" ? slide.subtitle : "",
          };
        })
        .filter((slide): slide is HeroSlide => slide !== null && !!slide.imageUrl)
    : [];

  return (
    <div>
      <HeroMedia
        mode={heroSettings?.home_hero_mode === "carousel" ? "carousel" : "video"}
        videoUrl={
          heroSettings?.home_video_url ??
          "https://www.youtube.com/watch?v=RLBZNpJHjpI"
        }
        slides={heroSlides}
        promotionEndsAt={heroOfferCourse?.promotionOfferEndsAt ?? null}
        originalPriceCents={heroOfferCourse?.original_price_cents ?? null}
        priceCents={heroOfferCourse?.price_cents ?? null}
        offerTitle={heroOfferCourse?.title ?? "Imersão IPL"}
        offerHref={
          heroOfferCourse ? `/courses/${heroOfferCourse.slug}?comprar=1` : null
        }
      />

      <div className="flex flex-col gap-10 py-8">
        <CourseRow title="Continuar Aprendendo" courses={inProgress} />
        <CourseRow title="Novidades" courses={newCourses} />
        <CourseRow title="Todos os Cursos" courses={courses} />
        <CourseRow title="Concluídos" courses={completed} />
      </div>

      {courses.length === 0 && (
        <p className="px-6 py-16 text-center text-text-secondary lg:px-12">
          Nenhum curso disponível no momento.
        </p>
      )}
    </div>
  );
}
