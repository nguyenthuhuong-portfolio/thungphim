"use client";

import MovieCard from '@/app/components/MovieCard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Dữ liệu giả để test
const DUMMY_MOVIES = Array(12).fill(null).map((_, i) => ({
  title: i % 2 === 0 ? "Thanh Gươm Diệt Quỷ: Đại Trụ Đặc Huấn" : "Gia Đình Điệp Viên Code: White",
  poster: i % 2 === 0
    ? "https://img.ophim.live/uploads/movies/phong-vu-thumb.jpg"
    : "https://img.ophim.live/uploads/movies/nu-hoang-co-vua-2026-thumb.jpg",
  backdrop: i % 2 === 0
    ? "https://img.ophim.live/uploads/movies/phong-vu-poster.jpg"
    : "https://img.ophim.live/uploads/movies/nu-hoang-co-vua-2026-poster.jpg",
  year: 2024,
  quality: "FHD",
  ep: "Full Vietsub",
  slug: "test-phim",
  description: "Tanjiro đến nơi ở của Nham Trụ Himejima để tu luyện chuẩn bị cho trận chiến sắp tới.",
  category: ["Hành động", "Hoạt hình", "Nhật Bản"]
}));

export default function TestPage() {
  return (
    <div className="min-h-screen bg-[#0f0f13] p-10 text-white">

      {/* Header trang test */}
      <div className="flex items-center gap-4 mb-10">
        <Link href="/" className="bg-white/10 p-3 rounded-full hover:bg-white/20">
          <ArrowLeft />
        </Link>
        <div>
           <h1 className="text-3xl font-bold">Thử nghiệm UI: Movie Card</h1>
           <p className="text-gray-400 text-sm">Rê chuột vào poster và giữ khoảng 0.5s để xem hiệu ứng.</p>
        </div>
      </div>

      {/* Grid hiển thị card */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 gap-y-8">
        {DUMMY_MOVIES.map((movie, idx) => (
          <MovieCard key={idx} data={movie} />
        ))}
      </div>

    </div>
  );
}
