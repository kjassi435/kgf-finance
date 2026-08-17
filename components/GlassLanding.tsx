"use client";

import { useState, useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const METRICS = [
  { label: "Total Collected", value: 847000, prefix: "₹", suffix: "K", display: "847" },
  { label: "Active Customers", value: 2400, prefix: "", suffix: "+", display: "2,400" },
  { label: "Agents on Field", value: 85, prefix: "", suffix: "+", display: "85" },
  { label: "Collection Accuracy", value: 99.7, prefix: "", suffix: "%", display: "99.7" },
];

const GROWTH_DATA = [
  { month: "Jan", revenue: 42 },
  { month: "Feb", revenue: 58 },
  { month: "Mar", revenue: 65 },
  { month: "Apr", revenue: 78 },
  { month: "May", revenue: 91 },
  { month: "Jun", revenue: 105 },
  { month: "Jul", revenue: 118 },
  { month: "Aug", revenue: 134 },
  { month: "Sep", revenue: 152 },
  { month: "Oct", revenue: 168 },
  { month: "Nov", revenue: 189 },
  { month: "Dec", revenue: 210 },
];

const TESTIMONIALS = [
  {
    name: "Amit Sharma",
    role: "Customer · Jaipur",
    text: "I used to lose track of my daily deposits. Now I get a WhatsApp receipt the same day. Kalyan Gold Fund changed everything for me.",
    initials: "AS",
    color: "bg-indigo-100 text-indigo-700",
  },
  {
    name: "Sunita Devi",
    role: "Customer · Lucknow",
    text: "My agent comes every morning and I can see my balance growing on the dashboard. It feels very safe and transparent.",
    initials: "SD",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "Ravi Kumar",
    role: "Agent · Bengaluru",
    text: "Recording a collection takes 5 seconds now. The receipt goes to the customer automatically. My work has become so much easier.",
    initials: "RK",
    color: "bg-amber-100 text-amber-700",
  },
  {
    name: "Priya Nair",
    role: "Customer · Kochi",
    text: "I can see exactly how much I have paid and how much is remaining. No confusion, no disputes. Highly recommended.",
    initials: "PN",
    color: "bg-rose-100 text-rose-700",
  },
];

const STEPS = [
  { n: 1, title: "Register & Assign", desc: "Admin onboards customers and assigns a dedicated field agent." },
  { n: 2, title: "Daily Collection", desc: "Agents collect payments on the field and record them instantly." },
  { n: 3, title: "Receipt & Notify", desc: "A receipt is generated and shared with the customer via WhatsApp." },
  { n: 4, title: "Track & Audit", desc: "Admins monitor collections, balances, and full audit trails." },
];

function useCountUp(target: number, duration = 2000, enabled = true) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let start = 0;
    const startTime = performance.now();
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target, duration, enabled]);
  return count;
}

function GlassCube() {
  return (
    <div className="relative w-40 h-40 md:w-56 md:h-56 mx-auto mb-8">
      {/* Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/30 to-violet-400/30 rounded-3xl blur-2xl animate-pulse" />
      {/* Glass cube */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl shadow-[0_8px_32px_rgba(99,102,241,0.15)] flex items-center justify-center"
        style={{ transform: "perspective(600px) rotateY(-8deg) rotateX(4deg)" }}
      >
        <div className="text-center">
          <div className="text-5xl md:text-7xl font-black text-indigo-600/80 tracking-tighter">K</div>
          <div className="text-[10px] md:text-xs font-semibold text-indigo-400/70 tracking-widest uppercase mt-1">gold fund</div>
        </div>
      </div>
      {/* Floating orbs */}
      <div className="absolute -top-3 -right-3 w-6 h-6 bg-indigo-400/40 rounded-full blur-sm animate-bounce" style={{ animationDelay: "0.5s" }} />
      <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-violet-400/40 rounded-full blur-sm animate-bounce" style={{ animationDelay: "1.2s" }} />
    </div>
  );
}

function RevenueCounter() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const collected = useCountUp(847, 2200, visible);
  const customers = useCountUp(2400, 2000, visible);
  const agents = useCountUp(85, 1800, visible);

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {[
        { label: "Total Collected", value: `₹${collected}K+`, accent: "text-indigo-600" },
        { label: "Happy Customers", value: `${customers.toLocaleString()}+`, accent: "text-emerald-600" },
        { label: "Field Agents", value: `${agents}+`, accent: "text-violet-600" },
        { label: "Collection Accuracy", value: "99.7%", accent: "text-amber-600" },
      ].map((m) => (
        <div key={m.label} className="bg-white rounded-2xl border border-slate-200/80 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
          <div className={`text-3xl md:text-4xl font-black ${m.accent}`}>{m.value}</div>
          <div className="text-sm text-slate-500 mt-2 font-medium">{m.label}</div>
        </div>
      ))}
    </div>
  );
}

