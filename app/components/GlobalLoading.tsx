"use client";

import { Play, Loader2 } from 'lucide-react';

interface GlobalLoadingProps {
  isLoading: boolean;
}

export default function GlobalLoading({ isLoading }: GlobalLoadingProps) {
  // Nếu đang loading thì hiện (opacity-100), xong thì ẩn (opacity-0) và chìm xuống (pointer-events-none)
  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#0f0f13] flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out ${
        isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Logo hiệu ứng nhịp tim */}
      <div className="relative mb-8 animate-pulse">
        <div className="bg-purple-600 p-6 rounded-3xl shadow-[0_0_50px_rgba(147,51,234,0.6)]">
           <Play size={48} fill="white" className="text-white ml-1" />
        </div>
      </div>

      {/* Tên thương hiệu */}
      <h1 className="text-3xl font-black text-white tracking-tighter mb-8 animate-bounce">
        ThúngPhim
      </h1>

      {/* Vòng xoay loading */}
      <div className="flex items-center gap-3 text-purple-500 font-bold text-sm uppercase tracking-widest">
         <Loader2 size={20} className="animate-spin" />
         Đang tải dữ liệu...
      </div>

      {/* Thanh progress giả lập (cho đẹp) */}
      <div className="w-64 h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
         <div className="h-full bg-purple-600 w-1/2 animate-[loading_1s_ease-in-out_infinite]"></div>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
