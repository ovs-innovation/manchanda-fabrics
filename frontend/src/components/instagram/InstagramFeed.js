import React, { useState } from "react";
import { FaInstagram, FaHeart, FaRegHeart, FaRegComment, FaRegBookmark, FaBookmark } from "react-icons/fa";
import { FiSend, FiMoreHorizontal } from "react-icons/fi";

const INSTAGRAM_HANDLE = "manchandafabrics";
const PROFILE_PICTURE = "/logo/logo.png";

const InstagramFeed = ({ posts = [] }) => {
  const [likedPosts, setLikedPosts] = useState({});
  const [bookmarkedPosts, setBookmarkedPosts] = useState({});

  const displayPosts = (posts || [])
    .filter((post) => post?.image)
    .map((post, idx) => ({
      id: post.id || `ig-${idx}`,
      image: post.image,
      link: post.url || post.link || `https://www.instagram.com/${INSTAGRAM_HANDLE}`,
      likes: post.likes || "",
      location: post.location || "",
      caption: post.caption || "",
      timeAgo: post.timeAgo || "",
    }));

  if (!displayPosts.length) return null;

  const toggleLike = (id) => {
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleBookmark = (id) => {
    setBookmarkedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-[#FAF7F5] py-20 border-t border-[#E6D1CB] relative overflow-hidden">
      {/* Background Soft Glows for Ambient Lighting */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[35vw] h-[35vw] rounded-full blur-[130px] bg-[#9C6A5A]/5" />
        <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] rounded-full blur-[150px] bg-[#E6D1CB]/10" />
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        
        {/* Section Title Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div className="space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[#E6D1CB] rounded-full shadow-sm">
              <FaInstagram className="text-xs text-[#9C6A5A]" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#9C6A5A]">
                @{INSTAGRAM_HANDLE}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-[#3B2A25] leading-none">
              From Our Instagram
            </h2>
            <p className="text-[#3B2A25]/60 text-xs font-semibold uppercase tracking-wider">
              Explore featured styling and daily inspiration straight from our feed
            </p>
          </div>

          <div className="mt-6 md:mt-0">
            <a
              href={`https://www.instagram.com/${INSTAGRAM_HANDLE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#9C6A5A] text-white font-extrabold text-[10px] uppercase tracking-widest rounded-md hover:bg-[#6F4A3D] transition-all duration-300 shadow-md hover:scale-105 active:scale-95 pointer-events-auto"
            >
              <span>Follow Us</span>
            </a>
          </div>
        </div>

        {/* Instagram Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 max-w-5xl mx-auto">
          {displayPosts.map((post) => {
            const isLiked = !!likedPosts[post.id];
            const isBookmarked = !!bookmarkedPosts[post.id];

            return (
              <div
                key={post.id}
                className="bg-white border border-[#E6D1CB]/50 hover:border-[#9C6A5A]/30 rounded-2xl overflow-hidden flex flex-col justify-between shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group"
              >
                {/* 1. POST HEADER */}
                <div className="flex items-center justify-between p-4 border-b border-[#E6D1CB]/30 bg-[#FAF7F5]/50">
                  <div className="flex items-center gap-3">
                    {/* Profile Avatar */}
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-[#E6D1CB] bg-[#FAF7F5] shrink-0 p-[1.5px]">
                      <img
                        src={PROFILE_PICTURE}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=150";
                        }}
                      />
                    </div>
                    
                    {/* Username, Location & Badge */}
                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-1">
                        <a
                          href={post.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-[#3B2A25] hover:underline tracking-tight"
                        >
                          {INSTAGRAM_HANDLE}
                        </a>
                      </div>
                      <span className="text-[9px] font-medium text-[#3B2A25]/50 tracking-wide">
                        {post.location}
                      </span>
                    </div>
                  </div>

                  <button className="text-[#3B2A25]/50 hover:text-[#3B2A25] transition-colors duration-300">
                    <FiMoreHorizontal className="text-lg" />
                  </button>
                </div>

                {/* 2. POST IMAGE */}
                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-square block bg-black overflow-hidden"
                >
                  <img
                    src={post.image}
                    alt={`Instagram Post by ${INSTAGRAM_HANDLE}`}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Glass sheen effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent z-[1]" />
                </a>

                {/* 3. POST INTERACTIONS (Action Bar) */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-lg">
                      {/* Like button */}
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`transition-all duration-300 hover:scale-125 ${
                          isLiked ? "text-red-500" : "text-[#3B2A25]/60 hover:text-[#9C6A5A]"
                        }`}
                      >
                        {isLiked ? <FaHeart /> : <FaRegHeart />}
                      </button>
                      
                      {/* Comment button */}
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#3B2A25]/60 hover:text-[#9C6A5A] transition-all duration-300 hover:scale-125"
                      >
                        <FaRegComment />
                      </a>
                      
                      {/* Share button */}
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#3B2A25]/60 hover:text-[#9C6A5A] transition-all duration-300 hover:scale-125"
                      >
                        <FiSend />
                      </a>
                    </div>

                    {/* Bookmark button */}
                    <button
                      onClick={() => toggleBookmark(post.id)}
                      className={`transition-all duration-300 hover:scale-125 text-lg ${
                        isBookmarked ? "text-[#9C6A5A]" : "text-[#3B2A25]/60 hover:text-[#9C6A5A]"
                      }`}
                    >
                      {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
                    </button>
                  </div>

                  {/* Likes count */}
                  <div className="text-xs font-bold text-[#3B2A25] text-left tracking-wide">
                    {post.likes} likes
                  </div>

                  {/* Caption */}
                  <div className="text-xs text-[#3B2A25]/80 leading-relaxed font-sans text-left">
                    <span className="font-bold text-[#3B2A25] mr-2">{INSTAGRAM_HANDLE}</span>
                    {post.caption}
                  </div>

                  {/* Timestamp */}
                  <div className="text-[9px] font-bold text-[#3B2A25]/45 tracking-wider text-left uppercase">
                    {post.timeAgo}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InstagramFeed;
