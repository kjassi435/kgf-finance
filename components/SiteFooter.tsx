import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="text-white font-semibold text-lg mb-3">KGF Daily Collection</h3>
          <p className="text-sm text-slate-400">
            Reliable daily money collection and customer management for agents and
            administrators. Transparent, trackable, and secure.
          </p>
        </div>
        <div>
          <h4 className="text-white font-medium mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#about" className="hover:text-white">About Us</a></li>
            <li><a href="#how" className="hover:text-white">How We Work</a></li>
            <li><a href="#testimonials" className="hover:text-white">Testimonials</a></li>
            <li><Link href="/login" className="hover:text-white">Login</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-medium mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>Email: support@kgfcollection.com</li>
            <li>Phone: +91 98765 43210</li>
            <li>Office: MG Road, Bengaluru, Karnataka</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} KGF Daily Collection. All rights reserved.
      </div>
    </footer>
  );
}
