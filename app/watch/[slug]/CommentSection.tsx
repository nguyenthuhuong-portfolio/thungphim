"use client";

import { useState, useEffect } from 'react';
import { Send, ThumbsUp, MessageCircle, MoreHorizontal, Trash2, User } from 'lucide-react';

interface Comment {
  id: number;
  user: string;
  avatar: string;
  content: string;
  time: string;
  likes: number;
  isOwner?: boolean; // Đánh dấu comment của chính mình
}

// Dữ liệu giả lập ban đầu (Fake Data)
const FAKE_COMMENTS: Comment[] = [
  { id: 1, user: "Mèo Béo Tu Tiên", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix", content: "Phim này đoạn cuối plot twist đỉnh thực sự! 😱", time: "2 giờ trước", likes: 124 },
  { id: 2, user: "Hacker Lỏ", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack", content: "Web load nhanh vãi, admin dùng Next.js à? Uy tín đấy.", time: "5 giờ trước", likes: 89 },
  { id: 3, user: "Wibu Chúa", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nala", content: "Xin lịch ra tập mới với ad ơi hóng quá :((", time: "1 ngày trước", likes: 45 },
];

export default function CommentSection({ movieSlug }: { movieSlug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [inputVal, setInputVal] = useState("");

  // Key lưu local storage theo từng phim
  const STORAGE_KEY = `thungphim_comments_${movieSlug}`;

  // Load comment từ LocalStorage + Fake Data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setComments(JSON.parse(saved));
    } else {
      setComments(FAKE_COMMENTS);
    }
  }, [movieSlug]);

  // Hàm gửi comment
  const handleSend = () => {
    if (!inputVal.trim()) return;

    const newComment: Comment = {
      id: Date.now(),
      user: "Bạn (Guest)", // Tên người dùng hiện tại
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You", // Avatar ngẫu nhiên cho user
      content: inputVal,
      time: "Vừa xong",
      likes: 0,
      isOwner: true
    };

    const newList = [newComment, ...comments]; // Đưa comment mới lên đầu
    setComments(newList);
    setInputVal("");

    // Lưu vào LocalStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
  };

  // Hàm xóa comment (chỉ xóa của mình)
  const handleDelete = (id: number) => {
    const newList = comments.filter(c => c.id !== id);
    setComments(newList);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
  };

  // Hàm like ảo
  const handleLike = (id: number) => {
    const newList = comments.map(c =>
      c.id === id ? { ...c, likes: c.likes + 1 } : c
    );
    setComments(newList);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
  };

  return (
    <div className="w-full bg-[#18181b] rounded-3xl border border-white/5 p-6 md:p-8 shadow-xl mt-8">

      {/* Tiêu đề */}
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <MessageCircle className="text-purple-500" />
        Bình luận <span className="text-gray-500 text-sm font-normal">({comments.length})</span>
      </h3>

      {/* Ô nhập liệu */}
      <div className="flex gap-4 mb-8">
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=You" className="w-10 h-10 rounded-full bg-white/5 border border-white/10" alt="Avatar" />
        <div className="flex-1 relative">
          <textarea
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Viết bình luận của bạn..."
            className="w-full bg-[#0f0f13] border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-purple-500/50 min-h-[100px] resize-none transition-all placeholder:text-gray-600"
          />
          <button
            onClick={handleSend}
            disabled={!inputVal.trim()}
            className="absolute bottom-3 right-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600 text-white p-2 rounded-lg transition-all shadow-lg"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Danh sách Comment */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-500">
            <img src={comment.avatar} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 shrink-0" alt="Avatar" />

            <div className="flex-1">
              {/* Tên & Thời gian */}
              <div className="flex items-center gap-2 mb-1">
                <span className={`font-bold text-sm ${comment.isOwner ? 'text-purple-400' : 'text-white'}`}>
                  {comment.user}
                </span>
                {comment.isOwner && <span className="text-[10px] bg-white/10 px-1.5 rounded text-gray-400 border border-white/5">Tác giả</span>}
                <span className="text-xs text-gray-500">• {comment.time}</span>
              </div>

              {/* Nội dung */}
              <p className="text-gray-300 text-sm leading-relaxed mb-3">
                {comment.content}
              </p>

              {/* Actions: Like, Reply, Delete */}
              <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                <button
                  onClick={() => handleLike(comment.id)}
                  className="flex items-center gap-1.5 hover:text-purple-400 transition-colors"
                >
                  <ThumbsUp size={14} /> {comment.likes > 0 ? comment.likes : 'Thích'}
                </button>
                <button className="hover:text-white transition-colors">Phản hồi</button>

                {/* Chỉ hiện nút xóa nếu là comment của mình */}
                {comment.isOwner && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-red-500/50 hover:text-red-500 flex items-center gap-1 transition-colors ml-auto md:ml-0 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} /> Xóa
                  </button>
                )}
              </div>
            </div>

            {/* Menu 3 chấm (Trang trí) */}
            <button className="text-gray-600 hover:text-white h-fit opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Load More (Trang trí) */}
      <div className="mt-8 text-center">
        <button className="text-xs font-bold text-gray-500 hover:text-purple-500 transition-colors">
          Xem thêm bình luận cũ hơn
        </button>
      </div>

    </div>
  );
}
