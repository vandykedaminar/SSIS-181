"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TableLayout({ children }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/auth/status", { credentials: "include" });
        if (!mounted) return;
        if (res.ok) {
          const j = await res.json();
          if (!j || !j.authenticated) {
            router.push("/login");
          }
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Auth check failed", err);
        router.push("/login");
      } finally {
        if (mounted) setChecking(false);
      }
    })();
    return () => { mounted = false };
  }, [router]);

  if (checking) return <div />;
  return <>{children}</>;
}
