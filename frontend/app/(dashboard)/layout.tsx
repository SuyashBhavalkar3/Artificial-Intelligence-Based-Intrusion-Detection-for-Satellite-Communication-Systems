"use client";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import Navbar from "@/components/Navbar";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useAuthGuard();
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-subtle)" }}>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
    </div>
  );
}
