"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useToast } from "../../components/ToastContext";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e && e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const j = await res.json();
        showToast && showToast("Signed in", { type: "success" });
        router.push("/table/students");
      } else {
        showToast && showToast("Invalid email or password", { type: "error" });
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
      <form onSubmit={submit} style={{ width: 420, maxWidth: '95%', background: 'var(--card)', border: '1px solid var(--border-color)', padding: 24, borderRadius: 'var(--radius)', boxShadow: '0 12px 40px rgba(2,6,23,0.3)' }}>
        <h2 style={{ margin: 0, marginBottom: 12, textAlign: 'center', color: 'var(--primary-foreground)' }}>Sign in</h2>

        <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--muted)' }}>Email</label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" />

        <label style={{ display: 'block', marginTop: 12, marginBottom: 8, fontSize: 13, color: 'var(--muted)' }}>Password</label>
        <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 18 }}>
          <Button type="submit" variant="primary" size="sm" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</Button>
        </div>
      </form>
    </div>
  );
}
