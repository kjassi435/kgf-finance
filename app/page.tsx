import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getSession } from "@/lib/session";

const STEPS = [
  { n: 1, title: "Register & Assign", desc: "Admin onboards customers and assigns a dedicated field agent." },
  { n: 2, title: "Daily Collection", desc: "Agents collect payments on the field and record them instantly." },
  { n: 3, title: "Receipt & Notify", desc: "A receipt is generated and shared with the customer via WhatsApp." },
  { n: 4, title: "Track & Audit", desc: "Admins monitor collections, balances, and full audit trails." },
];

const TESTIMONIALS = [
  { name: "Amit Sharma", role: "Customer", stars: 5, text: "Very transparent. I get my receipt on WhatsApp the same day. No confusion about my balance." },
  { name: "Sita Verma", role: "Customer", stars: 5, text: "The agent comes regularly and the app shows exactly how much I have paid. Highly recommend." },
  { name: "Rahul Singh", role: "Customer", stars: 4, text: "Easy to track my daily deposits. The dashboard is clean and simple to understand." },
  { name: "Priya Nair", role: "Agent", stars: 5, text: "Collecting and recording payments is quick. The receipt sharing saves me so much time." },
];

export default async function Home() {
  const s = await getSession();
  return (
    <div id="top" className="min-h-screen bg-white text-slate-800">
      <SiteHeader authed={!!s} role={s?.role} />
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.4),transparent_50%)]" />
        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-32 text-center">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">KGF Investers Daily Collection</h1>
          <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto mb-8">
            KGF Investers helps agents and admins manage customer deposits, generate instant receipts, and keep every rupee accountable.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/login" className="bg-white text-indigo-700 hover:bg-indigo-50 px-6 py-3 rounded-xl font-semibold shadow-lg">Get Started</a>
            <a href="#how" className="border border-white/60 text-white hover:bg-white/10 px-6 py-3 rounded-xl font-semibold">How It Works</a>
          </div>
        </div>
      </section>
      {/* About */}
      <section id="about" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">About Us</h2>
          <p className="text-slate-500 mt-3 max-w-2xl mx-auto">We built KGF Investers to bring trust and clarity to daily deposit schemes. Every collection is recorded, every receipt is shared, and every balance is verifiable.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[{ t: "Transparent", d: "Customers always know exactly what they have paid and what remains." }, { t: "Accountable", d: "Full audit logs and agent assignments keep operations honest." }, { t: "Effortless", d: "Agents collect and share receipts in seconds, on the field." }].map((c) => (
            <div key={c.t} className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <h3 className="font-semibold text-indigo-700 mb-2">{c.t}</h3>
              <p className="text-sm text-slate-600">{c.d}</p>
            </div>
          ))}
        </div>
      </section>
      {/* How we work */}
      <section id="how" className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">How We Work</h2>
            <p className="text-slate-500 mt-3">A simple, four-step flow.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="relative bg-white border border-slate-200 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold mb-4">{s.n}</div>
                <h3 className="font-semibold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Testimonials */}
      <section id="testimonials" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">What People Say</h2>
          <p className="text-slate-500 mt-3">Rated by our customers and agents.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-1 mb-3 text-amber-400">{"★".repeat(t.stars)}{"★".repeat(5 - t.stars)}</div>
              <p className="text-slate-700 text-sm mb-4">{t.text}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">{t.name.charAt(0)}</div>
                <div><div className="font-medium text-slate-900 text-sm">{t.name}</div><div className="text-xs text-slate-500">{t.role}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}