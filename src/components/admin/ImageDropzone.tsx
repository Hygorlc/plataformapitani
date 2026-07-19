"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus } from "lucide-react";

export function ImageDropzone({
  name,
  currentUrl,
}: {
  name: string;
  currentUrl?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function acceptFile(file: File) {
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("A imagem deve ser JPG ou PNG.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 5 MB.");
      return;
    }
    setError(null);
    setPreview(URL.createObjectURL(file));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !inputRef.current) return;

    const dt = new DataTransfer();
    dt.items.add(file);
    inputRef.current.files = dt.files;
    acceptFile(file);
  }

  const shownImage = preview ?? currentUrl ?? null;

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-8 transition-colors ${
          dragging ? "border-primary bg-primary/5" : "border-border"
        }`}
      >
        {shownImage ? (
          <div className="relative h-32 w-32 overflow-hidden rounded-lg ring-1 ring-border">
            <Image src={shownImage} alt="Imagem do produto" fill className="object-cover" unoptimized />
          </div>
        ) : (
          <ImagePlus size={28} className="text-text-muted" />
        )}

        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <span>Arraste o arquivo para cá</span>
          <span className="text-text-muted">ou</span>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border border-primary px-4 py-1.5 font-medium text-primary hover:bg-primary/10"
          >
            Selecione um arquivo
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          name={name}
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) acceptFile(file);
          }}
        />
      </div>

      <p className="mt-2 text-xs text-text-muted">
        A imagem escolhida deve estar no formato JPG ou PNG e ter no máximo 5 MB de tamanho.
        Dimensões ideais: 600x600 pixels.
      </p>
      {error && <p className="mt-1 text-xs text-status-danger">{error}</p>}
    </div>
  );
}
