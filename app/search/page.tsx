"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Play, ArrowLeft, Search, Loader2, ChevronLeft, ChevronRight,
  Star, Facebook, Zap, Twitter, Youtube, Users
} from 'lucide-react';
// --- MỚI: Import Loading ---
import GlobalLoading from '@/app/components/GlobalLoading';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const keyword = searchParams.get('keyword') || "";
  const page = Number(searchParams.get('page')) || 1;

  const [movies, setMovies] = useState<any[]>([]);
  // loading này dùng cho Global Loading (màn hình chờ)
  const [loading, setLoading] = useState(true);
  const [inputVal, setInputVal] = useState(keyword);

  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalItemsPerPage: 24,
    currentPage: 1,
    totalPages: 1
  });

  useEffect(() => {
    // Nếu không có keyword thì tắt loading ngay
    if (!keyword) {
      setTimeout(() => setLoading(false), 500);
      return;
    }

    const fetchSearch = async () => {
      // Mỗi lần search hoặc đổi trang đều hiện loading (hoặc bạn có thể bỏ dòng này nếu chỉ muốn hiện lần đầu)
      setLoading(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      try {
        const res = await fetch(`https://ophim1.com/v1/api/tim-kiem?keyword=${keyword}&page=${page}`);
        const data = await res.json();

        if (data.status === 'success' && data.data?.items) {
          const imageBaseUrl = "https://img.ophim.live/uploads/movies/";

          const safeItems = data.data.items.filter((item: any) => {
             const is18Plus = item.category?.some((cat: any) => cat.name === "Phim 18+");
             return !is18Plus;
          });

          const mapped = safeItems.map((item: any) => ({
             title: item.name,
             original_name: item.origin_name,
             slug: item.slug,
             img: `${imageBaseUrl}${item.thumb_url}`,
             year: item.year || 2024,
             ep: item.episode_current
          }));

          setMovies(mapped);

          if (data.data.params && data.data.params.pagination) {
            setPagination({
              totalItems: data.data.params.pagination.totalItems,
              totalItemsPerPage: data.data.params.pagination.totalItemsPerPage,
              currentPage: data.data.params.pagination.currentPage || page,
              totalPages: Math.ceil(data.data.params.pagination.totalItems / data.data.params.pagination.totalItemsPerPage)
            });
          }
        } else {
          setMovies([]);
        }
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
        setMovies([]);
      } finally {
        // --- Delay nhẹ để hiệu ứng mượt mà ---
        setTimeout(() => {
           setLoading(false);
        }, 800);
      }
    };

    fetchSearch();
  }, [keyword, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      router.push(`/search?keyword=${inputVal}&page=1`);
    }
  };

  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      router.push(`/search?keyword=${keyword}&page=${newPage}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white font-sans relative">

      {/* --- 1. MÀN HÌNH CHỜ --- */}
      <GlobalLoading isLoading={loading} />

      {/* --- 2. NỘI DUNG CHÍNH (Fade-in) --- */}
      <div className={`flex flex-col min-h-screen w-full transition-opacity duration-1000 ${loading ? 'opacity-0' : 'opacity-100'}`}>

        {/* HEADER */}
        <header className="sticky top-0 z-50 bg-[#0f0f13]/90 backdrop-blur-md border-b border-white/5 p-4">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft size={24} />
            </Link>

            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Tìm tên phim..."
                className="w-full bg-[#18181b] border border-white/10 rounded-full py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            </form>
          </div>
        </header>

        {/* KẾT QUẢ TÌM KIẾM */}
        <main className="max-w-7xl mx-auto p-4 md:p-8 flex-1 w-full">
          <div className="flex justify-between items-end mb-6">
            <h1 className="text-xl font-bold text-gray-300">
              Kết quả cho: <span className="text-purple-500">"{keyword}"</span>
            </h1>
            <span className="text-xs text-gray-500">
               Trang {pagination.currentPage} / {pagination.totalPages}
            </span>
          </div>

          {movies.length > 0 ? (
            <>
              {/* Grid Phim */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {movies.map((movie, idx) => (
                  <Link href={`/watch/${movie.slug}`} key={idx} className="group relative block overflow-hidden rounded-xl bg-[#18181b]">
                    <div className="aspect-[2/3] w-full overflow-hidden">
                      <img
                        src={movie.img}
                        alt={movie.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-2 right-2 bg-purple-600 text-[10px] font-bold px-2 py-1 rounded shadow-lg">
                         {movie.ep}
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-purple-600 p-3 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform">
                          <Play fill="white" size={20} />
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="truncate font-bold text-sm group-hover:text-purple-400 transition-colors">{movie.title}</h3>
                      <p className="truncate text-xs text-gray-500">{movie.original_name} ({movie.year})</p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Phân trang */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12 pb-8">
                  <button
                    onClick={() => changePage(page - 1)}
                    disabled={page <= 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-full bg-white/5 hover:bg-purple-600 disabled:opacity-30 disabled:hover:bg-white/5 transition-all text-sm font-bold"
                  >
                    <ChevronLeft size={16} /> Trước
                  </button>

                  <div className="flex items-center gap-2">
                     {page > 2 && (
                        <button onClick={() => changePage(1)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-purple-600 flex items-center justify-center text-xs">1</button>
                     )}
                     {page > 3 && <span className="text-gray-600">...</span>}

                     {[page - 1, page, page + 1].map(p => {
                        if (p < 1 || p > pagination.totalPages) return null;
                        return (
                          <button
                            key={p}
                            onClick={() => changePage(p)}
                            className={`w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center transition-all ${
                              p === page
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 scale-110'
                                : 'bg-white/5 hover:bg-white/10 text-gray-400'
                            }`}
                          >
                            {p}
                          </button>
                        );
                     })}

                     {page < pagination.totalPages - 2 && <span className="text-gray-600">...</span>}
                     {page < pagination.totalPages - 1 && (
                        <button onClick={() => changePage(pagination.totalPages)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-purple-600 flex items-center justify-center text-xs">{pagination.totalPages}</button>
                     )}
                  </div>

                  <button
                    onClick={() => changePage(page + 1)}
                    disabled={page >= pagination.totalPages}
                    className="flex items-center gap-1 px-4 py-2 rounded-full bg-white/5 hover:bg-purple-600 disabled:opacity-30 disabled:hover:bg-white/5 transition-all text-sm font-bold"
                  >
                    Tiếp <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <p className="text-lg">Không tìm thấy phim nào.</p>
              <p className="text-sm mt-2">Lưu ý: Các phim 18+ đã bị ẩn khỏi kết quả tìm kiếm.</p>
            </div>
          )}
        </main>

        {/* FOOTER */}
        <footer className="relative mt-auto bg-[#0a0a0c]/80 border-t border-white/5 pt-16 pb-12 px-8 overflow-hidden rounded-t-[3rem] backdrop-blur-md">
            <div className="absolute right-[-5%] top-[-20%] opacity-[0.03] pointer-events-none rotate-12 text-purple-600">
               <Play size={500} strokeWidth={1} />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
               <div className="bg-gradient-to-r from-red-800 to-red-900 text-white text-[14px] font-bold px-4 py-2 rounded-full inline-flex items-center gap-2 mb-10 shadow-lg shadow-red-900/20 border border-white/10 select-none hover:scale-105 transition-transform">
                  <Star size={12} fill="#fbbf24" className="text-yellow-400 animate-pulse" />
                  Hoàng Sa & Trường Sa là của Việt Nam!
               </div>

               <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-10">
                  <Link href="/" className="flex items-center gap-3">
                     <div className="bg-purple-600 p-2.5 rounded-xl text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]">
                        <Play size={28} fill="white" className="ml-1" />
                     </div>
                     <span className="text-4xl font-black text-white tracking-tighter">ThúngPhim</span>
                  </Link>

                  <div className="hidden md:block h-8 w-px bg-white/10 mx-2"></div>

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

               <div className="flex flex-wrap gap-x-8 gap-y-4 mb-8 font-bold text-sm text-gray-300 uppercase tracking-wide">
                  <a href="#" className="hover:text-purple-400 transition-colors">Hỏi-Đáp</a>
                  <a href="#" className="hover:text-purple-400 transition-colors">Chính sách bảo mật</a>
                  <a href="#" className="hover:text-purple-400 transition-colors">Điều khoản sử dụng</a>
                  <a href="#" className="hover:text-purple-400 transition-colors">Giới thiệu</a>
                  <a href="#" className="hover:text-purple-400 transition-colors">Liên hệ</a>
               </div>

               <p className="text-gray-500 text-xs leading-relaxed text-[14px] max-w-4xl mb-8 border-t border-white/5 pt-8">
                  <strong className="text-gray-200">ThúngPhim</strong> - Trang xem phim online chất lượng cao miễn phí Vietsub, thuyết minh, lồng tiếng full HD.
               </p>

               <div className="flex justify-between items-end">
                  <p className="text-gray-600 text-[14px]">© 2026 ThúngPhim Inc.</p>
               </div>
            </div>
        </footer>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<GlobalLoading isLoading={true} />}>
      <SearchContent />
    </Suspense>
  );
}
