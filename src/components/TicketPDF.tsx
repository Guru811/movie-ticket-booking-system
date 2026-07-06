import React from 'react';
import { Booking, Movie, Theatre, Show } from '../types';
import { useApp } from '../context/AppContext';
import { Download, Calendar, MapPin, Film, User, Ticket, CreditCard, Printer, CheckCircle } from 'lucide-react';

interface TicketPDFProps {
  booking: Booking;
  movie?: Movie;
  theatre?: Theatre;
  show?: Show;
  onClose: () => void;
}

export const TicketPDF: React.FC<TicketPDFProps> = ({
  booking,
  movie,
  theatre,
  show,
  onClose,
}) => {
  const { user } = useApp();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="digital-ticket-stub" className="max-w-xl mx-auto glass-modal rounded-3xl overflow-hidden relative">
      {/* Success banner */}
      <div className="bg-emerald-500/10 border-b border-white/10 px-6 py-4 flex items-center gap-3 text-emerald-400">
        <div className="bg-emerald-500 text-zinc-950 p-1.5 rounded-full">
          <CheckCircle size={16} className="stroke-[3]" />
        </div>
        <div>
          <h4 className="text-sm font-black uppercase tracking-wider">Booking Confirmed</h4>
          <p className="text-[10px] text-emerald-400/80 font-medium">Ticket is active and verified. confirmation sent to your email.</p>
        </div>
      </div>

      <div className="p-6 space-y-6 print:p-0 print:bg-white print:text-zinc-950">
        {/* Ticket Body Layout */}
        <div className="border border-white/10 rounded-2xl bg-white/5 overflow-hidden shadow-inner flex flex-col sm:flex-row relative backdrop-blur-md">
          
          {/* Half circles for ticket punch visual */}
          <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-4 h-8 bg-[#040406] rounded-r-full border-r border-white/10 hidden sm:block" />
          <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-4 h-8 bg-[#040406] rounded-l-full border-l border-white/10 hidden sm:block" />

          {/* Left section: Movie Header & Poster */}
          <div className="sm:w-1/3 bg-white/5 p-4 border-b sm:border-b-0 sm:border-r border-white/10 flex flex-row sm:flex-col items-center gap-4 sm:gap-3">
            {movie && (
              <>
                <img
                  src={movie.poster}
                  alt={movie.title}
                  referrerPolicy="no-referrer"
                  className="w-16 sm:w-full aspect-[2/3] object-cover rounded-xl border border-white/10 shadow"
                />
                <div className="flex-1 sm:text-center">
                  <h3 className="text-xs font-black text-zinc-100 line-clamp-2">{movie.title}</h3>
                  <p className="text-[10px] text-zinc-500 font-mono mt-1">{movie.duration} min • {movie.language[0]}</p>
                </div>
              </>
            )}
          </div>

          {/* Right section: Ticket booking details */}
          <div className="flex-1 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest">Entry Ticket</span>
              <span className="text-[10px] text-amber-400 font-mono font-bold">ID: {booking.id.toUpperCase()}</span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Theatre</span>
                <span className="font-extrabold text-zinc-300">{theatre?.name || 'Starlight Multiplex'}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Screen</span>
                <span className="font-semibold text-zinc-300">{show ? `Screen ${show.screenId.toUpperCase()}` : 'Screen A'}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Date & Time</span>
                <span className="font-semibold text-zinc-300 flex items-center gap-1">
                  <Calendar size={11} className="text-rose-500" /> {show ? `${show.date} @ ${show.time}` : '2026-07-06 @ 18:00'}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Seats Booked</span>
                <span className="font-mono font-bold text-amber-400">{booking.seats.join(', ')}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Holder</span>
                <span className="font-medium text-zinc-300">{user?.name || 'Guest User'}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Amount Paid</span>
                <span className="font-mono font-bold text-zinc-100">${booking.totalAmount}</span>
              </div>
            </div>

            {/* Simulated QR Code / Barcode section */}
            <div className="border-t border-dashed border-white/10 pt-4 flex items-center justify-between gap-4">
              {/* Simulated barcode */}
              <div className="flex-1 space-y-1">
                <div className="h-8 w-full bg-white/5 border border-white/10 rounded flex items-center justify-around overflow-hidden px-1 py-0.5">
                  {/* Generate lines for a barcode effect */}
                  {Array.from({ length: 28 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-zinc-600"
                      style={{
                        width: i % 4 === 0 ? '3px' : i % 3 === 0 ? '1px' : '2px',
                        height: '100%',
                        opacity: i % 5 === 0 ? 0.35 : 0.8
                      }}
                    />
                  ))}
                </div>
                <div className="text-center font-mono text-[9px] text-zinc-500 tracking-widest">
                  *{booking.id.toUpperCase()}*
                </div>
              </div>

              {/* Simulated QR Code */}
              <div className="w-14 h-14 bg-white border border-zinc-200 rounded-lg p-1 flex items-center justify-center relative">
                {/* Visual grid representation of QR Code */}
                <div className="w-full h-full grid grid-cols-6 gap-0.5 opacity-90">
                  {Array.from({ length: 36 }).map((_, i) => {
                    const isCorner =
                      (i < 2 && i % 6 < 2) ||
                      (i < 12 && i >= 10 && i % 6 >= 4) ||
                      (i >= 24 && i < 26 && i % 6 < 2);
                    const isFilled = isCorner || Math.random() > 0.45;
                    return (
                      <div
                        key={i}
                        className={`rounded-[1px] ${isFilled ? 'bg-zinc-950' : 'bg-transparent'}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2 print:hidden">
          <button
            onClick={onClose}
            className="flex-1 bg-white/10 border border-white/10 hover:bg-white/15 text-zinc-300 hover:text-white font-extrabold py-3 rounded-xl text-xs transition-colors"
          >
            Close Ticket
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 bg-gradient-to-r from-amber-400 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-zinc-950 font-black py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
          >
            <Printer size={14} className="stroke-[2.5]" />
            Print / PDF
          </button>
        </div>
      </div>
    </div>
  );
};
