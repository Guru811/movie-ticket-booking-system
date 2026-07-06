import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Movie, Theatre, Show, Booking, Coupon, Screen } from '../types';
import {
  TrendingUp, Users, Film, Ticket, DollarSign, Calendar, MapPin, Plus, Trash, Edit, RefreshCw,
  Percent, CheckCircle, ListFilter, AlertCircle, ShoppingBag, Eye, X, Star, BarChart3
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, Legend
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { apiFetch, refreshData, movies, theatres } = useApp();
  
  const [activeTab, setActiveTab] = useState<'analytics' | 'movies' | 'theatres' | 'shows' | 'bookings' | 'coupons'>('analytics');
  
  // Data lists
  const [shows, setShows] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modals / Form states
  const [showMovieForm, setShowMovieForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [movieForm, setMovieForm] = useState({
    title: '', description: '', poster: '', banner: '', trailer: '',
    duration: 120, releaseDate: '', genre: '', language: '',
    director: '', cast: '', isComingSoon: false
  });

  const [showTheatreForm, setShowTheatreForm] = useState(false);
  const [theatreForm, setTheatreForm] = useState({
    name: '', city: '', address: '',
    screenName: 'Screen 1 (IMAX)', rows: 8, cols: 10,
    vipPrice: 350, platinumPrice: 280, goldPrice: 250, silverPrice: 180
  });

  const [showShowForm, setShowShowForm] = useState(false);
  const [showForm, setShowForm] = useState({
    movieId: '', theatreId: '', screenId: '', date: '', time: '', ticketPrice: 15
  });

  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '', discountType: 'percentage' as 'percentage' | 'flat', value: 15, minPurchase: 30
  });

  const loadAdminData = async () => {
    setLoading(true);
    setMessage('');
    setErrorMsg('');
    try {
      if (activeTab === 'analytics') {
        const res = await apiFetch('/api/admin/analytics');
        setStats(res.stats);
        setCharts(res.charts);
      } else if (activeTab === 'shows') {
        const res = await apiFetch('/api/shows');
        setShows(res);
      } else if (activeTab === 'bookings') {
        const res = await apiFetch('/api/bookings/all');
        setBookings(res);
      } else if (activeTab === 'coupons') {
        const res = await apiFetch('/api/coupons');
        setCoupons(res);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to fetch admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [activeTab]);

  const handleMovieSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setMessage('');
    try {
      const payload = {
        ...movieForm,
        genre: movieForm.genre.split(',').map(s => s.trim()).filter(Boolean),
        language: movieForm.language.split(',').map(s => s.trim()).filter(Boolean),
        cast: movieForm.cast.split(',').map(s => s.trim()).filter(Boolean),
        duration: Number(movieForm.duration)
      };

      if (editingMovie) {
        await apiFetch(`/api/movies/${editingMovie.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setMessage('Movie updated successfully!');
      } else {
        await apiFetch('/api/movies', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setMessage('Movie created successfully!');
      }

      await refreshData();
      setShowMovieForm(false);
      setEditingMovie(null);
      resetMovieForm();
    } catch (e: any) {
      setErrorMsg(e.message || 'Action failed');
    }
  };

  const handleEditMovieClick = (movie: Movie) => {
    setEditingMovie(movie);
    setMovieForm({
      title: movie.title,
      description: movie.description,
      poster: movie.poster,
      banner: movie.banner,
      trailer: movie.trailer,
      duration: movie.duration,
      releaseDate: movie.releaseDate,
      genre: movie.genre.join(', '),
      language: movie.language.join(', '),
      director: movie.director,
      cast: movie.cast.join(', '),
      isComingSoon: !!movie.isComingSoon
    });
    setShowMovieForm(true);
  };

  const handleDeleteMovieClick = async (movieId: string) => {
    if (!confirm('Are you sure you want to delete this movie?')) return;
    try {
      await apiFetch(`/api/movies/${movieId}`, { method: 'DELETE' });
      setMessage('Movie deleted.');
      await refreshData();
    } catch (e: any) {
      setErrorMsg(e.message || 'Deletion failed');
    }
  };

  const resetMovieForm = () => {
    setMovieForm({
      title: '', description: '', poster: '', banner: '', trailer: '',
      duration: 120, releaseDate: '', genre: '', language: '',
      director: '', cast: '', isComingSoon: false
    });
  };

  const handleTheatreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setMessage('');
    try {
      const screen: Screen = {
        id: `s_${Math.random().toString(36).substr(2, 5)}`,
        name: theatreForm.screenName,
        rows: Number(theatreForm.rows),
        cols: Number(theatreForm.cols),
        tierPrices: {
          vip: Number(theatreForm.vipPrice) || undefined,
          platinum: Number(theatreForm.platinumPrice) || undefined,
          gold: Number(theatreForm.goldPrice) || undefined,
          silver: Number(theatreForm.silverPrice) || undefined,
        }
      };

      const payload = {
        name: theatreForm.name,
        city: theatreForm.city,
        address: theatreForm.address,
        screens: [screen]
      };

      await apiFetch('/api/theatres', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setMessage('Theatre and screen layout created successfully!');
      await refreshData();
      setShowTheatreForm(false);
      setTheatreForm({
        name: '', city: 'Mumbai', address: '',
        screenName: 'Screen 1 (IMAX)', rows: 8, cols: 10,
        vipPrice: 350, platinumPrice: 280, goldPrice: 250, silverPrice: 180
      });
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to create theatre.');
    }
  };

  const handleShowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setMessage('');
    try {
      if (!showForm.movieId || !showForm.theatreId || !showForm.screenId) {
        throw new Error('Please select Movie, Theatre and Screen.');
      }

      await apiFetch('/api/shows', {
        method: 'POST',
        body: JSON.stringify({
          ...showForm,
          ticketPrice: Number(showForm.ticketPrice)
        })
      });

      setMessage('Show scheduled successfully!');
      await loadAdminData();
      setShowShowForm(false);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to create show.');
    }
  };

  const handleDeleteShow = async (showId: string) => {
    if (!confirm('Cancel/Delete this scheduled show?')) return;
    try {
      await apiFetch(`/api/shows/${showId}`, { method: 'DELETE' });
      setMessage('Show deleted.');
      await loadAdminData();
    } catch (e: any) {
      setErrorMsg(e.message || 'Deletion failed.');
    }
  };

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setMessage('');
    try {
      await apiFetch('/api/coupons', {
        method: 'POST',
        body: JSON.stringify({
          ...couponForm,
          value: Number(couponForm.value),
          minPurchase: Number(couponForm.minPurchase)
        })
      });

      setMessage('Coupon added successfully!');
      await loadAdminData();
      setShowCouponForm(false);
      setCouponForm({ code: '', discountType: 'percentage', value: 15, minPurchase: 30 });
    } catch (e: any) {
      setErrorMsg(e.message || 'Action failed.');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      await apiFetch(`/api/coupons/${id}`, { method: 'DELETE' });
      setMessage('Coupon deleted.');
      await loadAdminData();
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to delete.');
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (!confirm('Refund transaction and cancel seats?')) return;
    try {
      await apiFetch(`/api/bookings/${id}/cancel`, { method: 'PUT' });
      setMessage('Booking cancelled and refunded.');
      await loadAdminData();
    } catch (e: any) {
      setErrorMsg(e.message || 'Action failed');
    }
  };

  const getMovieTitle = (id: string) => movies.find(m => m.id === id)?.title || id;
  const getTheatreName = (id: string) => theatres.find(t => t.id === id)?.name || id;

  return (
    <div id="admin-panel" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-zinc-300">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="text-amber-500" /> Executive Console
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Configure movies, theaters, schedules, vouchers and view earnings.</p>
        </div>

        {/* Refresh indicator */}
        <button
          onClick={loadAdminData}
          className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 self-start cursor-pointer transition-colors"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Reload Board
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-900 pb-3">
        {(['analytics', 'movies', 'theatres', 'shows', 'bookings', 'coupons'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setMessage('');
              setErrorMsg('');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                : 'bg-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Messages banner */}
      {message && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle size={14} /> {message}
        </div>
      )}
      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={14} /> {errorMsg}
        </div>
      )}

      {/* Loading state spinner */}
      {loading && !stats && !shows.length && (
        <div className="text-center py-20">
          <RefreshCw size={36} className="animate-spin mx-auto text-amber-500" />
          <p className="text-xs text-zinc-500 mt-3">Pre-loading records database...</p>
        </div>
      )}

      {/* TAB CONTENT: ANALYTICS */}
      {activeTab === 'analytics' && stats && charts && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Bento Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-zinc-900/60 border border-zinc-850 p-4 rounded-2xl space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Gross Income</span>
              <h3 className="text-xl font-black text-amber-400 font-mono">₹{stats.totalRevenue}</h3>
              <p className="text-[9px] text-emerald-400 flex items-center gap-1">
                <TrendingUp size={10} /> +14% vs last week
              </p>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-850 p-4 rounded-2xl space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Confirmed Bookings</span>
              <h3 className="text-xl font-black text-white font-mono">{stats.totalBookings}</h3>
              <p className="text-[9px] text-zinc-500">Tickets generated</p>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-850 p-4 rounded-2xl space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Total Users</span>
              <h3 className="text-xl font-black text-white font-mono">{stats.totalUsers}</h3>
              <p className="text-[9px] text-zinc-500">Registered members</p>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-850 p-4 rounded-2xl space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Catalog Movies</span>
              <h3 className="text-xl font-black text-white font-mono">{stats.totalMovies}</h3>
              <p className="text-[9px] text-zinc-500">Active screenings</p>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-850 p-4 rounded-2xl space-y-1.5 col-span-2 lg:col-span-1">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Theater Occupancy</span>
              <h3 className="text-xl font-black text-emerald-400 font-mono">{stats.occupancyRate}%</h3>
              <p className="text-[9px] text-zinc-500">Peak hour average</p>
            </div>
          </div>

          {/* Interactive Recharts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Sales performance trend (LineChart) */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Daily Sales Performance (₹)</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.dailySales} margin={{ left: -10, right: 10, top: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="date" stroke="#71717a" fontSize={11} />
                    <YAxis stroke="#71717a" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', fontSize: 11 }} />
                    <Line type="monotone" dataKey="sales" stroke="#f43f5e" strokeWidth={3} dot={{ fill: '#fbbf24' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Popular Movies Revenue (BarChart) */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Trending Movies Revenue Breakdown</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.popularMovies} margin={{ left: -10, right: 10, top: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickFormatter={(v) => v.split(':')[0]} />
                    <YAxis stroke="#71717a" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', fontSize: 11 }} />
                    <Bar dataKey="revenue" fill="#fbbf24" radius={[4, 4, 0, 0]} barSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Earnings Expansion (AreaChart) */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-xl lg:col-span-2">
              <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Monthly Gross Earnings Growth trajectory (₹)</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.monthlyRevenue} margin={{ left: -10, top: 10 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="month" stroke="#71717a" fontSize={11} />
                    <YAxis stroke="#71717a" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', fontSize: 11 }} />
                    <Area type="monotone" dataKey="revenue" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: MOVIES */}
      {activeTab === 'movies' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black uppercase text-white tracking-wider">Movies Database ({movies.length})</h3>
            <button
              onClick={() => {
                resetMovieForm();
                setEditingMovie(null);
                setShowMovieForm(true);
              }}
              className="bg-gradient-to-r from-amber-400 to-rose-500 text-zinc-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Plus size={14} className="stroke-[2.5]" /> Add New Movie
            </button>
          </div>

          {/* Form Modal for Add/Edit Movie */}
          {showMovieForm && (
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <h4 className="text-xs font-black uppercase text-white tracking-wider">
                  {editingMovie ? 'Edit Movie Particulars' : 'Add New Cinematic Movie'}
                </h4>
                <button onClick={() => { setShowMovieForm(false); setEditingMovie(null); }} className="text-zinc-500 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleMovieSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-zinc-500 font-bold block">Movie Title</label>
                  <input
                    type="text" required value={movieForm.title}
                    onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-500 font-bold block">Poster Image URL</label>
                  <input
                    type="text" required value={movieForm.poster}
                    onChange={(e) => setMovieForm({ ...movieForm, poster: e.target.value })}
                    placeholder="https://unsplash.com/..."
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-500 font-bold block">Backdrop Banner URL</label>
                  <input
                    type="text" required value={movieForm.banner}
                    onChange={(e) => setMovieForm({ ...movieForm, banner: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-500 font-bold block">Youtube Embed URL</label>
                  <input
                    type="text" value={movieForm.trailer}
                    onChange={(e) => setMovieForm({ ...movieForm, trailer: e.target.value })}
                    placeholder="https://www.youtube.com/embed/..."
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-500 font-bold block">Duration (minutes)</label>
                  <input
                    type="number" required value={movieForm.duration}
                    onChange={(e) => setMovieForm({ ...movieForm, duration: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-500 font-bold block">Release Date (YYYY-MM-DD)</label>
                  <input
                    type="text" required value={movieForm.releaseDate}
                    onChange={(e) => setMovieForm({ ...movieForm, releaseDate: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-500 font-bold block">Genres (comma separated)</label>
                  <input
                    type="text" required value={movieForm.genre}
                    onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                    placeholder="Action, Sci-Fi, Adventure"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-500 font-bold block">Languages (comma separated)</label>
                  <input
                    type="text" required value={movieForm.language}
                    onChange={(e) => setMovieForm({ ...movieForm, language: e.target.value })}
                    placeholder="English, Spanish"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-500 font-bold block">Director</label>
                  <input
                    type="text" required value={movieForm.director}
                    onChange={(e) => setMovieForm({ ...movieForm, director: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-500 font-bold block">Cast (comma separated)</label>
                  <input
                    type="text" required value={movieForm.cast}
                    onChange={(e) => setMovieForm({ ...movieForm, cast: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-zinc-500 font-bold block">Movie Synopsis</label>
                  <textarea
                    required rows={3} value={movieForm.description}
                    onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-200 rounded-xl p-3 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 sm:col-span-2 py-1">
                  <input
                    type="checkbox" id="comingsoon" checked={movieForm.isComingSoon}
                    onChange={(e) => setMovieForm({ ...movieForm, isComingSoon: e.target.checked })}
                    className="w-4 h-4 accent-rose-500 rounded focus:ring-0"
                  />
                  <label htmlFor="comingsoon" className="font-bold text-zinc-300">Set as "Coming Soon" (disables active schedules)</label>
                </div>

                <div className="sm:col-span-2 pt-2 flex gap-3">
                  <button
                    type="button" onClick={() => { setShowMovieForm(false); setEditingMovie(null); }}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-bold py-2.5 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-amber-400 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-zinc-950 font-black py-2.5 rounded-xl transition-all"
                  >
                    {editingMovie ? 'Save Changes' : 'Publish Movie'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List movies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {movies.map(movie => (
              <div key={movie.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex gap-4 items-start relative hover:border-zinc-700 transition-all">
                <img src={movie.poster} alt="" className="w-16 aspect-[2/3] object-cover rounded-lg border border-zinc-800" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between">
                    <h4 className="text-xs font-black text-zinc-100">{movie.title}</h4>
                    {movie.isComingSoon && (
                      <span className="text-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded uppercase font-bold">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    Director: {movie.director} • {movie.duration}m
                  </p>
                  <p className="text-[10px] text-zinc-400 line-clamp-2 pr-12">{movie.description}</p>
                  
                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => handleEditMovieClick(movie)}
                      className="text-[10px] text-zinc-400 hover:text-white font-bold bg-zinc-950 border border-zinc-850 px-2 py-1 rounded"
                    >
                      <Edit size={10} className="inline mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMovieClick(movie.id)}
                      className="text-[10px] text-rose-400 hover:text-rose-300 font-bold bg-zinc-950 border border-zinc-850 px-2 py-1 rounded"
                    >
                      <Trash size={10} className="inline mr-1" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: THEATRES */}
      {activeTab === 'theatres' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black uppercase text-white tracking-wider">Theatre Operations ({theatres.length})</h3>
            <button
              onClick={() => setShowTheatreForm(true)}
              className="bg-gradient-to-r from-amber-400 to-rose-500 text-zinc-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Plus size={14} className="stroke-[2.5]" /> Add Theatre & Seating
            </button>
          </div>

          {/* Add Theatre and Layout Designer Form */}
          {showTheatreForm && (
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <h4 className="text-xs font-black uppercase text-white tracking-wider">Configure Theatre & Seating Layout</h4>
                <button onClick={() => setShowTheatreForm(false)} className="text-zinc-500 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleTheatreSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-zinc-500 font-bold block">Theatre Name</label>
                  <input
                    type="text" required value={theatreForm.name}
                    onChange={(e) => setTheatreForm({ ...theatreForm, name: e.target.value })}
                    placeholder="e.g. IMAX Cinema Hall"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-500 font-bold block">City Location</label>
                  <select
                    value={theatreForm.city}
                    onChange={(e) => setTheatreForm({ ...theatreForm, city: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 focus:outline-none"
                  >
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Chennai">Chennai</option>
                  </select>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-zinc-500 font-bold block">Street Address</label>
                  <input
                    type="text" required value={theatreForm.address}
                    onChange={(e) => setTheatreForm({ ...theatreForm, address: e.target.value })}
                    placeholder="Times Square, NY"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 border-t border-zinc-800 pt-4 mt-2">
                  <h5 className="text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-3">Seating Plan Designer</h5>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-500 font-bold block">Screen Title</label>
                  <input
                    type="text" required value={theatreForm.screenName}
                    onChange={(e) => setTheatreForm({ ...theatreForm, screenName: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-zinc-500 font-bold block">Rows (max 10)</label>
                    <input
                      type="number" required min={4} max={10} value={theatreForm.rows}
                      onChange={(e) => setTheatreForm({ ...theatreForm, rows: Number(e.target.value) })}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-500 font-bold block">Cols (max 12)</label>
                    <input
                      type="number" required min={4} max={12} value={theatreForm.cols}
                      onChange={(e) => setTheatreForm({ ...theatreForm, cols: Number(e.target.value) })}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 sm:col-span-2 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-purple-400 font-extrabold">VIP Ticket (₹)</label>
                    <input
                      type="number" value={theatreForm.vipPrice}
                      onChange={(e) => setTheatreForm({ ...theatreForm, vipPrice: Number(e.target.value) })}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-indigo-400 font-extrabold">Platinum (₹)</label>
                    <input
                      type="number" value={theatreForm.platinumPrice}
                      onChange={(e) => setTheatreForm({ ...theatreForm, platinumPrice: Number(e.target.value) })}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-amber-400 font-extrabold">Gold (₹)</label>
                    <input
                      type="number" value={theatreForm.goldPrice}
                      onChange={(e) => setTheatreForm({ ...theatreForm, goldPrice: Number(e.target.value) })}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-extrabold">Silver (₹)</label>
                    <input
                      type="number" value={theatreForm.silverPrice}
                      onChange={(e) => setTheatreForm({ ...theatreForm, silverPrice: Number(e.target.value) })}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 pt-4 flex gap-3">
                  <button
                    type="button" onClick={() => setShowTheatreForm(false)}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-bold py-2.5 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-amber-400 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-zinc-950 font-black py-2.5 rounded-xl transition-all"
                  >
                    Assemble Theatre
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List theatres */}
          <div className="space-y-4">
            {theatres.map(theatre => (
              <div key={theatre.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-zinc-100">{theatre.name}</h4>
                    <span className="text-[9px] bg-zinc-800 border border-zinc-700/80 px-2 py-0.5 rounded-full text-zinc-400 font-semibold">{theatre.city}</span>
                  </div>
                  <p className="text-xs text-zinc-400 flex items-center gap-1">
                    <MapPin size={12} className="text-rose-500" /> {theatre.address}
                  </p>
                </div>

                {/* Screens */}
                <div className="flex flex-wrap gap-2">
                  {theatre.screens.map(screen => (
                    <div key={screen.id} className="bg-zinc-950 border border-zinc-850 p-2.5 rounded-xl text-[10px] space-y-1">
                      <span className="font-bold text-zinc-300 block">{screen.name}</span>
                      <span className="text-zinc-500 block">Dimensions: {screen.rows} rows x {screen.cols} cols ({screen.rows * screen.cols} seats)</span>
                      <span className="text-amber-400/80 font-semibold block">VIP: ₹{screen.tierPrices.vip || '-'} • Gold: ₹{screen.tierPrices.gold || '-'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: SHOWS */}
      {activeTab === 'shows' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black uppercase text-white tracking-wider">Scheduled Screenings ({shows.length})</h3>
            <button
              onClick={() => {
                setShowForm({
                  movieId: movies[0]?.id || '',
                  theatreId: theatres[0]?.id || '',
                  screenId: theatres[0]?.screens[0]?.id || '',
                  date: new Date().toISOString().split('T')[0],
                  time: '18:00',
                  ticketPrice: 15
                });
                setShowShowForm(true);
              }}
              className="bg-gradient-to-r from-amber-400 to-rose-500 text-zinc-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Calendar size={14} /> Schedule New Show
            </button>
          </div>

          {/* Schedule Show Form */}
          {showShowForm && (
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <h4 className="text-xs font-black uppercase text-white tracking-wider">Configure Screening Slot</h4>
                <button onClick={() => setShowShowForm(false)} className="text-zinc-500 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleShowSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-zinc-500 font-bold block">Select Movie</label>
                  <select
                    required value={showForm.movieId}
                    onChange={(e) => setShowForm({ ...showForm, movieId: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-200 rounded-xl px-3 py-2"
                  >
                    <option value="">-- Choose Movie --</option>
                    {movies.filter(m => !m.isComingSoon).map(m => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-500 font-bold block">Select Theatre</label>
                  <select
                    required value={showForm.theatreId}
                    onChange={(e) => {
                      const tId = e.target.value;
                      const th = theatres.find(t => t.id === tId);
                      setShowForm({
                        ...showForm,
                        theatreId: tId,
                        screenId: th?.screens[0]?.id || ''
                      });
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-200 rounded-xl px-3 py-2"
                  >
                    <option value="">-- Choose Theatre --</option>
                    {theatres.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.city})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-500 font-bold block">Select Screen</label>
                  <select
                    required value={showForm.screenId}
                    onChange={(e) => setShowForm({ ...showForm, screenId: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-200 rounded-xl px-3 py-2"
                  >
                    <option value="">-- Choose Screen --</option>
                    {theatres.find(t => t.id === showForm.theatreId)?.screens.map(scr => (
                      <option key={scr.id} value={scr.id}>{scr.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-500 font-bold block">Show Date (YYYY-MM-DD)</label>
                  <input
                    type="text" required value={showForm.date}
                    onChange={(e) => setShowForm({ ...showForm, date: e.target.value })}
                    placeholder="e.g. 2026-07-06"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-500 font-bold block">Show Time (HH:MM)</label>
                  <input
                    type="text" required value={showForm.time}
                    onChange={(e) => setShowForm({ ...showForm, time: e.target.value })}
                    placeholder="18:30"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-500 font-bold block">Base Ticket Price (₹)</label>
                  <input
                    type="number" required value={showForm.ticketPrice}
                    onChange={(e) => setShowForm({ ...showForm, ticketPrice: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 pt-4 flex gap-3">
                  <button
                    type="button" onClick={() => setShowShowForm(false)}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-bold py-2.5 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-amber-400 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-zinc-950 font-black py-2.5 rounded-xl transition-all"
                  >
                    Save Screening
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List scheduled shows table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-950 border-b border-zinc-800/80 text-zinc-400 font-black uppercase tracking-wider">
                    <th className="px-5 py-3">Movie</th>
                    <th className="px-5 py-3">Theatre / Location</th>
                    <th className="px-5 py-3">Screen</th>
                    <th className="px-5 py-3">Schedule Slot</th>
                    <th className="px-5 py-3">Price</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {shows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-zinc-500 italic">No scheduled screenings recorded.</td>
                    </tr>
                  ) : (
                    shows.map(show => (
                      <tr key={show.id} className="hover:bg-zinc-900/30">
                        <td className="px-5 py-3 font-extrabold text-zinc-200">{getMovieTitle(show.movieId)}</td>
                        <td className="px-5 py-3 text-zinc-400">{getTheatreName(show.theatreId)}</td>
                        <td className="px-5 py-3 font-mono font-bold text-zinc-500">{show.screenId.toUpperCase()}</td>
                        <td className="px-5 py-3 font-semibold text-zinc-300">
                          {show.date} @ {show.time}
                        </td>
                        <td className="px-5 py-3 font-mono text-amber-400 font-extrabold">₹{show.ticketPrice}</td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => handleDeleteShow(show.id)}
                            className="text-rose-400 hover:text-rose-300 font-bold bg-zinc-950 border border-zinc-850 px-2.5 py-1 rounded transition-colors"
                          >
                            Cancel Show
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-6 animate-fadeIn">
          <h3 className="text-sm font-black uppercase text-white tracking-wider">Real-time Transaction Roster ({bookings.length})</h3>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-950 border-b border-zinc-800/80 text-zinc-400 font-black uppercase tracking-wider">
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Movie</th>
                    <th className="px-5 py-3">Theatre / Seats</th>
                    <th className="px-5 py-3">Date / Time</th>
                    <th className="px-5 py-3 text-right">Gross Paid</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-zinc-500 italic">No reservation transactions.</td>
                    </tr>
                  ) : (
                    bookings.map(b => (
                      <tr key={b.id} className="hover:bg-zinc-900/30">
                        <td className="px-5 py-3">
                          <div className="font-bold text-zinc-200">{b.user?.name || 'Guest'}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">{b.user?.email || '-'}</div>
                        </td>
                        <td className="px-5 py-3 font-semibold text-zinc-300">{b.movie?.title || b.movieId}</td>
                        <td className="px-5 py-3">
                          <div className="font-semibold text-zinc-400">{b.theatre?.name || b.theatreId}</div>
                          <div className="text-[10px] font-mono text-amber-400 font-bold">Seats: {b.seats.join(', ')}</div>
                        </td>
                        <td className="px-5 py-3 text-zinc-400">
                          {b.show ? `${b.show.date} @ ${b.show.time}` : b.createdAt.split('T')[0]}
                        </td>
                        <td className="px-5 py-3 text-right font-mono font-black text-white">
                          ₹{b.totalAmount}
                          {b.discountAmount > 0 && <div className="text-[9px] text-emerald-400 font-bold">(-₹{b.discountAmount})</div>}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {b.bookingStatus === 'cancelled' ? (
                            <span className="text-[10px] uppercase font-bold text-rose-500/80 bg-rose-550/10 border border-rose-500/10 px-2 py-0.5 rounded-full">
                              Refunded
                            </span>
                          ) : (
                            <button
                              onClick={() => handleCancelBooking(b.id)}
                              className="text-xs text-rose-400 hover:text-rose-300 bg-zinc-950 border border-zinc-850 px-2 py-1 rounded"
                            >
                              Refund & Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: COUPONS */}
      {activeTab === 'coupons' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black uppercase text-white tracking-wider">Coupons & Promos ({coupons.length})</h3>
            <button
              onClick={() => setShowCouponForm(true)}
              className="bg-gradient-to-r from-amber-400 to-rose-500 text-zinc-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Plus size={14} className="stroke-[2.5]" /> Generate Coupon
            </button>
          </div>

          {/* Create Coupon Modal Form */}
          {showCouponForm && (
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <h4 className="text-xs font-black uppercase text-white tracking-wider">Create Promotional Discount Voucher</h4>
                <button onClick={() => setShowCouponForm(false)} className="text-zinc-500 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCouponSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-zinc-500 font-bold block">Coupon Code (Uppercase)</label>
                  <input
                    type="text" required value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. EXTRA25"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-500 font-bold block">Voucher Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-200 rounded-xl px-3 py-2"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Cash Discount (₹)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-500 font-bold block">Discount Value</label>
                  <input
                    type="number" required value={couponForm.value}
                    onChange={(e) => setCouponForm({ ...couponForm, value: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-500 font-bold block">Minimum Purchase Requirement (₹)</label>
                  <input
                    type="number" required value={couponForm.minPurchase}
                    onChange={(e) => setCouponForm({ ...couponForm, minPurchase: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-200 rounded-xl px-3 py-2"
                  />
                </div>

                <div className="sm:col-span-2 pt-4 flex gap-3">
                  <button
                    type="button" onClick={() => setShowCouponForm(false)}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-bold py-2.5 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-amber-400 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-zinc-950 font-black py-2.5 rounded-xl transition-all"
                  >
                    Generate Voucher
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List Coupons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {coupons.map(coupon => (
              <div key={coupon.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex justify-between items-center hover:border-zinc-700 transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-amber-400 bg-zinc-950 border border-zinc-850 px-2.5 py-1 rounded-lg text-xs tracking-wider">
                      {coupon.code}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-semibold pt-1">
                    Discount: <span className="text-zinc-200">{coupon.discountType === 'percentage' ? `${coupon.value}% Off` : `₹${coupon.value} Off`}</span>
                  </p>
                  <p className="text-[9px] text-zinc-500 font-mono">Min Ticket purchase: ₹{coupon.minPurchase}</p>
                </div>

                <button
                  onClick={() => handleDeleteCoupon(coupon.id)}
                  className="p-2 text-zinc-500 hover:text-rose-400 transition-colors bg-zinc-950 border border-zinc-850 rounded-xl"
                >
                  <Trash size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
