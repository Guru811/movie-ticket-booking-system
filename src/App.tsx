import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MovieGrid } from './components/MovieGrid';
import { MovieDetails } from './pages/MovieDetails';
import { ProfileHistory } from './pages/ProfileHistory';
import { AdminDashboard } from './pages/AdminDashboard';
import { Movie } from './types';
import { X, Mail, Lock, User, CheckCircle, AlertCircle, Shield, Key } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, login, register, movies, isLoading } = useApp();
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // Auth Modal states
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setCurrentPage('movie-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    if (page === 'home') {
      setSelectedMovie(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (authTab === 'login') {
      const res = await login(authEmail, authPassword);
      if (res.success) {
        setAuthSuccess('Logged in successfully!');
        setTimeout(() => {
          setAuthOpen(false);
          resetAuthForm();
        }, 800);
      } else {
        setAuthError(res.message || 'Invalid email or password.');
      }
    } else {
      const res = await register(authName, authEmail);
      if (res.success) {
        setAuthSuccess('Account registered! Temporary password is admin123');
        setTimeout(() => {
          setAuthOpen(false);
          resetAuthForm();
        }, 1500);
      } else {
        setAuthError(res.message || 'Registration failed.');
      }
    }
  };

  const resetAuthForm = () => {
    setAuthName('');
    setAuthEmail('');
    setAuthPassword('');
    setAuthError('');
    setAuthSuccess('');
  };

  const loadPreseedCredentials = (email: string) => {
    setAuthEmail(email);
    setAuthPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-[#040406] text-zinc-300 font-sans selection:bg-rose-500 selection:text-zinc-950 flex flex-col justify-between relative overflow-hidden">
      
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-600/15 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-amber-500/8 blur-[100px] rounded-full pointer-events-none z-0" />
      
      {/* Top Header */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenAuth={() => { setAuthTab('login'); setAuthOpen(true); }}
      />

      {/* Main Container */}
      <main className="flex-1 z-10 relative">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-3">
            <div className="w-10 h-10 border-4 border-rose-500/35 border-t-rose-500 rounded-full animate-spin" />
            <p className="text-xs text-zinc-550 font-bold">Initializing cinema database...</p>
          </div>
        ) : (
          <>
            {currentPage === 'home' && (
              <div className="animate-fadeIn space-y-4">
                <Hero movies={movies} onSelectMovie={handleSelectMovie} />
                <MovieGrid movies={movies} onSelectMovie={handleSelectMovie} />
              </div>
            )}

            {currentPage === 'movie-detail' && selectedMovie && (
              <MovieDetails
                movie={selectedMovie}
                onBack={() => handleNavigate('home')}
                onOpenAuth={() => { setAuthTab('login'); setAuthOpen(true); }}
              />
            )}

            {currentPage === 'profile' && user && (
              <ProfileHistory onSelectMovie={handleSelectMovie} />
            )}

            {currentPage === 'admin' && user?.role === 'admin' && (
              <AdminDashboard />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 py-8 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-550">
          <p>© 2026 CineTicket Booking Corp. Engineered for production-ready speeds.</p>
          <div className="flex gap-4">
            <button onClick={() => handleNavigate('home')} className="hover:text-zinc-350 transition-colors">Movies</button>
            <span className="text-zinc-800">•</span>
            <span>Terms of Service</span>
            <span className="text-zinc-800">•</span>
            <span>Privacy Standards</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal Overlay */}
      {authOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-modal rounded-3xl p-6 sm:p-8 space-y-6 relative">
            
            <button
              onClick={() => { setAuthOpen(false); resetAuthForm(); }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Modal Heading */}
            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-white uppercase tracking-wider">
                {authTab === 'login' ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p className="text-xs text-zinc-500">Access cinema stubs, coupon codes, and transaction records.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              
              {authTab === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 block">Full Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-3 text-zinc-450" />
                    <input
                      type="text" required placeholder="John Doe" value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-rose-500/50 text-white rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 block">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-3 text-zinc-450" />
                  <input
                    type="email" required placeholder="user@movies.com" value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 focus:border-rose-500/50 text-white rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {authTab === 'login' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 block">Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-3 text-zinc-450" />
                    <input
                      type="password" required placeholder="••••••••" value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-rose-500/50 text-white rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Status indicator alerts */}
              {authError && (
                <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl font-medium flex items-center gap-1.5">
                  <AlertCircle size={14} /> {authError}
                </div>
              )}
              {authSuccess && (
                <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl font-semibold flex items-center gap-1.5">
                  <CheckCircle size={14} /> {authSuccess}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-400 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-zinc-950 font-black py-3 rounded-xl text-xs transition-all shadow-md shadow-rose-500/10 cursor-pointer"
              >
                {authTab === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            </form>

            {/* Quick pre-seed logins widgets for easy debugging */}
            {authTab === 'login' && (
              <div className="border-t border-zinc-850 pt-4 space-y-2">
                <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider text-center">Quick testing credentials</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => loadPreseedCredentials('admin@movies.com')}
                    className="bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 rounded-xl p-2 text-left cursor-pointer flex flex-col justify-between"
                  >
                    <span className="text-[9px] font-bold text-amber-400 flex items-center gap-1">
                      <Shield size={10} /> Admin login
                    </span>
                    <span className="text-[9px] text-zinc-550 font-mono mt-0.5">admin@movies.com</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPreseedCredentials('user@movies.com')}
                    className="bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 rounded-xl p-2 text-left cursor-pointer flex flex-col justify-between"
                  >
                    <span className="text-[9px] font-bold text-zinc-300 flex items-center gap-1">
                      <User size={10} /> Standard User
                    </span>
                    <span className="text-[9px] text-zinc-550 font-mono mt-0.5">user@movies.com</span>
                  </button>
                </div>
              </div>
            )}

            {/* Toggle Tab */}
            <div className="text-center pt-2">
              {authTab === 'login' ? (
                <p className="text-xs text-zinc-550">
                  Don't have an account?{' '}
                  <button onClick={() => { setAuthTab('register'); resetAuthForm(); }} className="text-rose-400 hover:underline font-bold">
                    Sign Up
                  </button>
                </p>
              ) : (
                <p className="text-xs text-zinc-550">
                  Already have an account?{' '}
                  <button onClick={() => { setAuthTab('login'); resetAuthForm(); }} className="text-rose-400 hover:underline font-bold">
                    Sign In
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
