import Image from "next/image";
import { cn } from "@/lib/utils";

/** Государственный герб РК (`/gerb.jpg` в `public/`). */
export function StateEmblem({
  size = 40,
  className,
  priority,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/gerb.jpg"
      alt="Мемлекеттік елтаңба / Герб Республики Казахстан"
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
      priority={priority}
    />
  );
}
