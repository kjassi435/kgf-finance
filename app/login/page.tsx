import { SmokeyBackground } from "@/components/SmokeyBackground";
import { LoginForm } from "@/components/LoginForm";

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
