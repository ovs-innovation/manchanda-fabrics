import React from "react";
import Link from "next/link";
import { FiShield, FiTrendingUp, FiTruck, FiRefreshCw, FiArrowRight, FiUsers, FiPackage, FiAward } from "react-icons/fi";

//internal import
import Layout from "@layout/Layout";

const AboutUs = () => {
  return (
    <Layout title="About Us" description="Our Heritage & Story - Manchanda Fabrics">
      
      {/* 1. HERO SECTION: Light Warm Beige Background */}
      <div className="bg-[#FAF7F5] text-[#3B2A25] pt-16 pb-20 lg:pt-24 lg:pb-28 border-b border-[#E6D1CB]">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            
            {/* Left Column: Copy */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <span className="text-[#9C6A5A] text-xs font-bold uppercase tracking-[0.25em] block font-sans">
                ABOUT MANCHANDA
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light tracking-tight leading-[1.05] text-[#3B2A25]">
                WEAVE YOUR STORY<br />
                WITH TIMELESS<br />
                ELEGANCE.
              </h1>
              <p className="text-[#3B2A25]/85 text-base md:text-lg font-sans leading-relaxed">
                At Manchanda Fabrics, we believe a saree is more than just six yards of fabric—it is a canvas of Indian heritage, culture, and personal expression. We curate exquisite sarees, suits, and handloom fabrics from India's finest weaving centers to bring timeless grace to your wardrobe.
              </p>
              <p className="text-[#3B2A25]/60 text-sm font-sans tracking-wide">
                With over 10,000+ happy patrons across India, our mission is to deliver authentic, premium quality textiles directly from master weavers.
              </p>
              <div className="pt-2">
                <a 
                  href="#story"
                  className="bg-[#9C6A5A] text-white hover:bg-[#6F4A3D] transition-all font-sans font-bold tracking-widest text-xs uppercase px-8 py-4 rounded-md inline-flex items-center gap-3 group shadow-md"
                >
                  OUR HERITAGE 
                  <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            {/* Right Column: Hero Mockup Image */}
            <div className="lg:col-span-7 flex justify-center">
              <div className="w-full relative overflow-hidden rounded-t-[180px] rounded-b-[20px] border-4 border-white shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800" 
                  alt="Manchanda Fabrics Traditional Collection"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 2. OUR STORY SECTION: Elegant Dark Mahogany Background */}
      <div id="story" className="bg-[#3B2A25] text-[#E6D1CB] py-20 lg:py-28">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Side Copy */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <span className="text-[#E6D1CB] text-xs font-bold uppercase tracking-[0.25em] block font-sans">
                OUR ORIGIN
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-light tracking-tight leading-tight text-[#FAF7F5]">
                A LEGACY OF WEAVES<br />
                AND DESIGN INTEGRITY
              </h2>
              <div className="space-y-4 text-[#E6D1CB]/80 font-sans text-sm md:text-base leading-relaxed text-justify">
                <p>
                  Manchanda Fabrics started with a simple vision: to bridge the gap between India's traditional weaving clusters and contemporary buyers who cherish authentic ethnic wear.
                </p>
                <p>
                  Today, we offer a handpicked collection of pure silks, traditional Banarasis, unstitched suit sets, and breathable everyday cotton fabrics.
                </p>
                <p>
                  Our commitment remains absolute - ensuring zero compromise on fiber purity, supporting native weavers, and delivering a secure, premium shopping experience.
                </p>
              </div>
            </div>

            {/* Right Side Lookbook Column Cards */}
            <div className="lg:col-span-7 grid grid-cols-3 gap-3 md:gap-4">
              <div className="rounded-xl overflow-hidden aspect-[3/5] relative bg-[#FAF7F5] border border-[#E6D1CB]/30">
                <img 
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&h=660&q=80" 
                  alt="Banarasi Weaving Details" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
              <div className="rounded-xl overflow-hidden aspect-[3/5] relative bg-[#FAF7F5] border border-[#E6D1CB]/30 mt-6 lg:mt-8">
                <img 
                  src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&h=660&q=80" 
                  alt="Silk Saree Border" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
              <div className="rounded-xl overflow-hidden aspect-[3/5] relative bg-[#FAF7F5] border border-[#E6D1CB]/30">
                <img 
                  src="https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=400&h=660&q=80" 
                  alt="Cotton Handloom Texture" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. WHAT WE OFFER: Soft Cream Background */}
      <div className="bg-[#FAF7F5] text-[#3B2A25] py-20 lg:py-24 border-t border-[#E6D1CB]">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-10">
          
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div className="text-left space-y-2">
              <span className="text-[#9C6A5A] text-xs font-bold uppercase tracking-[0.25em] block font-sans">
                WHAT WE OFFER
              </span>
              <h2 className="text-3xl lg:text-4xl font-serif font-light tracking-tight text-[#3B2A25]">
                PREMIUM ETHNIC COLLECTIONS,<br />
                CRAFTED FOR CELEBRATIONS.
              </h2>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 font-sans max-w-4xl mx-auto">
            
            {/* Sarees Card */}
            <div className="bg-white rounded-2xl overflow-hidden border border-[#E6D1CB] shadow-sm hover:shadow-md transition-all group text-left">
              <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-100 border-b border-[#E6D1CB]">
                <img 
                  src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&h=450&q=80" 
                  alt="Premium Sarees" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#3B2A25]">SAREES</span>
                  </div>
                  <p className="text-[#3B2A25]/60 text-xs leading-relaxed">Pure Silk, Banarasi, Cotton, and Designer drapes.</p>
                </div>
                <Link href="/search?category=sarees" className="w-8 h-8 rounded-full bg-[#9C6A5A] text-white flex items-center justify-center font-bold text-xs hover:bg-[#6F4A3D] transition-all">
                  &rarr;
                </Link>
              </div>
            </div>

            {/* Fabrics Card */}
            <div className="bg-white rounded-2xl overflow-hidden border border-[#E6D1CB] shadow-sm hover:shadow-md transition-all group text-left">
              <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-100 border-b border-[#E6D1CB]">
                <img 
                  src="https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=600&h=450&q=80" 
                  alt="Premium Fabrics" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#3B2A25]">FABRICS</span>
                  </div>
                  <p className="text-[#3B2A25]/60 text-xs leading-relaxed">Cotton, Raw Silk, Printed and Designer running fabrics.</p>
                </div>
                <Link href="/search?category=fabrics" className="w-8 h-8 rounded-full bg-[#9C6A5A] text-white flex items-center justify-center font-bold text-xs hover:bg-[#6F4A3D] transition-all">
                  &rarr;
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 4. WHY SHOP WITH US: Mahogany Accent Banner */}
      <div className="bg-[#6F4A3D] text-[#FAF7F5] py-14 border-t border-b border-[#3B2A25]/20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 font-sans">
            
            {/* Feature 1 */}
            <div className="flex items-start gap-4 text-left">
              <div className="w-10 h-10 rounded-full border border-[#E6D1CB]/30 flex items-center justify-center flex-shrink-0 text-[#E6D1CB]">
                <FiAward className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">AUTHENTIC WEAVES</h4>
                <p className="text-xs text-[#E6D1CB]/85 leading-relaxed mt-1">100% genuine silks and handloom fibers.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-4 text-left">
              <div className="w-10 h-10 rounded-full border border-[#E6D1CB]/30 flex items-center justify-center flex-shrink-0 text-[#E6D1CB]">
                <FiShield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">QUALITY TESTED</h4>
                <p className="text-xs text-[#E6D1CB]/85 leading-relaxed mt-1">Directly sourced under strict purity audits.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-4 text-left">
              <div className="w-10 h-10 rounded-full border border-[#E6D1CB]/30 flex items-center justify-center flex-shrink-0 text-[#E6D1CB]">
                <FiTruck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">SAFE SHIPPING</h4>
                <p className="text-xs text-[#E6D1CB]/85 leading-relaxed mt-1">Insured fast delivery across PAN India.</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-start gap-4 text-left">
              <div className="w-10 h-10 rounded-full border border-[#E6D1CB]/30 flex items-center justify-center flex-shrink-0 text-[#E6D1CB]">
                <FiRefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">EASY RETURNS</h4>
                <p className="text-xs text-[#E6D1CB]/85 leading-relaxed mt-1">Hassle-free 7-day replacement policy.</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 5. BRAND STATISTICS BAR & CALL-TO-ACTIONS */}
      <div className="bg-[#FAF7F5] py-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-10">
          <div className="bg-white border border-[#E6D1CB] rounded-3xl p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-md font-sans">
            
            {/* Stats Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16 w-full lg:w-auto text-left lg:border-r lg:border-[#E6D1CB] pr-0 lg:pr-12">
              
              {/* Stat 1 */}
              <div className="flex items-center gap-4">
                <div className="text-3xl text-[#9C6A5A]"><FiUsers /></div>
                <div>
                  <div className="text-2xl font-serif font-bold text-[#3B2A25] leading-tight">10,000+</div>
                  <div className="text-xs text-[#3B2A25]/60 uppercase tracking-wider">Happy Patrons</div>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="flex items-center gap-4">
                <div className="text-3xl text-[#9C6A5A]"><FiPackage /></div>
                <div>
                  <div className="text-2xl font-serif font-bold text-[#3B2A25] leading-tight">15,000+</div>
                  <div className="text-xs text-[#3B2A25]/60 uppercase tracking-wider">Orders Delivered</div>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="flex items-center gap-4">
                <div className="text-3xl text-[#9C6A5A]"><FiAward /></div>
                <div>
                  <div className="text-2xl font-serif font-bold text-[#3B2A25] leading-tight">150+</div>
                  <div className="text-xs text-[#3B2A25]/60 uppercase tracking-wider">Master Weavers</div>
                </div>
              </div>

            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto sm:justify-end">
              <Link 
                href="/search?category=sarees"
                className="border border-[#9C6A5A] text-[#9C6A5A] hover:bg-[#FAF7F5] transition-all font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-md flex items-center justify-center gap-2"
              >
                SHOP SAREES
                <FiArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/search?category=suits"
                className="bg-[#9C6A5A] text-white hover:bg-[#6F4A3D] transition-all font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-md flex items-center justify-center gap-2 shadow-sm"
              >
                SHOP SUITS
                <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </div>

    </Layout>
  );
};

export default AboutUs;
