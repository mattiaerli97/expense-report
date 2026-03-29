"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      navigator.serviceWorker
        .register(`${base}/sw.js`, { scope: `${base}/` })
        .catch((err) => console.error("[SW] Registration failed:", err));
    }
  }, []);

  return null;
}
