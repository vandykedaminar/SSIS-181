"use client";
import { useRouter } from "next/navigation";
import Image from "next/image"; // Import Next.js Image component
import { Button } from "./ui/Button"; 
import { supabase } from "../lib/supabaseClient";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout failed", error);
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <Button 
      variant="destructive" 
      size="sm" 
      onClick={handleLogout}
      className="gap-2 font-semibold shadow-md px-4"
    >

      <Image 
        src="/logout.png" 
        alt="Logout" 
        width={20} 
        height={20} 
        className="invert brightness-0"
      />
      
    </Button>
  );
}