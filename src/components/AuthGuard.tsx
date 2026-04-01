"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { checkSession } from "@/lib/auth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    // La pagina di login è sempre accessibile
    if (pathname === "/login") {
      setVerified(true);
      return;
    }

    checkSession().then((valid) => {
      if (valid) {
        setVerified(true);
      } else {
        router.replace("/login");
      }
    });
  }, [pathname, router]);

  if (!verified) {
    // Schermata di caricamento — evita il flash dei contenuti protetti
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
