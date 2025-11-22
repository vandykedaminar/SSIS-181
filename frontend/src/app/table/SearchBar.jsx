"use client";
import React from "react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function SearchBar({ value = "", onChange = () => {}, placeholder = "Search..." }) {
  return (
    <div className="search-bar" style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <div style={{ flex: 1, minWidth: 140 }}>
        <Input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Table search"
        />
      </div>

      {/* Clear button positioned inside the input area */}
      <button
        type="button"
        aria-label="Clear search"
        title="Clear"
        className="search-clear"
        onClick={() => onChange("")}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}