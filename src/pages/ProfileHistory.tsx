import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Booking, Movie, Show, Theatre } from '../types';
import {
  User as UserIcon, Ticket, Heart, Key, CheckCircle, AlertCircle, Calendar,
  MapPin, Clock, Eye, Trash2, Shield, RefreshCw
} from 'lucide-react';
import { TicketPDF } from '../components/TicketPDF';

interface ProfileHistoryProps {
  onSelectMovie: (movie: Movie) => void;
}

export const ProfileHistory: React.FC<ProfileHistoryProps> = ({ onSelectMovie }) => {
  const { user, movies, apiFetch, updateProfile, changePassword } = useApp();
  
  const [activeTab, setActiveTab] = useState<'bookings' | 'favourites' | 'settings'>('bookings');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // Settings form
  const [profileForm, setProfileForm] = useState({ name: '', email: '', profilePic: '' });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });

  // Ticket modal
  const [activeTicket, setActiveTicket] = useState<any | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    setMsg('');
    setErr('');
    try {
      const res = await apiFetch('/api/bookings/history');
      setBookings(res);
    } catch (e: any) {
      setErr('Failed to load booking history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name,
        email: user.email,
        profilePic: user.profilePic || ''
      });
      fetchBookings();
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    const success = await updateProfile(profileForm.name, profileForm.email, profileForm.profilePic);
    if (success) {
      setMsg('Profile parameters saved successfully.');
    } else {
      setErr('Profile update failed. Please check credentials.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    const res = await changePassword(passwordForm.oldPassword, passwordForm.newPassword);
    if (res.success) {
      setMsg('Security credentials updated.');
      setPasswordForm({ oldPassword: '', newPassword: '' });
    } else {
      setErr(res.message || 'Incorrect old password.');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking? This will release your seats and issue an immediate refund.')) return;
    setMsg('');
    setErr('');
    try {
      const res = await apiFetch(`/api/bookings/${bookingId}/cancel`, { method: 'PUT' });
      setMsg(res.message);
      await fetchBookings();
    } catch (e: any) {
      setErr(e.message || 'Cancellation failed.');
    }
  };

  // Filter bookmarked movies
  const favMovies = movies.filter(m => user?.favourites?.includes(m.id));

  return (
    <div id="profile-history-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-zinc-350">
      
      {/* Title */}
      <div className="flex items-center gap-4 border-b border-zinc-800 pb-5">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-zinc-950 font-black text-lg shadow-lg">
          {user?.name.substring(0, 1).toUpperCase() || 'U'}
        </div>
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider">{user?.name}</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Member since {user?.createdAt ? user.createdAt.split('T')[0] : '2026'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-900 pb-3 gap-2">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'bookings'
              ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
              : 'bg-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Ticket size={13} className="inline mr-1.5" /> Bookings Log
        </button>
        <button
          onClick={() => setActiveTab('favourites')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'favourites'
              ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
              : 'bg-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Heart size={13} className="inline mr-1.5" /> Favourites Feed
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
              : 'bg-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <UserIcon size={13} className="inline mr-1.5" /> settings
        </button>
      </div>

      {/* Notices */}
      {msg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle size={14} /> {msg}
        </div>
      )}
      {err && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={14} /> {err}
        </div>
      )}

      {/* Bookings log viewer */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {loading && (
            <div className="text-center py-10">
              <RefreshCw className="animate-spin mx-auto text-amber-500" />
            </div>
          )}

          {!loading && bookings.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl space-y-2">
              <Ticket className="mx-auto text-zinc-650" size={32} />
              <h4 className="text-sm font-semibold text-zinc-400">No active ticket bookings</h4>
              <p className="text-xs text-zinc-550">Find your favourite film in the browse page and schedule a booking!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.map(b => (
                <div key={b.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex gap-4 items-start relative hover:border-white/20 transition-all backdrop-blur-md">
                  {b.movie && (
                    <img
                      src={b.movie.poster} alt=""
                      className="w-16 sm:w-20 aspect-[2/3] object-cover rounded-xl border border-zinc-800"
                    />
                  )}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-black text-zinc-200">{b.movie?.title || b.movieId}</h4>
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                        b.bookingStatus === 'cancelled'
                          ? 'bg-rose-550/10 border-rose-550/10 text-rose-500'
                          : 'bg-emerald-500/10 border-emerald-550/10 text-emerald-400'
                      }`}>
                        {b.bookingStatus}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 font-semibold">{b.theatre?.name || 'Starlight Multiplex'}</p>
                    
                    <div className="flex flex-col gap-1 text-[10px] text-zinc-500 pt-1 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} className="text-zinc-600" /> {b.show?.date || b.createdAt.split('T')[0]}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} className="text-zinc-600" /> Showtime: {b.show?.time || '18:00'}
                      </span>
                      <span className="font-mono text-zinc-400 font-bold">Seats: {b.seats.join(', ')}</span>
                      <span className="font-mono text-zinc-450">Paid amount: ₹{b.totalAmount}</span>
                    </div>

                    {/* Actions panel */}
                    <div className="flex items-center gap-2 pt-3">
                      {b.bookingStatus !== 'cancelled' && (
                        <>
                          <button
                            onClick={() => setActiveTicket(b)}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-bold px-3 py-1.5 rounded-lg text-[10px] transition-all flex items-center gap-1"
                          >
                            <Eye size={10} /> View Ticket
                          </button>
                          <button
                            onClick={() => handleCancelBooking(b.id)}
                            className="text-rose-400 hover:text-rose-300 font-bold bg-transparent px-2.5 py-1 text-[10px] hover:underline"
                          >
                            Cancel & Refund
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Favourites feed tab */}
      {activeTab === 'favourites' && (
        <div className="space-y-4">
          {favMovies.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl space-y-2">
              <Heart className="mx-auto text-zinc-650" size={32} />
              <h4 className="text-sm font-semibold text-zinc-400">No bookmarked movies</h4>
              <p className="text-xs text-zinc-550">Bookmark active movies using the heart icon during browsing!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {favMovies.map(movie => (
                <div
                  key={movie.id}
                  onClick={() => onSelectMovie(movie)}
                  className="bg-white/5 border border-white/10 p-3 rounded-2xl cursor-pointer hover:border-white/20 hover:scale-[1.02] transition-all flex flex-col space-y-2 backdrop-blur-md"
                >
                  <img src={movie.poster} alt="" className="w-full aspect-[2/3] object-cover rounded-xl border border-zinc-800 shadow" />
                  <h4 className="text-xs font-bold text-zinc-200 line-clamp-1">{movie.title}</h4>
                  <span className="text-[10px] text-zinc-500 font-mono">{movie.genre.slice(0, 2).join(' • ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings credentials tab */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Profile particulars form */}
          <form onSubmit={handleUpdateProfile} className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4 backdrop-blur-md">
            <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-1.5">
              <UserIcon size={14} className="text-amber-500" /> Profile Parameters
            </h3>

            <div className="space-y-1 text-xs">
              <label className="text-zinc-500 font-bold">Full Name</label>
              <input
                type="text" required value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 focus:border-rose-500/50 text-white rounded-xl px-3 py-2.5 focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-1 text-xs">
              <label className="text-zinc-500 font-bold">Email Address</label>
              <input
                type="email" required value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full bg-white/5 border border-white/10 focus:border-rose-500/50 text-white rounded-xl px-3 py-2.5 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-white/10 hover:bg-white/15 border border-white/15 hover:border-white/25 hover:text-white text-zinc-300 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer"
            >
              Save Parameters
            </button>
          </form>

          {/* Change password security form */}
          <form onSubmit={handleChangePassword} className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4 backdrop-blur-md">
            <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-1.5">
              <Key size={14} className="text-amber-500" /> Security Credentials
            </h3>

            <div className="space-y-1 text-xs">
              <label className="text-zinc-500 font-bold">Current Password</label>
              <input
                type="password" required value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                className="w-full bg-white/5 border border-white/10 focus:border-rose-500/50 text-white rounded-xl px-3 py-2.5 focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-1 text-xs">
              <label className="text-zinc-500 font-bold">New Password</label>
              <input
                type="password" required value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full bg-white/5 border border-white/10 focus:border-rose-500/50 text-white rounded-xl px-3 py-2.5 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-white/10 hover:bg-white/15 border border-white/15 hover:border-white/25 hover:text-white text-zinc-300 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer"
            >
              Update Security Credentials
            </button>
          </form>
        </div>
      )}

      {/* Ticket Overlay modal */}
      {activeTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl">
            <TicketPDF
              booking={activeTicket}
              movie={activeTicket.movie}
              theatre={activeTicket.theatre}
              show={activeTicket.show}
              onClose={() => setActiveTicket(null)}
            />
          </div>
        </div>
      )}

    </div>
  );
};
