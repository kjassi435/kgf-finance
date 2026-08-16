import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import GlassLanding from "@/components/GlassLanding";
import { getSession } from "@/lib/session";

export default async function Home() {
  const s = await getSession();
  return (
    <div id="top" className="min-h-screen">
      <SiteHeader authed={!!s} role={s?.role} />
      <GlassLanding />
      <SiteFooter />
    </div>
  );
}
