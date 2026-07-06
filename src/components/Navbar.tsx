import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Film, User as UserIcon, LogOut, MapPin, Shield, Star, History, Menu, X } from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage, onOpenAuth }) => {
  const { user, logout, selectedCity, setSelectedCity } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    onNavigate('home');
    setDropdownOpen(false);
  };

  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'];

  return (
    <header id="navbar-header" className="sticky top-0 z-50 backdrop-blur-xl bg-[#040406]/65 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="bg-gradient-to-tr from-amber-500 to-rose-500 p-2 rounded-xl text-zinc-950 shadow-lg shadow-rose-500/10">
              <Film size={20} className="font-bold stroke-[2.5]" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">
              CineTicket
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onNavigate('home')}
              className={`text-sm font-medium transition-colors hover:text-white ${
                currentPage === 'home' ? 'text-amber-400' : 'text-zinc-400'
              }`}
            >
              Movies
            </button>
            {user && (
              <button
                onClick={() => onNavigate('profile')}
                className={`text-sm font-medium transition-colors hover:text-white flex items-center gap-1.5 ${
                  currentPage === 'profile' ? 'text-amber-400' : 'text-zinc-400'
                }`}
              >
                <History size={14} /> Bookings
              </button>
            )}
            {user?.role === 'admin' && (
              <button
                onClick={() => onNavigate('admin')}
                className={`text-sm font-medium transition-colors hover:text-white flex items-center gap-1.5 ${
                  currentPage === 'admin' ? 'text-amber-400' : 'text-zinc-400'
                }`}
              >
                <Shield size={14} className="text-amber-400" /> Admin Panel
              </button>
            )}
          </nav>

          {/* City Selector and User Profile */}
          <div className="hidden md:flex items-center gap-4">
            {/* City Selector */}
            <div className="relative flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-zinc-300">
              <MapPin size={13} className="text-rose-500" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent border-none text-zinc-200 focus:outline-none cursor-pointer font-medium"
              >
                {cities.map((city) => (
                  <option key={city} value={city} className="bg-zinc-900 text-zinc-300">
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-1.5 transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                    {user.name.substring(0, 1).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-zinc-300">{user.name}</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#09090b]/80 border border-white/10 rounded-xl shadow-xl py-1 z-50 backdrop-blur-xl">
                    <button
                      onClick={() => {
                        onNavigate('profile');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <UserIcon size={14} /> My Profile
                    </button>
                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          onNavigate('admin');
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors flex items-center gap-2"
                      >
                        <Shield size={14} className="text-amber-500" /> Admin Dashboard
                      </button>
                    )}
                    <div className="border-t border-zinc-800 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-zinc-800 transition-colors flex items-center gap-2"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-zinc-950 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-rose-500/10 cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center gap-3">
            {/* City Selector */}
            <div className="relative flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-zinc-300">
              <MapPin size={12} className="text-rose-500" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent border-none text-zinc-200 focus:outline-none cursor-pointer"
              >
                {cities.map((city) => (
                  <option key={city} value={city} className="bg-zinc-900 text-zinc-300">
                    {city.split(' ')[0]}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-zinc-400 hover:text-white p-1"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#040406]/85 border-b border-white/10 px-4 py-4 space-y-3 backdrop-blur-xl">
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900 rounded-lg"
          >
            Movies
          </button>
          {user && (
            <button
              onClick={() => {
                onNavigate('profile');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900 rounded-lg"
            >
              Bookings & Profile
            </button>
          )}
          {user?.role === 'admin' && (
            <button
              onClick={() => {
                onNavigate('admin');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm text-amber-400 hover:bg-zinc-900 rounded-lg font-medium"
            >
              Admin Dashboard
            </button>
          )}
          <div className="border-t border-zinc-900 pt-3">
            {user ? (
              <div className="space-y-2">
                <div className="text-xs text-zinc-500 px-3">Signed in as {user.email}</div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-rose-400 hover:bg-zinc-900 rounded-lg flex items-center gap-2"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-rose-600 to-amber-500 text-zinc-950 font-bold py-2 rounded-lg text-center text-sm"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
