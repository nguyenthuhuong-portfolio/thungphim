"use client";

// ... (Giữ nguyên các import cũ)
import CommentSection from './CommentSection';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, List, Server } from 'lucide-react';
import {
  Play, Search, Loader2, ChevronLeft, ChevronRight,
  Star, Facebook, Zap, Twitter, Youtube, Users
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getMovieHistory } from '@/app/utils/watchHistory';
import GlobalLoading from '@/app/components/GlobalLoading'; // --- MỚI: Import ---

const VideoPlayer = dynamic(() => import('./VideoPlayer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-black">
       <Server size={40} className="animate-pulse mb-2"/>
       <p className="text-xs">Đang tải trình phát...</p>
    </div>
  )
});

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [movie, setMovie] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [currentEp, setCurrentEp] = useState<any>(null);

  // State loading
  const [loading, setLoading] = useState(true);
  const [lastWatchedEpSlug, setLastWatchedEpSlug] = useState<string | null>(null);

  // --- LOGIC TÌM TẬP TIẾP THEO (Giữ nguyên) ---
  const currentEpIndex = episodes.findIndex(e => e.slug === currentEp?.slug);
  const nextEp = (currentEpIndex >= 0 && currentEpIndex < episodes.length - 1)
                 ? episodes[currentEpIndex + 1]
                 : null;

  const handleNextEpisode = () => {
    if (nextEp) setCurrentEp(nextEp);
  };

  // --- LOGIC CHẶN LỖI CONSOLE (Giữ nguyên) ---
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      const errorString = args.join(' ');
      if (
        errorString.includes("$state") ||
        errorString.includes("prop2") ||
        errorString.includes("signal") ||
        errorString.includes("not a function")
      ) return;
      originalError.apply(console, args);
    };
    return () => { console.error = originalError; };
  }, []);

  // --- FETCH DATA (Giữ nguyên logic, chỉ sửa loading) ---
  useEffect(() => {
    const fetchMovieDetail = async () => {
      // setLoading(true); // Không cần set lại true ở đây để tránh nháy màn hình nếu re-render
      try {
        const res = await fetch(`https://ophim1.com/phim/${slug}`);
        const data = await res.json();

        if (data.status) {
          setMovie(data.movie);
          const serverData = data.episodes[0]?.server_data || [];
          setEpisodes(serverData);

          const history = getMovieHistory(slug);
          setLastWatchedEpSlug(history?.episodeSlug || null);

          if (history && history.episodeSlug) {
             const foundEp = serverData.find((e: any) => e.slug === history.episodeSlug);
             setCurrentEp(foundEp || serverData[0]);
          } else {
             if (serverData.length > 0) setCurrentEp(serverData[0]);
          }
        }
      } catch (error) {
        console.error("Lỗi tải phim:", error);
      } finally {
        // --- QUAN TRỌNG: Thêm delay nhỏ 500ms để người dùng kịp nhìn thấy hiệu ứng đẹp ---
        setTimeout(() => {
           setLoading(false);
        }, 800);
      }
    };

    if (slug) fetchMovieDetail();
  }, [slug]);

  const handleSelectEpisode = (ep: any) => {
     setCurrentEp(ep);
  };

  // --- QUAN TRỌNG: KHÔNG RETURN SỚM NỮA ---
  // Chúng ta sẽ render giao diện ngay, nhưng nếu chưa có data (movie null) thì hiển thị rỗng
  // GlobalLoading sẽ che đi tất cả cho đến khi loading = false

  return (
    <div className="min-h-screen bg-[#0f0f13] text-gray-200 font-sans relative">

      {/* --- MÀN HÌNH CHỜ (PRELOADER) --- */}
      <GlobalLoading isLoading={loading} />
      {/* ------------------------------- */}

      {/* NỘI DUNG CHÍNH (Chỉ hiển thị khi đã có data movie, nếu không sẽ bị lỗi null) */}
      {movie && (
        <div className={`transition-opacity duration-1000 ${loading ? 'opacity-0' : 'opacity-100'}`}>

          {/* Header */}
          <header className="fixed top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
            <button onClick={() => router.back()} className="pointer-events-auto bg-white/10 hover:bg-purple-600 backdrop-blur-md p-3 rounded-full text-white transition-all flex items-center gap-2 group">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform"/> <span className="text-sm font-bold">Quay lại</span>
            </button>
          </header>

          {/* VIDEO PLAYER */}
          <div className="w-full h-[35vh] md:h-[80vh] bg-black flex items-center justify-center relative group shadow-2xl shadow-purple-900/10">
            {currentEp ? (
              <VideoPlayer
                title={`${movie.name} - Tập ${currentEp.name}`}
                src={currentEp.link_m3u8}
                movieSlug={slug}
                episodeSlug={currentEp.slug}
                onNext={nextEp ? handleNextEpisode : undefined}
              />
            ) : (
              <div className="text-gray-500 flex flex-col items-center">
                 <Server size={48} className="mb-2"/>
                 <p>Chưa có tập phim nào.</p>
              </div>
            )}
          </div>

          {/* THÔNG TIN & DANH SÁCH TẬP */}
          <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

              {/* Cột Trái */}
              <div className="lg:col-span-2 space-y-6">
                 <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight leading-tight">
                   {movie.name}
                 </h1>
                 <p className="text-lg text-gray-400 font-medium italic">
                   {movie.origin_name} ({movie.year})
                 </p>

                 <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <span className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-lg border border-purple-500/30 flex items-center gap-2">
                       <Clock size={14}/> {movie.time}
                    </span>
                    <span className="bg-white/5 px-3 py-1 rounded-lg border border-white/10 flex items-center gap-2">
                       <Calendar size={14}/> {movie.year}
                    </span>
                    <span className="bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                       {movie.quality}
                    </span>
                    <span className="bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                       {movie.lang}
                    </span>
                 </div>

                 <div className="bg-[#18181b] p-6 rounded-3xl border border-white/5 shadow-xl">
                   <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                     <List size={20} className="text-purple-500"/> Nội dung phim
                   </h3>
                   <div
                     className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap"
                     dangerouslySetInnerHTML={{ __html: movie.content }}
                   />
                 </div>

                 {/* COMMENT */}
                 <CommentSection movieSlug={slug} />
              </div>

              {/* Cột Phải */}
              <div className="lg:col-span-1">
                 <div className="bg-[#16161d] p-6 rounded-3xl border border-white/5 h-fit sticky top-24 max-h-[calc(100vh-120px)] flex flex-col shadow-2xl shadow-black/50">
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2 uppercase tracking-wider shrink-0">
                       Chọn tập phim <span className="text-purple-500 text-xs bg-purple-500/10 px-2 py-0.5 rounded ml-auto">{episodes.length} Tập</span>
                    </h3>

                    <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-3 xl:grid-cols-4 gap-2 overflow-y-auto scrollbar-hide pr-1 flex-1">
                       {episodes.map((ep, i) => {
                          const isHistoryEp = lastWatchedEpSlug === ep.slug;
                          const isActive = currentEp?.slug === ep.slug;

                          return (
                            <button
                              key={i}
                              onClick={() => handleSelectEpisode(ep)}
                              className={`py-3 rounded-xl font-bold text-sm transition-all duration-300 border relative overflow-hidden ${
                                isActive
                                  ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-900/40 scale-105 z-10'
                                  : isHistoryEp
                                    ? 'bg-purple-900/30 text-purple-300 border-purple-500/30'
                                    : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              {isHistoryEp && !isActive && (
                                 <span className="absolute top-0 right-0 w-2 h-2 bg-purple-500 rounded-full animate-pulse m-1"></span>
                              )}
                              {ep.name}
                            </button>
                          );
                       })}
                    </div>
                 </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Nếu loading xong mà không có phim (Lỗi) */}
      {!loading && !movie && (
        <div className="min-h-screen flex flex-col items-center justify-center text-gray-400">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy phim</h1>
          <Link href="/" className="text-purple-500 hover:underline">Quay lại trang chủ</Link>
        </div>
      )}
      {/* --- FOOTER TRANG TÌM KIẾM (COPY TỪ TRANG CHỦ) --- */}
            <footer className="relative mt-auto bg-[#0a0a0c]/80 border-t border-white/5 pt-16 pb-12 px-8 overflow-hidden rounded-t-[3rem] backdrop-blur-md">
                {/* HỌA TIẾT NỀN */}
                <div className="absolute right-[-5%] top-[-20%] opacity-[0.03] pointer-events-none rotate-12 text-purple-600">
                   <Play size={500} strokeWidth={1} />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">

                   {/* BADGE HOÀNG SA & TRƯỜNG SA */}
                   <div className="bg-gradient-to-r from-red-800 to-red-900 text-white text-[14px] font-bold px-4 py-2 rounded-full inline-flex items-center gap-2 mb-10 shadow-lg shadow-red-900/20 border border-white/10 select-none hover:scale-105 transition-transform">
                      <Star size={12} fill="#fbbf24" className="text-yellow-400 animate-pulse" />
                      Hoàng Sa & Trường Sa là của Việt Nam!
                   </div>

                   {/* LOGO & SOCIAL ICONS */}
                   <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-10">
                      {/* Brand Logo */}
                      <Link href="/" className="flex items-center gap-3">
                         <div className="bg-purple-600 p-2.5 rounded-xl text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]">
                            <Play size={28} fill="white" className="ml-1" />
                         </div>
                         <span className="text-4xl font-black text-white tracking-tighter">ThúngPhim</span>
                      </Link>

                      <div className="hidden md:block h-8 w-px bg-white/10 mx-2"></div>

                      {/* Social Icons */}
                      <div className="flex flex-wrap gap-2.5">
                         {[
                           { icon: <Facebook size={18} />, color: "hover:bg-[#1877F2] hover:border-[#1877F2]" },
                           { icon: <Zap size={18} />, color: "hover:bg-purple-500 hover:border-purple-500" },
                           { icon: <Twitter size={18} />, color: "hover:bg-black hover:border-white/20" },
                           { icon: <Youtube size={18} />, color: "hover:bg-[#FF0000] hover:border-[#FF0000]" },
                           { icon: <Users size={18} />, color: "hover:bg-pink-600 hover:border-pink-600" },
                         ].map((item, i) => (
                            <a key={i} href="#" className={`w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 ${item.color} hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg`}>
                               {item.icon}
                            </a>
                         ))}
                      </div>
                   </div>

                   {/* MENU LINK NGANG */}
                   <div className="flex flex-wrap gap-x-8 gap-y-4 mb-8 font-bold text-sm text-gray-300 uppercase tracking-wide">
                      <a href="#" className="hover:text-purple-400 transition-colors">Hỏi-Đáp</a>
                      <a href="#" className="hover:text-purple-400 transition-colors">Chính sách bảo mật</a>
                      <a href="#" className="hover:text-purple-400 transition-colors">Điều khoản sử dụng</a>
                      <a href="#" className="hover:text-purple-400 transition-colors">Giới thiệu</a>
                      <a href="#" className="hover:text-purple-400 transition-colors">Liên hệ</a>
                   </div>

                   {/* MÔ TẢ WEBSITE */}
                   <p className="text-gray-500 text-xs leading-relaxed text-[14px] max-w-4xl mb-8 border-t border-white/5 pt-8">
                      <strong className="text-gray-200">ThúngPhim</strong> - Trang xem phim online chất lượng cao miễn phí Vietsub, thuyết minh, lồng tiếng full HD.
                   </p>

                   {/* COPYRIGHT */}
                   <div className="flex justify-between items-end">
                      <p className="text-gray-600 text-[14px]">© 2026 ThúngPhim Inc.</p>
                   </div>
                </div>
            </footer>

    </div>
  );
}
