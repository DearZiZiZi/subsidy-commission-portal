"use client";

import { useCallback } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export function CSVUpload({
  onFile,
  className,
}: {
  onFile: (file: File) => void;
  className?: string;
}) {
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f?.name.endsWith(".csv")) onFile(f);
    },
    [onFile]
  );

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gold-500/40 bg-card/50 px-6 py-14 text-center transition-colors hover:border-gold-500 hover:bg-accent/30",
        className
      )}
    >
      <Upload className="mb-3 h-10 w-10 text-gold-500" aria-hidden />
      <p className="text-sm font-medium text-foreground">Перетащите CSV сюда</p>
      <label className="mt-4 cursor-pointer text-sm text-gold-500 underline">
        Выбрать файл
        <input
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
        />
      </label>
    </div>
  );
}
