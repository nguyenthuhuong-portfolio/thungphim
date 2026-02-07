"use client";

import { useRouter } from 'next/navigation';
import GlobalLoading from '@/app/components/GlobalLoading';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Home, Compass, BookOpen, Heart, Clock, Download,
  Settings, LogOut, Search, Bell, Play, ChevronRight,
  Tv, Film, TrendingUp, Flame, Star, Info,
  Calendar, Users, Sword, Ghost, Smile, List, CircleHelp,
  Zap, Clapperboard, MonitorPlay, ListChecks,
  Facebook, Youtube, Twitter
} from 'lucide-react';
import MovieCard from '@/app/components/MovieCard';

// --- CẬP NHẬT INTERFACE ĐẦY ĐỦ ---
interface Movie {
  title: string;
  original_name: string;
  description: string;
  img: string;
  thumb: string;
  poster: string;
  ep: string;
  slug: string;
  year: number;
  quality: string;
  category: string[]; // Quan trọng: Phải là mảng chuỗi (string[])
}

export default function MoviePage() {
  const [currentHero, setCurrentHero] = useState(0);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(keyword)}`);
    }
  };

  const [heroMovies, setHeroMovies] = useState<Movie[]>([]);
  const [top10Movies, setTop10Movies] = useState<Movie[]>([]);
  const [moviesCinema, setMoviesCinema] = useState<Movie[]>([]);
  const [moviesSeries, setMoviesSeries] = useState<Movie[]>([]);
  const [moviesChinese, setMoviesChinese] = useState<Movie[]>([]);
  const [moviesCompleted, setMoviesCompleted] = useState<Movie[]>([]);

  const top10Ref = useRef<HTMLDivElement>(null);

  // --- HÀM XỬ LÝ DỮ LIỆU (FIX LỖI TẠI ĐÂY) ---
  const mapMovieData = (item: any): Movie => {
    const imageBaseUrl = "https://img.ophim.live/uploads/movies/";
    return {
      title: item.name,
      original_name: item.origin_name,
      description: item.content || "Đang cập nhật...",
      img: `${imageBaseUrl}${item.thumb_url}`,
      thumb: `${imageBaseUrl}${item.thumb_url}`,
      poster: `${imageBaseUrl}${item.poster_url}`,
      quality: item.quality,
      // --- FIX LỖI: Lấy ra mảng tên thể loại thay vì để nguyên object ---
      category: item.category?.map((c: any) => c.name) || [],
      // ----------------------------------------------------------------
      ep: item.episode_current,
      slug: item.slug,
      year: item.year
    };
  };

  const fetchMovies = async (type: string, category: string, setter: React.Dispatch<React.SetStateAction<Movie[]>>, limit: number = 10) => {
    try {
      let res;
      if (type == "quoc-gia") res = await fetch(`https://ophim1.com/v1/api/quoc-gia/${category}`);
      else res = await fetch(`https://ophim1.com/v1/api/danh-sach/${category}`);

      const data = await res.json();
      if (data && data.data.items) {
        const safeItems = data.data.items.filter((item: any) =>
          !item.category?.some((cat: any) => cat.name === "Phim 18+")
        );
        setter(safeItems.slice(0, limit).map(mapMovieData));
      }
    } catch (error) {
      console.error(`Lỗi tải phim ${category}:`, error);
    }
  };

  useEffect(() => {
    fetchMovies('danh-sach', 'phim-chieu-rap', setMoviesCinema, 12);
    fetchMovies('danh-sach', 'phim-bo', setMoviesSeries, 12);
    fetchMovies('quoc-gia', 'trung-quoc', setMoviesChinese, 12);
    fetchMovies('danh-sach', 'phim-bo-hoan-thanh', setMoviesCompleted, 12);

    const fetchHero = async () => {
      try {
         const res = await fetch('https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=1');
         const data = await res.json();
         if (data.items) {
            const safeItems = data.items.filter((item: any) =>
               !item.category?.some((cat: any) => cat.name === "Phim 18+")
            );
            const mapped = safeItems.slice(0, 10).map(mapMovieData);
            console.log(mapped);
            setHeroMovies(mapped.slice(0, 5));
            setTop10Movies(mapped);
         }
      } catch (e) { console.error(e); } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchHero();
  }, []);

  useEffect(() => {
    if (heroMovies.length === 0) return;
    const timer = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroMovies.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroMovies]);

  const getRankColor = (index: number) => {
    if (index === 0) return "text-yellow-400";
    if (index === 1) return "text-gray-300";
    if (index === 2) return "text-orange-400";
    return "text-white/10";
  };

  const scrollContainer = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
      ref.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f0f13] text-gray-400">
      <GlobalLoading isLoading={loading} />

      <div className={`flex w-full h-full transition-opacity duration-1000 ${loading ? 'opacity-0' : 'opacity-100'}`}>

      {/* SIDEBAR */}
      <aside className="w-64 flex flex-col border-r border-white/5 bg-[#16161d]/50 backdrop-blur-xl p-6 shrink-0 z-50">
        <div className="flex items-center gap-3 mb-8 px-2 italic font-black text-white text-2xl">
          <div className="bg-purple-600 p-2 rounded-xl shadow-lg shadow-purple-500/20">
            <Play size={20} fill="white" />
          </div>
          ThúngPhim
        </div>
        <nav className="flex-1 -space-y-9 overflow-y-auto scrollbar-hide pr-2">
          <section>
            <p className="px-4 text-[10px] uppercase tracking-[2px] font-bold text-gray-500 mb-3">Menu Chính</p>
            <ul className="space-y-1">
              <SideItem icon={<Home size={18} />} label="Trang chủ" active />
              <SideItem icon={<Compass size={18} />} label="Khám phá" />
              <SideItem icon={<TrendingUp size={18} />} label="BXH Thịnh hành" />
              <SideItem icon={<Calendar size={18} />} label="Lịch ra mắt" />
              <SideItem icon={<Users size={18} />} label="Cộng đồng" />
            </ul>
          </section>
          <section>
            <p className="px-4 text-[10px] uppercase tracking-[2px] font-bold text-gray-500 mb-3">Thể Loại</p>
            <ul className="space-y-1">
              <SideItem icon={<Sword size={18} />} label="Hành động" />
              <SideItem icon={<Ghost size={18} />} label="Kinh dị & Ma" />
              <SideItem icon={<Smile size={18} />} label="Hài hước" />
              <SideItem icon={<Heart size={18} />} label="Tình cảm" />
            </ul>
          </section>
          <section>
            <p className="px-4 text-[10px] uppercase tracking-[2px] font-bold text-gray-500 mb-3">Cá Nhân</p>
            <ul className="space-y-1">
              <SideItem icon={<Clock size={18} />} label="Đã xem gần đây" />
              <SideItem icon={<List size={18} />} label="Danh sách của tôi" />
              <SideItem icon={<Download size={18} />} label="Tải xuống" />
            </ul>
          </section>
        </nav>
        <div className="mt-auto pt-6 border-t border-white/5 space-y-1">
          <SideItem icon={<Settings size={18} />} label="Cài đặt" />
          <SideItem icon={<CircleHelp size={18} />} label="Trợ giúp" />
          <SideItem icon={<LogOut size={18} />} label="Đăng xuất" />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-10 pt-3 pb-0 bg-gradient-to-br from-[#12121a] to-[#0f0f13] scrollbar-hide">
        <header className="flex justify-between items-center mb-6">
          <form onSubmit={handleSearch} className="relative w-full max-w-xl group">
            <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-500 transition-colors">
              <Search size={18} />
            </button>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm kiếm phim, diễn viên..."
              className="w-full bg-[#1a1a24] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-purple-500/30 text-sm shadow-xl outline-none text-gray-200 placeholder-gray-600 transition-all"
            />
          </form>
          <div className="flex items-center gap-6">
            <Bell size={20} className="cursor-pointer" />
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-12 h-12 rounded-2xl border-2 border-purple-500/50 bg-[#1a1a24]" alt="Avatar" />
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="relative w-[98%] h-[500px] md:h-auto md:aspect-video mb-10 rounded-2xl md:rounded-3xl overflow-hidden group shadow-2xl p-0 mx-auto">
          {heroMovies.map((movie, index) => (
            <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentHero ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <img src={movie.poster} className="h-full w-full object-cover object-center" alt={movie.title} />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f13] via-[#0f0f13]/40 to-transparent"></div>
              <div className="absolute bottom-12 left-12 max-w-xl">
                <div className="flex gap-2 mb-4">
                  <span className="bg-purple-600/20 backdrop-blur-md text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    🔥 Thịnh hành hôm nay
                  </span>
                </div>
                <h2 className="text-6xl font-black text-white mb-4 leading-tight italic uppercase tracking-tighter drop-shadow-2xl">{movie.title}</h2>
                <div className="text-gray-300 text-lg mb-8 line-clamp-2 font-medium" dangerouslySetInnerHTML={{ __html: movie.original_name }} />

                <div className="flex gap-4">
                  <Link href={`/watch/${movie.slug}`} className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 uppercase text-xs shadow-lg shadow-purple-600/30">
                    <Play size={18} fill="white" className="pl-0.5" /> Xem ngay
                  </Link>
                  <button className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-4 rounded-2xl border border-white/10">
                    <Info size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div className="absolute bottom-8 right-12 z-20 flex gap-3">
            {heroMovies.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentHero ? 'w-8 bg-purple-500' : 'w-2 bg-white/30'}`} />
            ))}
          </div>
        </section>

        {/* TOP 10 */}
        <section className="pt-12 mb-8">
           <div className="flex justify-between items-center mb-1 px-1">
            <div className="flex items-center gap-3">
              <Flame className="text-orange-500 animate-pulse" size={32} />
              <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Top 10 trong tháng</h3>
            </div>
            <div className="flex gap-2">
              <button onClick={() => scrollContainer(top10Ref, 'left')} className="p-2 bg-white/5 hover:bg-purple-600 text-white rounded-full transition-all border border-white/5"><ChevronRight className="rotate-180" size={18} /></button>
              <button onClick={() => scrollContainer(top10Ref, 'right')} className="p-2 bg-white/5 hover:bg-purple-600 text-white rounded-full transition-all border border-white/5"><ChevronRight size={18} /></button>
            </div>
          </div>
          <div ref={top10Ref} className="flex gap-14 overflow-x-auto pb-12 pt-10 scrollbar-hide snap-x snap-mandatory scroll-smooth">
            {top10Movies.map((movie, i) => (
              <div key={i} className="relative min-w-[280px] group cursor-pointer snap-start transition-all duration-300 hover:z-50">
                <span className={`absolute -left-10 bottom-6 text-[160px] font-black italic leading-none z-20 select-none number-shadow ${getRankColor(i)} transition-all duration-500 group-hover:opacity-0 group-hover:scale-150 group-hover:translate-x-10`}>
                  {i + 1}
                </span>
                <Link href={`/watch/${movie.slug}`} className="block relative z-10 rounded-[2.5rem] overflow-hidden aspect-[2/3] border border-white/10 shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-4 group-hover:shadow-purple-500/50">
                  <img src={movie.thumb} className="w-full h-full object-cover" alt={movie.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6 translate-y-4 group-hover:translate-y-0">
                    <h4 className="text-white font-black text-lg uppercase mb-2 leading-tight drop-shadow-lg">{movie.title}</h4>
                    <div className="text-gray-200 text-xs line-clamp-4 leading-relaxed font-medium mb-4 drop-shadow-md" dangerouslySetInnerHTML={{ __html: movie.original_name }} />
                    <button className="bg-purple-600 text-white text-[10px] font-bold py-2 px-4 rounded-xl uppercase tracking-widest w-fit hover:bg-purple-700 transition-colors shadow-lg">
                      Xem ngay
                    </button>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* CÁC SECTION DANH SÁCH */}
        <MovieSection
          title="Bom Tấn Chiếu Rạp Mới"
          icon={<Clapperboard size={20} className="text-white" />}
          gradient="from-red-600 to-orange-500"
          movies={moviesCinema}
        />

        <MovieSection
          title="Phim Bộ Thịnh Hành"
          icon={<MonitorPlay size={20} className="text-white" />}
          gradient="from-blue-600 to-cyan-400"
          movies={moviesSeries}
        />

        <MovieSection
          title="Phim Trung Quốc"
          icon={<Film size={20} className="text-white" />}
          gradient="from-yellow-500 to-amber-300"
          movies={moviesChinese}
        />

        <MovieSection
          title="Phim Bộ Đã Hoàn Thành"
          icon={<ListChecks size={20} className="text-white" />}
          gradient="from-green-500 to-emerald-400"
          movies={moviesCompleted}
        />

        {/* FOOTER */}
        <footer className="relative mt-24 bg-[#0a0a0c]/80 border-t border-white/5 pt-16 pb-12 px-8 overflow-hidden rounded-t-[3rem] backdrop-blur-md">
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
      </main>
      </div>
    </div>
  );
}

function MovieSection({ title, icon, gradient, movies }: { title: string, icon: any, gradient: string, movies: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="-mb-8 !py-0 relative hover:z-50 transition-all duration-300">
      <div className="flex justify-between items-center -mb-5 px-4 relative z-20">
        <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
          <div className={`bg-gradient-to-tr ${gradient} p-2 rounded-xl shadow-lg animate-pulse`}>
            {icon}
          </div>
          {title}
        </h3>
        <div className="flex gap-2">
          <button onClick={() => scroll('left')} className="p-2 bg-white/5 hover:bg-purple-600 text-white rounded-full transition-all border border-white/5"><ChevronRight className="rotate-180" size={18} /></button>
          <button onClick={() => scroll('right')} className="p-2 bg-white/5 hover:bg-purple-600 text-white rounded-full transition-all border border-white/5"><ChevronRight size={18} /></button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-16 pt-10 pb-20 -ml-12 pointer-events-auto"
      >
        {movies.map((m, i) => (
          <div key={i} className="relative w-[230px] shrink-0 z-0 hover:z-50 transition-all duration-300">
             <MovieCard data={m} />
          </div>
        ))}
      </div>
    </section>
  );
}

function SideItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <li className={`flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer transition-all ${active ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'hover:bg-white/5 hover:text-white text-gray-500'}`}>
      {icon} <span className="text-sm font-bold">{label}</span>
    </li>
  );
}
