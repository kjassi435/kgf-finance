import { SmokeyBackground } from "@/components/SmokeyBackground";
import { LoginForm } from "@/components/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Kalyan Gold Fund",
  description: "Login to Kalyan Gold Fund (KGF) dashboard. Access your daily money collection, customer management, and field agent tools.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <SmokeyBackground backdropBlurAmount="sm" color="#1E40AF" />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <LoginForm />
      </div>
    </main>
  );
}
