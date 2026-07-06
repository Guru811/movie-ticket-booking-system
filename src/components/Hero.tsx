import React, { useState, useEffect } from 'react';
import { Movie } from '../types';
import { Play, Calendar, Star, ChevronLeft, ChevronRight, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeroProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
}

export const Hero: React.FC<HeroProps> = ({ movies, onSelectMovie }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeMovies = movies.filter(m => !m.isComingSoon);

  useEffect(() => {
    if (activeMovies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeMovies.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [activeMovies.length]);

  if (activeMovies.length === 0) return null;

  const activeMovie = activeMovies[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeMovies.length) % activeMovies.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeMovies.length);
  };

  return (
    <div id="hero-banner" className="relative h-[480px] sm:h-[540px] md:h-[600px] w-full overflow-hidden bg-[#040406]">
      {/* Background Image with Ambient Glow */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMovie.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.45, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${activeMovie.banner})` }}
        />
      </AnimatePresence>

      {/* Dark Overlays for Cinematic Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/50 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl space-y-4 md:space-y-6">
            {/* Genre Tags */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap gap-2"
            >
              <span className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                Trending Now
              </span>
              {activeMovie.genre.map((g) => (
                <span key={g} className="bg-white/5 border border-white/10 text-zinc-300 text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-md">
                  {g}
                </span>
              ))}
            </motion.div>

            {/* Title */}
            <motion.h1
              key={`title-${activeMovie.id}`}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none"
            >
              {activeMovie.title}
            </motion.h1>

            {/* Rating / Metadata */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4 text-xs sm:text-sm text-zinc-300 font-medium"
            >
              <div className="flex items-center gap-1.5 text-amber-400">
                <Star size={16} className="fill-amber-400 stroke-none" />
                <span>{activeMovie.rating} / 5</span>
                <span className="text-zinc-500 text-xs">({activeMovie.ratingsCount} votes)</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              <span>{Math.floor(activeMovie.duration / 60)}h {activeMovie.duration % 60}m</span>
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{activeMovie.releaseDate}</span>
              </div>
            </motion.div>

            {/* Description */}
            <motion.p
              key={`desc-${activeMovie.id}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl line-clamp-3"
            >
              {activeMovie.description}
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <button
                onClick={() => onSelectMovie(activeMovie)}
                className="bg-gradient-to-r from-amber-400 via-rose-500 to-rose-600 hover:from-amber-300 hover:via-rose-400 hover:to-rose-500 text-zinc-950 font-extrabold text-sm px-6 py-3 rounded-xl transition-all shadow-xl shadow-rose-500/20 flex items-center gap-2 transform active:scale-95 cursor-pointer"
              >
                <Ticket size={18} className="stroke-[2.5]" />
                Book Tickets
              </button>
              {activeMovie.trailer && (
                <a
                  href={activeMovie.trailer.replace('embed/', 'watch?v=')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-zinc-300 text-sm font-semibold px-6 py-3 rounded-xl transition-all flex items-center gap-2 backdrop-blur-md active:scale-95"
                >
                  <Play size={16} className="fill-zinc-300 stroke-none" />
                  Watch Trailer
                </a>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Slide Navigation Buttons */}
      <div className="absolute bottom-6 right-6 sm:right-12 flex items-center gap-3 z-10">
        <button
          onClick={handlePrev}
          className="w-10 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition-all backdrop-blur-md"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={handleNext}
          className="w-10 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition-all backdrop-blur-md"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Progress Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {activeMovies.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === currentIndex ? 'w-6 bg-rose-500 shadow-md shadow-rose-500/50' : 'w-2 bg-zinc-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
