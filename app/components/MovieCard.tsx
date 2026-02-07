"use client";

import { useState, useRef } from 'react'; // Thêm useState, useRef
import Link from 'next/link';
import { Play } from 'lucide-react';

interface MovieProps {
  data: {
    title: string;
    original_name?: string;
    thumb: string;
    poster: string;
    year: number;
    quality: string;
    ep: string;
    slug: string;
    description?: string;
    category?: string[];
  };
}

export default function MovieCard({ data }: MovieProps) {
  const truncatedTitle = data.title.length > 40 ? data.title.substring(0, 40) + "..." : data.title;

  // --- STATE & REF CHO HOVER DELAY ---
  const [isDelayedHover, setIsDelayedHover] = useState(false); // Trạng thái đã hover đủ lâu chưa
  const timerRef = useRef<NodeJS.Timeout | null>(null); // Biến lưu bộ đếm giờ

  const handleMouseEnter = () => {
    // Bắt đầu đếm 800ms (0.8s)
    timerRef.current = setTimeout(() => {
      setIsDelayedHover(true);
    }, 800);
  };

  const handleMouseLeave = () => {
    // Chuột rời đi thì hủy đếm giờ ngay và tắt trạng thái hover
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsDelayedHover(false);
  };
  // -----------------------------------

  return (
    <Link
      href={`/watch/${data.slug}`}
      className="group relative block w-full h-full"
      // Gắn sự kiện chuột vào thẻ bao ngoài
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >

      {/* --- PHẦN POSTER & OVERLAY --- */}
      <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-[#18181b] shadow-lg shadow-purple-900/5 border border-white/5 transition-all duration-300 group-hover:shadow-purple-600/20 group-hover:border-purple-500/30">

        {/* 1. Ảnh Poster gốc (Zoom ngay lập tức khi chạm chuột - dùng group-hover của CSS) */}
        <img
          src={data.thumb}
          alt={data.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />

        {/* 2. Badge Thông tin tập (Luôn hiện) */}
        <div className="absolute top-2 right-2 z-20">
           <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md uppercase tracking-wider">
             {data.ep.replace('Tập ', '')}
           </span>
        </div>

        {/* 3. Lớp phủ thông tin (CHỈ HIỆN SAU 0.8s - Dựa vào state isDelayedHover) */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-500 z-10 flex flex-col justify-between p-3
            ${isDelayedHover ? 'opacity-100' : 'opacity-0 pointer-events-none'}`
        }>

           {/* Badge chất lượng */}
           <div className={`self-start transform transition-all duration-500 delay-100
               ${isDelayedHover ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`
           }>
              <span className="bg-black/60 backdrop-blur-md text-white text-[12px] font-bold border border-white/20 px-1.5 py-0.5 rounded-[4px]">
                {data.quality}
              </span>
           </div>

           {/* Nút Play ở giữa */}
           <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform transition-all duration-500 ease-out
               ${isDelayedHover ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`
           }>
              <div className="w-14 h-14 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 backdrop-blur-sm border border-white/20 hover:bg-purple-500 hover:scale-110 transition-transform cursor-pointer pointer-events-auto">
                 <Play size={24} fill="currentColor" className="ml-1" />
              </div>
           </div>

           {/* Thể loại */}
           <div className={`mt-auto transform transition-all duration-500 delay-200
               ${isDelayedHover ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`
           }>
              <div className="flex flex-wrap gap-1 items-center justify-center">
                 {data.category?.slice(0, 2).map((cat, i) => (
                    <span key={i} className="text-[12px] text-gray-300 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-md font-medium truncate max-w-[80px]">
                       {cat}
                    </span>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* --- PHẦN THÔNG TIN DƯỚI POSTER --- */}
      <div className="mt-3 px-1">
         {/* Tên phim - ĐÃ TĂNG CỠ CHỮ (text-base) */}
         <h3
            className="text-white font-bold text-base leading-snug line-clamp-2 group-hover:text-purple-400 transition-colors duration-300 mb-1"
            title={data.title}
         >
            {truncatedTitle}
         </h3>

         {/* Năm & Tên gốc */}
         <div className="flex items-center gap-2 text-[13px] text-gray-500 font-medium truncate">
            <span>{data.year}</span>
            {data.original_name && (
               <>
                 <span className="text-gray-700">•</span>
                 <span className="truncate">{data.original_name}</span>
               </>
            )}
         </div>
      </div>

    </Link>
  );
}
