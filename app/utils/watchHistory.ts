// Key lưu trong LocalStorage
const STORAGE_KEY = 'thungphim_history';

export interface HistoryItem {
  movieSlug: string;
  episodeSlug: string;
  currentTime: number;
  duration: number;
  lastUpdated: number;
}

// Lấy lịch sử của một phim cụ thể
export const getMovieHistory = (movieSlug: string): HistoryItem | null => {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    const history = JSON.parse(data);
    return history[movieSlug] || null;
  } catch {
    return null;
  }
};

// Lưu lịch sử xem
export const saveMovieHistory = (
  movieSlug: string,
  episodeSlug: string,
  currentTime: number,
  duration: number
) => {
  if (typeof window === 'undefined') return;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const history = data ? JSON.parse(data) : {};

    history[movieSlug] = {
      movieSlug,
      episodeSlug,
      currentTime,
      duration,
      lastUpdated: Date.now()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Lỗi lưu lịch sử:", error);
  }
};

// ... (Code cũ giữ nguyên)

// --- MỚI: QUẢN LÝ INTRO ---
const INTRO_KEY = 'thungphim_intro_settings';

export const getIntroTime = (movieSlug: string): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const data = localStorage.getItem(INTRO_KEY);
    if (!data) return 0;
    const settings = JSON.parse(data);
    return settings[movieSlug] || 0;
  } catch {
    return 0;
  }
};

export const saveIntroTime = (movieSlug: string, time: number) => {
  if (typeof window === 'undefined') return;
  try {
    const data = localStorage.getItem(INTRO_KEY);
    const settings = data ? JSON.parse(data) : {};

    settings[movieSlug] = time; // Lưu thời gian kết thúc intro

    localStorage.setItem(INTRO_KEY, JSON.stringify(settings));
    console.log(`Đã lưu Intro cho phim ${movieSlug} tại giây thứ ${time}`);
  } catch (error) {
    console.error("Lỗi lưu Intro:", error);
  }
};
