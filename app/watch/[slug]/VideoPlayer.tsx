"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  MediaPlayer,
  MediaProvider,
  Poster,
  useMediaState,
  type MediaPlayerInstance
} from '@vidstack/react';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  Settings, Loader2, History, Flag, SkipForward, StepForward,
  RotateCcw, RotateCw
} from 'lucide-react';
import {
  saveMovieHistory, getMovieHistory,
  saveIntroTime, getIntroTime
} from '@/app/utils/watchHistory';
import '@vidstack/react/player/styles/base.css';

interface VideoPlayerProps {
  title: string;
  src: string;
  movieSlug: string;
  episodeSlug: string;
  onNext?: () => void;
}

const formatTime = (seconds: number) => {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export default function VideoPlayer({ title, src, movieSlug, episodeSlug, onNext }: VideoPlayerProps) {
  const playerRef = useRef<MediaPlayerInstance>(null);

  // State Vidstack
  const paused = useMediaState('paused', playerRef);
  const waiting = useMediaState('waiting', playerRef);
  const currentTime = useMediaState('currentTime', playerRef);
  const duration = useMediaState('duration', playerRef);
  const volume = useMediaState('volume', playerRef);
  const muted = useMediaState('muted', playerRef);
  const fullscreen = useMediaState('fullscreen', playerRef);

  // State local
  const [seeking, setSeeking] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [hasRestored, setHasRestored] = useState(false);
  const [introEndTime, setIntroEndTime] = useState(0);
  const [showSetIntroSuccess, setShowSetIntroSuccess] = useState(false);

  // Quản lý ẩn/hiện Controls
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInteract = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (!paused) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [paused]);

  useEffect(() => {
    if (paused) {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    } else {
      handleInteract();
    }
  }, [paused, handleInteract]);

  useEffect(() => {
    setHasRestored(false);
    const savedIntro = getIntroTime(movieSlug);
    setIntroEndTime(savedIntro);
  }, [src, movieSlug]);

  const handleCanPlay = () => {
    if (!hasRestored && playerRef.current) {
       const history = getMovieHistory(movieSlug);
       if (history && history.episodeSlug === episodeSlug && history.currentTime > 5) {
          playerRef.current.currentTime = history.currentTime;
       }
       setHasRestored(true);
       playerRef.current.play();
    }
  };

  useEffect(() => {
    if (!waiting && currentTime > 0 && duration > 0) {
      const timer = setTimeout(() => {
        saveMovieHistory(movieSlug, episodeSlug, currentTime, duration);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentTime, waiting, movieSlug, episodeSlug, duration]);

  useEffect(() => {
    if (!seeking) setSliderValue(currentTime);
  }, [currentTime, seeking]);

  const handleSetIntro = () => {
    if (playerRef.current) {
      const timeNow = playerRef.current.currentTime;
      saveIntroTime(movieSlug, timeNow);
      setIntroEndTime(timeNow);
      setShowSetIntroSuccess(true);
      setTimeout(() => setShowSetIntroSuccess(false), 2000);
    }
  };

  const handleSkipIntro = () => {
    if (playerRef.current) {
      playerRef.current.currentTime = introEndTime;
      playerRef.current.play();
    }
  };

  const handleSeekBackward = () => {
    if (playerRef.current) playerRef.current.currentTime = Math.max(0, currentTime - 5);
    handleInteract();
  };

  const handleSeekForward = () => {
    if (playerRef.current) playerRef.current.currentTime = Math.min(duration, currentTime + 5);
    handleInteract();
  };

  const handleSeekStart = () => {
    setSeeking(true);
    handleInteract();
  };

  // Hàm này quan trọng: Cập nhật sliderValue ngay khi kéo
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderValue(parseFloat(e.target.value));
    handleInteract();
  };

  const handleSeekEnd = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    if (playerRef.current) {
      const newTime = parseFloat((e.target as HTMLInputElement).value);
      playerRef.current.currentTime = newTime;
      saveMovieHistory(movieSlug, episodeSlug, newTime, duration);
    }
    setSeeking(false);
    handleInteract();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (playerRef.current) {
      playerRef.current.volume = parseFloat(e.target.value);
      if (playerRef.current.muted && parseFloat(e.target.value) > 0) {
        playerRef.current.muted = false;
      }
    }
    handleInteract();
  };

  return (
    <div
      className="relative w-full h-full bg-black group overflow-hidden select-none"
      onMouseMove={handleInteract}
      onTouchStart={handleInteract}
      onClick={handleInteract}
      onMouseLeave={() => !paused && setShowControls(false)}
    >
      <MediaPlayer
        ref={playerRef}
        title={title}
        src={src}
        aspectRatio="16/9"
        load="eager"
        className="w-full h-full"
        autoplay
        onCanPlay={handleCanPlay}
      >
        <MediaProvider>
          <Poster className="object-cover w-full h-full opacity-0 data-[visible]:opacity-100 transition-opacity" />
        </MediaProvider>

        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`} />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {waiting && <Loader2 className="animate-spin text-purple-500" size={64} />}
          {!waiting && paused && (
            <div className="bg-purple-600/80 backdrop-blur-sm p-6 rounded-full shadow-2xl scale-125 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
              <Play fill="white" className="ml-1 text-white" size={48} />
            </div>
          )}
        </div>

        {introEndTime > 0 && currentTime < introEndTime && currentTime > 1 && (
           <div className={`absolute bottom-24 left-6 z-30 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
              <button
                onClick={handleSkipIntro}
                className="bg-white text-black hover:bg-gray-200 font-bold px-6 py-3 rounded-lg flex items-center gap-2 shadow-xl transition-colors text-base pointer-events-auto"
              >
                <SkipForward size={20} fill="black" /> Bỏ qua Intro
              </button>
           </div>
        )}

        {showSetIntroSuccess && (
           <div className="absolute top-6 right-6 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 text-base font-bold">
              <Flag size={20} fill="white" /> Đã lưu mốc Intro!
           </div>
        )}

        <div
          className="absolute inset-0 z-10"
          onClick={() => paused ? playerRef.current?.play() : playerRef.current?.pause()}
          onDoubleClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            if (x < rect.width / 2) handleSeekBackward();
            else handleSeekForward();
          }}
        />

        <div className={`absolute bottom-0 left-0 w-full px-6 pb-6 pt-12 flex flex-col gap-4 z-20 pointer-events-auto transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>

          {/* --- THANH THỜI GIAN (Đã Fix Lỗi Lệch Chuột) --- */}
          <div className="relative w-full h-5 flex items-center group/slider">

             {/* 1. Phần hiển thị (Visual): Thêm pointer-events-none để chuột xuyên qua */}
             <div className="absolute w-full h-[4px] bg-white/30 rounded-full group-hover/slider:h-[6px] transition-all overflow-hidden pointer-events-none">
                <div className="h-full bg-purple-600 absolute left-0 top-0" style={{ width: `${(sliderValue / (duration || 1)) * 100}%` }} />
                {introEndTime > 0 && (
                  <div
                     className="absolute h-full w-[3px] bg-yellow-400 z-10"
                     style={{ left: `${(introEndTime / (duration || 1)) * 100}%` }}
                  />
                )}
             </div>

             {/* 2. Phần điều khiển (Input): Thêm z-20 để nằm đè lên trên tất cả */}
             <input
                type="range" min={0} max={duration || 100} step={0.1}
                value={sliderValue}
                onMouseDown={handleSeekStart} onTouchStart={handleSeekStart}
                onChange={handleSeekChange}
                onMouseUp={handleSeekEnd} onTouchEnd={handleSeekEnd}
                className="absolute w-full h-full opacity-0 cursor-pointer z-20"
             />

             {/* 3. Nút tròn (Thumb): Pointer-events-none */}
             <div
                className="absolute h-4 w-4 bg-white rounded-full shadow-md pointer-events-none opacity-0 group-hover/slider:opacity-100 transition-opacity z-20"
                style={{ left: `${(sliderValue / (duration || 1)) * 100}%`, transform: 'translateX(-50%)' }}
             />
          </div>
          {/* -------------------------------------------------- */}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">

              <button onClick={handleSeekBackward} className="hover:text-purple-400 transition-colors group relative" title="Lùi 5 giây">
                  <RotateCcw size={24} />
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] bg-black px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">-5s</span>
              </button>

              <button onClick={() => paused ? playerRef.current?.play() : playerRef.current?.pause()} className="hover:text-purple-400 transition-colors">
                {paused ? <Play fill="white" size={28} /> : <Pause fill="white" size={28} />}
              </button>

              <button onClick={handleSeekForward} className="hover:text-purple-400 transition-colors group relative" title="Tiến 5 giây">
                  <RotateCw size={24} />
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] bg-black px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">+5s</span>
              </button>

              {onNext && (
                <button onClick={onNext} className="hover:text-purple-400 transition-colors" title="Tập tiếp theo">
                  <StepForward fill="white" size={24} />
                </button>
              )}

              <div className="group/vol flex items-center gap-2">
                 <button onClick={() => playerRef.current!.muted = !muted} className="hover:text-purple-400 transition-colors">
                    {muted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                 </button>
                 <div className="w-0 overflow-hidden group-hover/vol:w-24 transition-all duration-300 flex items-center">
                   <input
                     type="range" min={0} max={1} step={0.05}
                     value={muted ? 0 : volume}
                     onChange={handleVolumeChange}
                     className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer"
                   />
                 </div>
              </div>

              <div className="text-sm md:text-base font-bold text-gray-200 font-mono tracking-wide">
                 {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center gap-5">
               {hasRestored && currentTime > 5 && (
                  <span className="hidden md:flex text-xs text-purple-400 items-center gap-1 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20 font-bold">
                     <History size={14} /> Đã khôi phục
                  </span>
               )}

              <span className="text-sm md:text-base font-bold text-gray-300 hidden md:block truncate max-w-[250px]">{title}</span>

              <button
                 onClick={handleSetIntro}
                 className="hover:text-yellow-400 text-gray-400 transition-colors relative group/intro-btn"
              >
                 <Flag size={22} />
                 <span className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover/intro-btn:opacity-100 transition-opacity">
                    Set Intro
                 </span>
              </button>

              <button className="hover:text-purple-400 transition-colors"><Settings size={22} /></button>
              <button onClick={() => fullscreen ? playerRef.current?.exitFullscreen() : playerRef.current?.enterFullscreen()} className="hover:text-purple-400 transition-colors">
                {fullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
              </button>
            </div>
          </div>

        </div>
      </MediaPlayer>
    </div>
  );
}