function GrowthChart() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Monthly Revenue</h3>
          <p className="text-sm text-slate-500">Year-over-year growth trend</p>
        </div>
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">+164% YoY</span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={GROWTH_DATA} barCategoryGap="25%">
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={(v) => `₹${v}K`} />
          <Tooltip formatter={(v) => [`₹${v}K`, "Revenue"]} cursor={{ fill: "rgba(99,102,241,0.05)" }} />
          <Bar dataKey="revenue" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function GlassLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24">
        {/* Background decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-violet-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <GlassCube />

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-tight mb-6 tracking-tight">
            Collect. Track.
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Grow Together.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Kalyan Gold Fund helps agents collect daily deposits, share instant receipts, and gives customers full transparency over every rupee.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a href="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:shadow-xl transition-all">
              Start Now
            </a>
            <a href="#how" className="bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-700 px-8 py-3.5 rounded-xl font-semibold transition-all">
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* ── COUNTERS ── */}
      <section className="max-w-6xl mx-auto px-4 -mt-4 mb-16">
        <RevenueCounter />
      </section>

      {/* ── STORY / WHY US ── */}
      <section id="about" className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase mb-3 block">Our Story</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 leading-tight">
              Trusted by thousands since 2020
            </h2>
            <p className="text-slate-500 leading-relaxed mb-4">
              We started with a simple question: <strong className="text-slate-700">why should daily collection be complicated?</strong> Today, over 2,400 customers and 85 agents trust Kalyan Gold Fund to manage ₹8.47 crore in collected deposits — with 99.7% accuracy.
            </p>
            <p className="text-slate-500 leading-relaxed mb-6">
              Every rupee is tracked. Every receipt is shared. Every balance is verifiable. That is the Kalyan Gold Fund promise.
            </p>
            <div className="flex gap-8">
              <div>
                <div className="text-2xl font-black text-indigo-600">5+</div>
                <div className="text-xs text-slate-500">Years Running</div>
              </div>
              <div>
                <div className="text-2xl font-black text-indigo-600">₹8.47Cr</div>
                <div className="text-xs text-slate-500">Total Collected</div>
              </div>
              <div>
                <div className="text-2xl font-black text-indigo-600">0</div>
                <div className="text-xs text-slate-500">Missing Receipts</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <GrowthChart />
          </div>
        </div>
      </section>

      {/* ── HOW WE WORK (Road Chart) ── */}
      <section id="how" className="bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase mb-3 block">Process</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">How We Work</h2>
            <p className="text-slate-500 max-w-xl mx-auto">A simple four-step flow from registration to full transparency.</p>
          </div>

          {/* Road chart */}
          <div className="relative">
            {/* Vertical connecting line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 via-indigo-400 to-violet-400 hidden md:block" />

            <div className="space-y-8 md:space-y-0">
              {STEPS.map((step, i) => (
                <div key={step.n} className={`relative md:flex items-center ${i % 2 === 0 ? "" : "md:flex-row-reverse"}`}>
                  {/* Node */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 z-10">
                    <div className="w-12 h-12 rounded-full bg-white border-4 border-indigo-500 flex items-center justify-center shadow-md">
                      <span className="text-sm font-bold text-indigo-600">{step.n}</span>
                    </div>
                  </div>

                  {/* Card */}
                  <div className={`md:w-[calc(50%-3rem)] ${i % 2 === 0 ? "md:mr-auto md:pr-12" : "md:ml-auto md:pl-12"}`}>
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="md:hidden w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mb-3">{step.n}</div>
                      <h3 className="font-bold text-slate-900 text-lg mb-2">{step.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS (Google-style) ── */}
      <section id="testimonials" className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-14">
          <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase mb-3 block">Testimonials</span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">What People Say</h2>
          <p className="text-slate-500">Real reviews from real customers and agents.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
              {/* Google-style header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-11 h-11 rounded-full ${t.color} flex items-center justify-center font-bold text-sm`}>
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{t.name}</div>
                  <div className="text-xs text-slate-400">{t.role}</div>
                </div>
                {/* G logo */}
                <div className="ml-auto" aria-label="Google verified review">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" role="img">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-3" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} className={`w-4 h-4 ${s <= 5 ? "text-amber-400" : "text-slate-200"}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-slate-600 text-sm leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,white,transparent_60%)]" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to Get Started?</h2>
            <p className="text-indigo-100 max-w-xl mx-auto mb-8">Join 2,400+ customers who track every rupee with confidence.</p>
            <a href="/login" className="bg-white text-indigo-700 hover:bg-indigo-50 px-8 py-3.5 rounded-xl font-bold shadow-lg transition-all inline-block">
              Login to Dashboard
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
