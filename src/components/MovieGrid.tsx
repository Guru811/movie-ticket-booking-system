import React, { useState } from 'react';
import { Movie } from '../types';
import { Search, Star, Film, SlidersHorizontal, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';

interface MovieGridProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
}

export const MovieGrid: React.FC<MovieGridProps> = ({ movies, onSelectMovie }) => {
  const { user, toggleFavourite, isFavourite } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [activeTab, setActiveTab] = useState<'showing' | 'upcoming'>('showing');
  const [showFilters, setShowFilters] = useState(false);

  // Derive unique genres and languages
  const genres = ['All', ...Array.from(new Set(movies.flatMap((m) => m.genre)))];
  const languages = ['All', ...Array.from(new Set(movies.flatMap((m) => m.language)))];

  const filteredMovies = movies.filter((movie) => {
    // Tab filtering
    const tabMatch = activeTab === 'upcoming' ? movie.isComingSoon : !movie.isComingSoon;

    // Search query
    const searchMatch =
      movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.director.toLowerCase().includes(searchTerm.toLowerCase());

    // Genre
    const genreMatch = selectedGenre === 'All' || movie.genre.includes(selectedGenre);

    // Language
    const langMatch = selectedLanguage === 'All' || movie.language.includes(selectedLanguage);

    return tabMatch && searchMatch && genreMatch && langMatch;
  });

  return (
    <div id="movies-catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Search and Quick Tabs Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 p-1 rounded-xl w-fit self-start backdrop-blur-md">
          <button
            onClick={() => setActiveTab('showing')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'showing'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-zinc-950 shadow-md shadow-rose-500/10'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Now Showing
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-zinc-950 shadow-md shadow-rose-500/10'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Coming Soon
          </button>
        </div>

        {/* Search Input and Filter Toggle */}
        <div className="flex items-center gap-3 w-full md:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-zinc-500" size={16} />
            <input
              type="text"
              placeholder="Search movies, genres, cast..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-rose-500/50 text-zinc-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none transition-all placeholder:text-zinc-500"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border border-white/10 transition-all ${
              showFilters ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Dynamic Filters Section */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md"
        >
          {/* Genre Filters */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400">Genre</label>
            <div className="flex flex-wrap gap-1.5">
              {genres.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGenre(g)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
                    selectedGenre === g
                      ? 'bg-rose-500/20 border-rose-500/45 text-rose-300 font-semibold'
                      : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Language Filters */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400">Language</label>
            <div className="flex flex-wrap gap-1.5">
              {languages.map((l) => (
                <button
                  key={l}
                  onClick={() => setSelectedLanguage(l)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
                    selectedLanguage === l
                      ? 'bg-amber-500/25 border-amber-500/45 text-amber-300 font-semibold'
                      : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Movie Cards Grid */}
      {filteredMovies.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl space-y-3 bg-white/5">
          <Film className="mx-auto text-zinc-600 stroke-[1.5]" size={40} />
          <h3 className="text-sm font-semibold text-zinc-400">No movies found</h3>
          <p className="text-xs text-zinc-500">Try loosening your searches or active filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {filteredMovies.map((movie) => {
            const isFav = isFavourite(movie.id);
            return (
              <motion.div
                key={movie.id}
                layout
                whileHover={{ y: -6 }}
                className="group relative flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl hover:border-white/20 transition-all backdrop-blur-md"
                onClick={() => onSelectMovie(movie)}
              >
                {/* Poster Container */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Rating Overlay */}
                  {!movie.isComingSoon && (
                    <div className="absolute top-2.5 left-2.5 bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl flex items-center gap-1 text-xs font-bold text-amber-400 shadow-lg border border-zinc-800/80">
                      <Star size={12} className="fill-amber-400 stroke-none" />
                      <span>{movie.rating}</span>
                    </div>
                  )}

                  {/* Favourite Heart */}
                  {user && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavourite(movie.id);
                      }}
                      className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-zinc-950/80 hover:bg-zinc-900 backdrop-blur-md text-zinc-400 hover:text-rose-500 transition-colors border border-zinc-800/80"
                    >
                      <Heart size={14} className={isFav ? 'fill-rose-500 stroke-rose-500' : 'stroke-zinc-300'} />
                    </button>
                  )}

                  {/* Backdrop Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="w-full text-center bg-white text-zinc-950 font-extrabold py-2 rounded-xl text-xs shadow-lg uppercase tracking-wider transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      {movie.isComingSoon ? 'View Details' : 'Book Now'}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-1 bg-white/2">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-zinc-100 group-hover:text-amber-400 transition-colors line-clamp-1">
                      {movie.title}
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-medium line-clamp-1">
                      {movie.genre.join(' • ')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-zinc-800/40 text-[10px] text-zinc-400">
                    <span className="font-semibold text-zinc-500">{movie.language.join(', ')}</span>
                    <span className="font-mono">{movie.duration}m</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
