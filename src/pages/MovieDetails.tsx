import React, { useState, useEffect } from 'react';
import { Movie, Theatre, Show, Screen, Booking } from '../types';
import { useApp } from '../context/AppContext';
import { ChevronLeft, Play, Star, Calendar, Clock, MapPin, Users, Film, ArrowRight } from 'lucide-react';
import { SeatSelector } from '../components/SeatSelector';
import { TicketPDF } from '../components/TicketPDF';
import { ReviewsList } from '../components/ReviewsList';
import { motion } from 'motion/react';

interface MovieDetailsProps {
  movie: Movie;
  onBack: () => void;
  onOpenAuth: () => void;
}

export const MovieDetails: React.FC<MovieDetailsProps> = ({ movie, onBack, onOpenAuth }) => {
  const { user, theatres, apiFetch, selectedCity } = useApp();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableShows, setAvailableShows] = useState<Show[]>([]);
  const [selectedTheatre, setSelectedTheatre] = useState<Theatre | null>(null);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [activeScreen, setActiveScreen] = useState<Screen | null>(null);
  
  // Checkout flow states
  const [currentStep, setCurrentStep] = useState<'info' | 'seats' | 'ticket'>('info');
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);

  // Generate next 3 days
  const dates = Array.from({ length: 3 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  useEffect(() => {
    // Set default date
    setSelectedDate(dates[0]);
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    
    // Load shows for selected movie and date
    const loadShows = async () => {
      try {
        const shows: Show[] = await apiFetch(`/api/shows?movieId=${movie.id}&date=${selectedDate}`);
        setAvailableShows(shows);
        
        // Reset selected show when date changes
        setSelectedShow(null);
        setSelectedTheatre(null);
        setActiveScreen(null);
      } catch (e) {
        console.error('Failed to load shows', e);
      }
    };
    
    loadShows();
  }, [selectedDate, movie.id]);

  // Group shows by Theatre
  const cityTheatres = theatres.filter(t => t.city.toLowerCase() === selectedCity.toLowerCase());
  
  const handleSelectShow = (show: Show, theatre: Theatre) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    const screen = theatre.screens.find(s => s.id === show.screenId) || null;
    setSelectedTheatre(theatre);
    setSelectedShow(show);
    setActiveScreen(screen);
    setCurrentStep('seats');
  };

  const handleConfirmBooking = async (
    seats: string[],
    totalAmount: number,
    discountAmount: number,
    couponCode?: string
  ) => {
    if (!selectedShow) return;
    try {
      const res = await apiFetch('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          showId: selectedShow.id,
          seats,
          totalAmount,
          discountAmount,
          couponCode
        })
      });
      
      setCompletedBooking(res.booking);
      setCurrentStep('ticket');
    } catch (e: any) {
      throw new Error(e.message || 'Payment processing failed. Please try again.');
    }
  };

  const getDayName = (dateStr: string) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const d = new Date(dateStr + 'T00:00:00');
    return days[d.getDay()].substring(0, 3);
  };

  return (
    <div id="movie-details-layout" className="min-h-screen bg-[#040406] text-zinc-350 pb-20">
      {/* Header Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-xs font-bold bg-white/5 border border-white/10 rounded-xl px-4 py-2 hover:bg-white/10"
        >
          <ChevronLeft size={16} /> Back to Movies
        </button>
      </div>

      {currentStep === 'info' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-12">
          
          {/* Main Info Hero section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            
            {/* Poster / Trailer */}
            <div className="space-y-4">
              <div className="aspect-[2/3] w-full bg-[#040406] border border-white/10 rounded-3xl overflow-hidden relative shadow-2xl">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                
                {movie.isComingSoon && (
                  <div className="absolute inset-0 bg-zinc-950/75 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
                    <Film size={40} className="text-amber-500 stroke-[1.5] mb-2" />
                    <span className="text-sm font-extrabold uppercase tracking-widest text-amber-400">Coming Soon</span>
                    <span className="text-[10px] text-zinc-500 mt-1">Stay tuned for ticket release</span>
                  </div>
                )}
              </div>
            </div>

            {/* Movie particulars description */}
            <div className="md:col-span-2 space-y-6">
              <div className="space-y-3">
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none">
                  {movie.title}
                </h2>
                
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-zinc-400">
                  <div className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/10">
                    <Star size={13} className="fill-amber-400 stroke-none" />
                    <span>{movie.rating} / 5</span>
                    <span className="text-zinc-600 text-[10px]">({movie.ratingsCount})</span>
                  </div>
                  <span className="bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">{movie.duration} min</span>
                  <span className="bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">{movie.language.join(', ')}</span>
                  <div className="flex gap-1.5">
                    {movie.genre.map(g => (
                      <span key={g} className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-zinc-300">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-zinc-500 tracking-wider">Synopsis</h4>
                <p className="text-sm leading-relaxed text-zinc-300">
                  {movie.description}
                </p>
              </div>

              {/* Cast and crew */}
              <div className="grid grid-cols-2 gap-4 border-t border-zinc-900 pt-6">
                <div className="space-y-1">
                  <h5 className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Director</h5>
                  <p className="text-xs font-bold text-zinc-200">{movie.director}</p>
                </div>
                <div className="space-y-1">
                  <h5 className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Starring</h5>
                  <p className="text-xs font-bold text-zinc-200">{movie.cast.join(', ')}</p>
                </div>
              </div>

              {/* Trailer Embed */}
              {movie.trailer && (
                <div className="border border-white/10 bg-white/5 p-4 rounded-3xl space-y-3">
                  <h4 className="text-xs font-black uppercase text-zinc-500 tracking-wider flex items-center gap-1.5">
                    <Play size={13} className="text-rose-500 fill-rose-500 stroke-none" /> Official Trailer
                  </h4>
                  <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10">
                    <iframe
                      src={movie.trailer}
                      title={`${movie.title} Trailer`}
                      allowFullScreen
                      className="w-full h-full border-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ticket Booking section (only if not coming soon) */}
          {!movie.isComingSoon && (
            <div className="border border-white/10 bg-white/5 rounded-3xl p-6 sm:p-8 space-y-6 backdrop-blur-md">
              
              {/* Timing choosing title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">Show Timings</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Choose your date, theater and seating slot.</p>
                </div>

                {/* Date quick pickers */}
                <div className="flex gap-2">
                  {dates.map((dateStr) => {
                    const isSelected = selectedDate === dateStr;
                    return (
                      <button
                        key={dateStr}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`px-3.5 py-2 rounded-xl text-xs flex flex-col items-center justify-center border transition-all min-w-[64px] cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-zinc-950 border-amber-400 font-black'
                            : 'bg-white/5 border-white/10 hover:border-white/20 text-zinc-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-bold tracking-wider">{getDayName(dateStr)}</span>
                        <span className="text-sm font-mono mt-0.5">{dateStr.split('-')[2]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* List shows grouping */}
              {cityTheatres.length === 0 ? (
                <div className="text-center py-10 text-xs text-zinc-500">
                  No theatres available in {selectedCity}. Please switch cities in the navbar.
                </div>
              ) : (
                <div className="space-y-6">
                  {cityTheatres.map((theatre) => {
                    // Find shows for this theatre on selected date
                    const theatreShows = availableShows.filter(s => s.theatreId === theatre.id);
                    
                    return (
                      <div key={theatre.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5">
                            <h4 className="text-sm font-black text-zinc-200">{theatre.name}</h4>
                            <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                              <MapPin size={11} className="text-rose-500" /> {theatre.address}
                            </p>
                          </div>
                        </div>

                        {/* Timing chips */}
                        {theatreShows.length === 0 ? (
                          <div className="text-xs text-zinc-650 italic pl-1">No shows scheduled for today.</div>
                        ) : (
                          <div className="flex flex-wrap gap-2.5 pt-1">
                            {theatreShows.map((show) => {
                              const screen = theatre.screens.find(s => s.id === show.screenId);
                              const seatsRemaining = show.totalSeats - show.bookedSeats.length;
                              const isSoldOut = seatsRemaining <= 0;
                              
                              return (
                                <button
                                  key={show.id}
                                  disabled={isSoldOut}
                                  onClick={() => handleSelectShow(show, theatre)}
                                  className={`px-4 py-3 rounded-xl border flex flex-col items-start transition-all cursor-pointer ${
                                    isSoldOut
                                      ? 'bg-black/45 border-white/5 text-zinc-650 opacity-40 cursor-not-allowed'
                                      : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 hover:shadow-lg text-zinc-100'
                                  }`}
                                >
                                  <span className="text-sm font-extrabold font-mono flex items-center gap-1">
                                    <Clock size={11} className="text-amber-400" /> {show.time}
                                  </span>
                                  <span className="text-[9px] text-zinc-500 font-semibold mt-1">
                                    {screen?.name.split(' ')[0]} • ₹{show.ticketPrice}
                                  </span>
                                  <span className={`text-[8px] font-extrabold uppercase mt-0.5 ${
                                    isSoldOut ? 'text-rose-500' : seatsRemaining < 10 ? 'text-amber-500' : 'text-emerald-500'
                                  }`}>
                                    {isSoldOut ? 'Sold Out' : `${seatsRemaining} left`}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* User Reviews Section */}
          <div className="border border-white/10 bg-white/5 rounded-3xl p-6 sm:p-8 max-w-3xl backdrop-blur-md">
            <ReviewsList movieId={movie.id} onReviewAdded={() => {}} />
          </div>

        </div>
      )}

      {currentStep === 'seats' && selectedShow && selectedTheatre && activeScreen && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
            <h2 className="text-xl font-black text-white uppercase tracking-wider">Choose Seats</h2>
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-750" />
            <span className="text-xs text-zinc-400 font-semibold">{movie.title}</span>
          </div>

          <SeatSelector
            show={selectedShow}
            theatre={selectedTheatre}
            screen={activeScreen}
            onConfirmBooking={handleConfirmBooking}
            onCancel={() => {
              setCurrentStep('info');
              setSelectedShow(null);
            }}
          />
        </div>
      )}

      {currentStep === 'ticket' && completedBooking && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-4">
          <div className="text-center space-y-1 pb-4">
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">Congratulations!</h2>
            <p className="text-xs text-zinc-400">Your movie reservation stub has been successfully authorized.</p>
          </div>

          <TicketPDF
            booking={completedBooking}
            movie={movie}
            theatre={selectedTheatre || undefined}
            show={selectedShow || undefined}
            onClose={() => {
              setCurrentStep('info');
              setSelectedShow(null);
              setCompletedBooking(null);
              onBack();
            }}
          />
        </div>
      )}
    </div>
  );
};
