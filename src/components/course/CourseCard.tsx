import Link from "next/link";
import { Play, Lock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { CourseCover } from "@/components/course/CourseCover";
import {
  PromotionCountdown,
  PromotionTimer,
} from "@/components/course/PromotionCountdown";
import type { CatalogCourse } from "@/lib/data/courses";

const statusLabel: Record<CatalogCourse["status"], string> = {
  new: "Novo",
  in_progress: "Continuar",
  completed: "Concluído",
  available: "Disponível",
};

const statusToBadge: Record<CatalogCourse["status"], "new" | "progress" | "completed" | "draft"> = {
  new: "new",
  in_progress: "progress",
  completed: "completed",
  available: "draft",
};

export function CourseCard({ course }: { course: CatalogCourse }) {
  const isLocked = !course.enrolled && course.price_cents > 0;
  const hasDiscount =
    course.original_price_cents !== null &&
    course.original_price_cents > course.price_cents;
  const formattedPrice = (course.price_cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const formattedOriginalPrice = hasDiscount
    ? (course.original_price_cents! / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })
    : null;
  const showPromotionPrice =
    isLocked && course.promotionEndsAt !== null && formattedOriginalPrice !== null;

  return (
    <Link
      href={
        isLocked
          ? `/courses/${course.slug}?comprar=1`
          : `/courses/${course.slug}`
      }
      className="group/card relative w-72 shrink-0 snap-start sm:w-80"
    >
      <div className="relative aspect-video overflow-hidden rounded-md ring-1 ring-border transition-all duration-300 ease-out group-hover/card:scale-110 group-hover/card:z-20 group-hover/card:shadow-2xl group-hover/card:shadow-black/60 group-hover/card:ring-primary/60">
        <CourseCover
          title={course.title}
          size={72}
          className="absolute inset-0"
          thumbnailUrl={course.thumbnail_url}
        />

        <div className="absolute left-3 top-3 z-20 rounded-lg border border-primary/50 bg-black/85 px-2.5 py-1.5 shadow-lg backdrop-blur-sm">
          <Badge status={statusToBadge[course.status]}>
            <span className="text-sm font-bold">{statusLabel[course.status]}</span>
          </Badge>
        </div>

        {isLocked && course.promotionEndsAt && (
          <div className="pointer-events-none absolute right-3 top-3 z-20">
            <PromotionTimer endAt={course.promotionEndsAt} />
          </div>
        )}

        {isLocked ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-[1px] transition-colors duration-200 group-hover/card:bg-black/70">
            <div className="group/lock relative flex h-12 w-12 items-center justify-center rounded-full bg-background/70 ring-2 ring-primary/70">
              <Lock size={22} className="text-primary" />
              <div className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-48 -translate-x-1/2">
                <PromotionCountdown label={course.promotionLabel} />
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 group-hover/card:opacity-100">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-background">
              <Play size={18} fill="currentColor" />
            </div>
          </div>
        )}

        {course.enrolled && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-black/40">
            <div
              className="h-full bg-primary"
              style={{ width: `${course.progressPercent}%` }}
            />
          </div>
        )}
      </div>

      <div className="mt-3 space-y-1 px-0.5">
        <p className="truncate text-xs text-text-muted">
          {course.category ?? "Cursos Online"}
        </p>
        <h3 className="truncate text-base font-semibold leading-tight text-text-primary">
          {course.title}
        </h3>
        {isLocked ? (
          <p className="flex items-center gap-2 truncate text-sm font-medium">
            {showPromotionPrice && (
              <span className="text-text-muted line-through">
                De {formattedOriginalPrice}
              </span>
            )}
            <span className="text-emerald-500">
              {showPromotionPrice
                ? `Por ${formattedPrice}`
                : `Investimento ${formattedPrice}`}
            </span>
          </p>
        ) : (
          <p className="truncate text-sm font-medium text-emerald-500">
            {course.price_cents === 0 ? "Acesso gratuito" : "Acesso liberado"}
          </p>
        )}
      </div>
    </Link>
  );
}
