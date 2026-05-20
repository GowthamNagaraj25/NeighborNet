import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/dashboard', label: '🏠 Dashboard', roles: ['resident', 'organizer', 'admin'] },
    { to: '/notice-board', label: '📋 Notice Board', roles: ['resident', 'organizer', 'admin'] },
    { to: '/map', label: '🗺️ Map', roles: ['resident', 'organizer', 'admin'] },
    { to: '/blood-help', label: '🩸 Blood Help', roles: ['resident', 'organizer', 'admin'] },
    { to: '/chat', label: '💬 Chat', roles: ['resident', 'organizer', 'admin'] },
    { to: '/initiatives', label: '🏘️ Initiatives', roles: ['resident', 'organizer', 'admin'] },
    { to: '/organizer', label: '📊 Organizer', roles: ['organizer', 'admin'] },
    { to: '/admin', label: '⚙️ Admin', roles: ['admin'] },
  ];

  const visibleLinks = navLinks.filter((l) => user && l.roles.includes(user.role));
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2">
            <span className="text-2xl">🏘️</span>
            <div>
              <span className="font-bold text-gray-900 text-lg">NeighborNet</span>
              <span className="text-primary-500 font-bold text-lg"> Resilience</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          {user && (
            <div className="hidden lg:flex items-center gap-1">
              {visibleLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.to) ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Socket indicator */}
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-gray-300'}`} title={connected ? 'Connected' : 'Disconnected'} />

                {/* Profile */}
                <Link to="/profile" className="flex items-center gap-2 hover:bg-gray-50 rounded-xl px-3 py-2 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-warm-400 flex items-center justify-center text-white text-sm font-bold">
                    {user.name[0].toUpperCase()}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900 leading-none">{user.name.split(' ')[0]}</p>
                    <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="hidden md:block text-sm text-gray-500 hover:text-red-600 font-medium transition-colors"
                >
                  Logout
                </button>

                {/* Mobile menu button */}
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
                  <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
                  <div className="w-5 h-0.5 bg-gray-600"></div>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2">Login</Link>
                <Link to="/signup" className="text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl transition-colors">Sign Up</Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && user && (
          <div className="lg:hidden pb-4 border-t border-gray-100 pt-3">
            {visibleLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium mb-1 ${isActive(link.to) ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2.5 text-sm text-red-600 font-medium hover:bg-red-50 rounded-lg"
            >
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
