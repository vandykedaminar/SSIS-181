"use client";
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Modal from "./ui/Modal";
import Input from "./ui/Input";
import Button from "./ui/Button";
import { useToast } from "./ToastContext"; // Assuming you have this based on your login page

export default function RegisterModal({ open, onClose }) {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Attempt to create user in Supabase
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }


      if (data.user && !data.session) {
        showToast("Registration successful! Please check your email to confirm.", { type: "success" });
      } else {
        showToast("Registration successful! You are now logged in.", { type: "success" });
      }
      
      // Reset and close
      setEmail("");
      setPassword("");
      onClose();

    } catch (err) {
      console.error("Registration error:", err);
      showToast(err.message || "Failed to register", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Register New Account">
      <form onSubmit={handleRegister} className="mt-2">
        <label className="block mb-2 text-xs text-gray-400">Email</label>
        <Input 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="newuser@example.com" 
          type="email" 
          required
        />

        <label className="block mt-4 mb-2 text-xs text-gray-400">Password</label>
        <Input 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Create a password" 
          type="password" 
          required
        />

        <div className="flex justify-end items-center mt-6 gap-2">
          <Button 
            type="button" 
            variant="secondary" 
            size="sm" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="default" 
            size="sm" 
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}