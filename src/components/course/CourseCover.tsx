import type { ComponentType } from "react";
import Image from "next/image";
import {
  Megaphone,
  BarChart3,
  PenTool,
  Code2,
  Camera,
  Briefcase,
  Languages,
  Music,
  BookOpen,
} from "lucide-react";

interface Topic {
  match: RegExp;
  icon: ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
    style?: React.CSSProperties;
  }>;
  tint: string;
}

const TOPICS: Topic[] = [
  { match: /marketing|social|seo|ads|redes|instagram|facebook/i, icon: Megaphone, tint: "#e8734a" },
  { match: /excel|dados|dashboard|planilha|an[aá]lise|bi\b/i, icon: BarChart3, tint: "#3b82f6" },
  { match: /design|ux|ui|figma|criativ/i, icon: PenTool, tint: "#8b5cf6" },
  { match: /program|c[oó]digo|dev|javascript|python|react|software/i, icon: Code2, tint: "#22c55e" },
  { match: /foto|v[ií]deo|filmagem|edi[cç][aã]o/i, icon: Camera, tint: "#ec4899" },
  { match: /neg[oó]cio|gest[aã]o|lideran[cç]a|empreende/i, icon: Briefcase, tint: "#f59e0b" },
  { match: /ingl[eê]s|espanhol|idioma|language/i, icon: Languages, tint: "#06b6d4" },
  { match: /m[uú]sica|viol[aã]o|piano|canto/i, icon: Music, tint: "#a855f7" },
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickTheme(title: string): Topic {
  return TOPICS.find((t) => t.match.test(title)) ?? { match: /.*/, icon: BookOpen, tint: "#d4af37" };
}

export function CourseCover({
  title,
  size = 40,
  className = "",
  thumbnailUrl,
}: {
  title: string;
  size?: number;
  className?: string;
  thumbnailUrl?: string | null;
}) {
  const { icon: Icon, tint } = pickTheme(title);
  const angle = 30 + (hashString(title) % 90);

  if (thumbnailUrl) {
    return (
      <div className={`overflow-hidden ${className}`}>
        <Image
          src={thumbnailUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 25% 15%, ${tint}3d, transparent 55%), linear-gradient(160deg, var(--surface) 0%, var(--background) 85%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `repeating-linear-gradient(${angle}deg, ${tint} 0, ${tint} 1px, transparent 1px, transparent 14px)`,
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: size, height: size }}
      >
        <Icon
          size={size}
          strokeWidth={1.5}
          style={{ color: tint, width: size, height: size }}
          className="block shrink-0 opacity-90"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
      <div
        className="absolute -bottom-1/3 left-1/2 h-2/3 w-2/3 -translate-x-1/2 rounded-full blur-3xl"
        style={{ backgroundColor: `${tint}22` }}
      />
    </div>
  );
}
