import React from "react";
import Link from "next/link";
import Layout from "@layout/Layout";
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiClock,
  FiSend,
} from "react-icons/fi";
import { FaWhatsapp, FaInstagram, FaFacebookF } from "react-icons/fa";

const CONTACT_INFO = [
  {
    icon: <FiPhone className="text-xl" />,
    title: "Call / WhatsApp",
    value: "+91 98765 43210",
    sub: "Mon–Sat, 10 AM – 7 PM",
    href: "tel:+919876543210",
  },
  {
    icon: <FiMail className="text-xl" />,
    title: "Email Us",
    value: "support@manchandafabrics.com",
    sub: "We reply within 24 hours",
    href: "mailto:support@manchandafabrics.com",
  },
  {
    icon: <FiMapPin className="text-xl" />,
    title: "Visit Our Store",
    value: "Manchanda Fabrics, Chandni Chowk",
    sub: "Delhi – 110006, India",
    href: "https://maps.google.com",
  },
  {
    icon: <FiClock className="text-xl" />,
    title: "Store Hours",
    value: "Mon – Sat: 10 AM – 8 PM",
    sub: "Sunday: 11 AM – 6 PM",
    href: null,
  },
];

export default function ContactUs() {
  const [formState, setFormState] = React.useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = React.useState(false);

  const handleChange = (e) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Layout title="Contact Us – Manchanda Fabrics" description="Reach out to Manchanda Fabrics for queries about sarees, suits, fabrics, orders and more.">
      {/* Hero Banner */}
      <section
        className="relative w-full py-24 md:py-32 flex items-center justify-center overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #3B2A25 0%, #6F4A3D 50%, #9C6A5A 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 75% 50%, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative text-center px-6">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#E6D1CB] mb-3">
            Get In Touch
          </p>
          <h1 className="text-4xl md:text-6xl font-serif font-light text-white mb-4">
            Contact Us
          </h1>
          <div className="h-[2px] w-16 bg-[#E6D1CB] mx-auto mb-5" />
          <p className="text-white/75 text-sm max-w-md mx-auto leading-relaxed">
            Have a question about our sarees, suits, or fabrics? We&apos;re here to help you find your perfect ethnic ensemble.
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-14 bg-[#FAF7F5]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CONTACT_INFO.map((info, i) => {
            const card = (
              <div className="flex flex-col items-center text-center p-7 bg-white border border-[#E6D1CB] rounded-2xl shadow-sm group hover:border-[#9C6A5A]/60 hover:shadow-md transition-all duration-300 h-full">
                <div className="w-14 h-14 rounded-full bg-[#FAF7F5] border border-[#E6D1CB] flex items-center justify-center text-[#9C6A5A] mb-4 group-hover:bg-[#9C6A5A] group-hover:text-white transition-all duration-300">
                  {info.icon}
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#9C6A5A] mb-1">{info.title}</h3>
                <p className="text-sm font-semibold text-[#3B2A25] leading-snug">{info.value}</p>
                <p className="text-[10px] text-[#3B2A25]/55 mt-1">{info.sub}</p>
              </div>
            );
            return info.href ? (
              <a key={i} href={info.href} target="_blank" rel="noopener noreferrer" className="block">
                {card}
              </a>
            ) : (
              <div key={i}>{card}</div>
            );
          })}
        </div>
      </section>

      {/* Form + Right Panel */}
      <section className="py-14 bg-white border-t border-[#E6D1CB]/60">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#9C6A5A] mb-2">Send a Message</p>
            <h2 className="text-2xl md:text-3xl font-serif font-light text-[#3B2A25] mb-1">
              We&apos;d Love to Hear From You
            </h2>
            <div className="h-[2px] w-10 bg-[#9C6A5A] mb-7" />

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-[#FAF7F5] rounded-2xl border border-[#E6D1CB]">
                <div className="w-16 h-16 bg-[#9C6A5A] rounded-full flex items-center justify-center mb-5">
                  <FiSend className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-serif text-[#3B2A25] mb-2">Message Sent!</h3>
                <p className="text-sm text-[#3B2A25]/65 max-w-xs">
                  Thank you for reaching out. Our team will get back to you within 24 hours.
                </p>
                <button
                  className="mt-6 text-xs font-bold uppercase tracking-widest text-[#9C6A5A] hover:text-[#6F4A3D] transition-colors"
                  onClick={() => { setSubmitted(false); setFormState({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                >
                  Send Another →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3B2A25]/70 mb-1.5">Full Name *</label>
                    <input type="text" name="name" required value={formState.name} onChange={handleChange} placeholder="e.g. Priya Sharma"
                      className="w-full px-4 py-3 text-sm border border-[#E6D1CB] rounded-xl bg-[#FAF7F5] text-[#3B2A25] placeholder-[#3B2A25]/30 focus:outline-none focus:border-[#9C6A5A] focus:ring-2 focus:ring-[#9C6A5A]/15 transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3B2A25]/70 mb-1.5">Phone Number</label>
                    <input type="tel" name="phone" value={formState.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX"
                      className="w-full px-4 py-3 text-sm border border-[#E6D1CB] rounded-xl bg-[#FAF7F5] text-[#3B2A25] placeholder-[#3B2A25]/30 focus:outline-none focus:border-[#9C6A5A] focus:ring-2 focus:ring-[#9C6A5A]/15 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3B2A25]/70 mb-1.5">Email Address *</label>
                  <input type="email" name="email" required value={formState.email} onChange={handleChange} placeholder="you@example.com"
                    className="w-full px-4 py-3 text-sm border border-[#E6D1CB] rounded-xl bg-[#FAF7F5] text-[#3B2A25] placeholder-[#3B2A25]/30 focus:outline-none focus:border-[#9C6A5A] focus:ring-2 focus:ring-[#9C6A5A]/15 transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3B2A25]/70 mb-1.5">Subject</label>
                  <select name="subject" value={formState.subject} onChange={handleChange}
                    className="w-full px-4 py-3 text-sm border border-[#E6D1CB] rounded-xl bg-[#FAF7F5] text-[#3B2A25] focus:outline-none focus:border-[#9C6A5A] focus:ring-2 focus:ring-[#9C6A5A]/15 transition-all">
                    <option value="">Select a topic…</option>
                    <option value="order">Order Query</option>
                    <option value="saree">Saree Enquiry</option>
                    <option value="suit">Suit Enquiry</option>
                    <option value="fabric">Fabric / Bulk Order</option>
                    <option value="return">Return / Exchange</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3B2A25]/70 mb-1.5">Message *</label>
                  <textarea name="message" required rows={5} value={formState.message} onChange={handleChange} placeholder="Tell us how we can help you…"
                    className="w-full px-4 py-3 text-sm border border-[#E6D1CB] rounded-xl bg-[#FAF7F5] text-[#3B2A25] placeholder-[#3B2A25]/30 focus:outline-none focus:border-[#9C6A5A] focus:ring-2 focus:ring-[#9C6A5A]/15 transition-all resize-none" />
                </div>
                <button type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#9C6A5A] hover:bg-[#6F4A3D] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-colors shadow-md hover:shadow-lg">
                  <FiSend />
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* WhatsApp CTA */}
            <div className="rounded-2xl bg-[#25D366] p-7 text-white flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <FaWhatsapp className="text-3xl" />
                <div>
                  <h3 className="font-black text-sm uppercase tracking-widest">Chat on WhatsApp</h3>
                  <p className="text-white/80 text-xs">Fastest response — within minutes!</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-white/90">
                For quick saree/suit queries, styling advice, or order tracking — just ping us on WhatsApp.
              </p>
              <a
                href="https://wa.me/919876543210?text=Hello%20Manchanda%20Fabrics!%20I%20have%20a%20query."
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-[#25D366] font-black text-xs uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-[#f0fdf4] transition-colors w-fit">
                <FaWhatsapp />
                Open WhatsApp
              </a>
            </div>

            {/* Social Links */}
            <div className="rounded-2xl border border-[#E6D1CB] bg-[#FAF7F5] p-7">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#9C6A5A] mb-4">Follow Us</h3>
              <div className="flex flex-col gap-3">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white border border-[#E6D1CB] rounded-xl hover:border-[#9C6A5A]/50 hover:shadow-sm transition-all group">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <FaInstagram className="text-white text-base" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#3B2A25] group-hover:text-[#9C6A5A] transition-colors">@manchandafabrics</p>
                    <p className="text-[9px] text-[#3B2A25]/50">Daily ethnic inspirations</p>
                  </div>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white border border-[#E6D1CB] rounded-xl hover:border-[#9C6A5A]/50 hover:shadow-sm transition-all group">
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center">
                    <FaFacebookF className="text-white text-base" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#3B2A25] group-hover:text-[#9C6A5A] transition-colors">Manchanda Fabrics</p>
                    <p className="text-[9px] text-[#3B2A25]/50">New arrivals & festive collections</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="rounded-2xl border border-[#E6D1CB] bg-white p-7">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#9C6A5A] mb-4">Quick Help</h3>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Track My Order", href: "/user/dashboard" },
                  { label: "Browse Sarees", href: "/search?category=sarees" },
                  { label: "Designer Suits", href: "/search?category=suits" },
                  { label: "Return Policy", href: "/about-us" },
                ].map((link) => (
                  <Link key={link.label} href={link.href}
                    className="flex items-center justify-between text-xs font-semibold text-[#3B2A25] hover:text-[#9C6A5A] transition-colors py-1.5 border-b border-[#E6D1CB]/60 last:border-0">
                    <span>{link.label}</span>
                    <span className="text-[#9C6A5A]">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-14 bg-[#FAF7F5] border-t border-[#E6D1CB]/60">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-8">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#9C6A5A] mb-2">Find Us</p>
            <h2 className="text-2xl font-serif font-light text-[#3B2A25]">Visit Our Showroom</h2>
            <div className="h-[2px] w-10 bg-[#9C6A5A] mx-auto mt-3" />
          </div>
          <div className="w-full h-72 rounded-2xl overflow-hidden border border-[#E6D1CB] shadow-sm bg-[#E6D1CB]/30 flex items-center justify-center">
            <div className="text-center">
              <FiMapPin className="text-[#9C6A5A] text-4xl mx-auto mb-3" />
              <p className="text-sm font-semibold text-[#3B2A25]">Manchanda Fabrics</p>
              <p className="text-xs text-[#3B2A25]/60">Chandni Chowk, Delhi – 110006</p>
              <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer"
                className="mt-4 inline-block text-xs font-bold uppercase tracking-widest text-[#9C6A5A] hover:text-[#6F4A3D] underline underline-offset-2 transition-colors">
                Open in Google Maps →
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
