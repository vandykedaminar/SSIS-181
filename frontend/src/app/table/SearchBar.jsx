"use client";
import React from "react";

export default function SearchBar({ value = "", onChange = () => {}, placeholder = "Search..." }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Table search"
        style={{
          minWidth: 220,
          maxWidth: 420,
          width: "100%",
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid rgba(0,0,0,0.08)",
          background: "#e9eef6",         // darker background so text is visible
          color: "#0f172a",
          outline: "none",
        }}
      />
    </div>
  );
}