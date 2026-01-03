"use client";
import { Lexend } from "next/font/google";
import { usePathname } from "next/navigation";
import "./globals.css";
import Header from "./Header"; // Import the new Header component
import { ToastProvider } from "../components/ToastContext";
import AuthWrapper from "../components/AuthWrapper";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <html lang="en">
      <body className={`${lexend.variable} antialiased`}>
        <AuthWrapper>
          {!isLoginPage && <Header />}
          <main className="my-main">
            <ToastProvider>
              {children}
            </ToastProvider>
          </main>
        </AuthWrapper>
      </body>
    </html>
  );
}