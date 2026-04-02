"use client";

import { animate } from "framer-motion";
import { useEffect, useState } from "react";

export function useAnimatedScalar(target: number, decimals = 0): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    const c = animate(0, target, {
      duration: 1.15,
      ease: "easeOut",
      onUpdate: (latest) => setV(Number(latest.toFixed(decimals))),
    });
    return () => c.stop();
  }, [target, decimals]);
  return v;
}
