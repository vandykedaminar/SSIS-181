"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function AuthWrapper({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && pathname !== "/login") {
        router.push("/login");
      } else {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session && pathname !== "/login") {
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, pathname]);

  if (loading && pathname !== "/login") {
    return <div>Loading...</div>;
  }

  return children;
}