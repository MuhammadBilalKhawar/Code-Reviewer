import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { Container, Flex } from './ui/Layout';
import { useTheme } from '../context/ThemeContext';

const NAVIGATION_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: '📊' },
  { label: 'Repositories', path: '/repositories', icon: '📚' },
  { label: 'Analysis', path: '/testing', icon: '🔍' },
  { label: 'Advanced', path: '/advanced-testing', icon: '⚡' },
];

export const Header = ({ user, onLogout }) => {
  const { isDark } = useTheme();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-carbon border-b border-copper/10 backdrop-blur-md">
      <Container className="py-4">
        <Flex justify="between" align="center">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-copper to-copper/80 group-hover:shadow-lg group-hover:shadow-copper/20 transition-all">
              <svg className="w-6 h-6 text-carbon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-copper">CodeReview</h1>
              <p className="text-xs text-neon-muted">Premium Edition</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {NAVIGATION_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    px-4 py-2.5 rounded-lg font-semibold transition-all duration-200
                    flex items-center gap-2 text-sm
                    ${isActive 
                      ? 'bg-copper text-carbon shadow-lg shadow-copper/20' 
                      : 'text-neon-text hover:bg-carbon-50 hover:border-copper/30'
                    }
                  `}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <Flex gap="3" align="center">
            {user && (
              <div className="flex items-center gap-3 pl-4 border-l border-copper/10">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-neon-text">{user.name || 'User'}</p>
                  <p className="text-xs text-neon-muted">{user.email || 'user@example.com'}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-copper to-copper/60 flex items-center justify-center text-carbon font-bold">
                  {(user.name || 'U').charAt(0)}
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
            >
              Logout
            </Button>
          </Flex>
        </Flex>
      </Container>
    </header>
  );
};

export default Header;
