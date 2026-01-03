"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import RegisterModal from "../../components/RegisterModal"; 
import { useToast } from "../../components/ToastContext";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  
  // Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [registerOpen, setRegisterOpen] = useState(false);

  const handleLogin = async (e) => {
    e && e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        showToast && showToast("Invalid email or password", { type: "error" });
      } else {
        showToast && showToast("Signed in successfully", { type: "success" });
        router.push("/table/students");
      }
    } catch (err) {
      console.error("Login error:", err);
      showToast && showToast("Login failed", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--background)' }}>
      <form 
        onSubmit={handleLogin} 
        style={{ width: 420, maxWidth: '95%', background: 'var(--card)', border: '1px solid var(--border-color)', padding: 24, borderRadius: 'var(--radius)', boxShadow: '0 12px 40px rgba(2,6,23,0.3)' }}
      >
        <h2 style={{ margin: 0, marginBottom: 12, textAlign: 'center', color: 'var(--primary-foreground)' }}>Sign in</h2>

        <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--muted)' }}>Email</label>
        <Input 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="you@example.com" 
          type="email" 
        />

        <label style={{ display: 'block', marginTop: 12, marginBottom: 8, fontSize: 13, color: 'var(--muted)' }}>Password</label>
        <Input 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password" 
          type="password" 
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
          <Button 
            type="button" 
            variant="secondary" 
            size="sm" 
            onClick={() => setRegisterOpen(true)}
          >
            Register
          </Button>
          <Button 
            type="submit" 
            variant="default" 
            size="sm" 
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </div>
      </form>

      <RegisterModal 
        open={registerOpen} 
        onClose={() => setRegisterOpen(false)} 
      />
    </div>
  );
}