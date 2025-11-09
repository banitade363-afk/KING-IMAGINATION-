import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SunIcon, MoonIcon, UserCircleIcon, CogIcon, PhotographIcon, CreditCardIcon, LoginIcon, LogoutIcon, MenuIcon, XIcon } from './Icons';

const ThemeToggle: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [isDarkMode]);

  return (
    <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full text-light-subtle dark:text-dark-subtle hover:bg-slate-500/10 transition-colors">
      {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
    </button>
  );
};


const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinkClass = "px-3 py-2 rounded-md text-sm font-medium transition-colors text-light-subtle dark:text-dark-subtle hover:text-light-text dark:hover:text-dark-text";
  const activeLinkClass = "bg-primary-500/10 text-primary-500 dark:text-white";

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => `${navLinkClass} ${isActive ? activeLinkClass : ''}`;

  const renderNavLinks = (isMobile: boolean = false) => (
    <>
      <NavLink to="/generate" className={getNavLinkClass} onClick={() => isMobile && setIsMenuOpen(false)}><PhotographIcon className="inline w-5 h-5 mr-1.5"/> Generate</NavLink>
      <NavLink to="/credits" className={getNavLinkClass} onClick={() => isMobile && setIsMenuOpen(false)}><CreditCardIcon className="inline w-5 h-5 mr-1.5"/> Credits</NavLink>
      <NavLink to="/images" className={getNavLinkClass} onClick={() => isMobile && setIsMenuOpen(false)}><UserCircleIcon className="inline w-5 h-5 mr-1.5"/> My Images</NavLink>
      {user?.role === 'admin' && (
        <NavLink to="/admin" className={getNavLinkClass} onClick={() => isMobile && setIsMenuOpen(false)}><CogIcon className="inline w-5 h-5 mr-1.5"/> Admin</NavLink>
      )}
    </>
  );
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-lg border-b border-light-border dark:border-dark-border">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <NavLink to="/" className="flex-shrink-0 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-indigo-500">
              Imagina
            </NavLink>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-2">
                {user && renderNavLinks()}
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <div className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full shadow-subtle">
                  {user.role === 'admin' ? '∞' : user.credits} Credits
                </div>
                <button onClick={handleLogout} className={`${navLinkClass} flex items-center`}><LogoutIcon className="inline w-5 h-5 mr-1.5"/> Logout</button>
              </>
            ) : (
              <NavLink to="/auth" className={`${navLinkClass} flex items-center`}><LoginIcon className="inline w-5 h-5 mr-1.5"/> Login / Sign Up</NavLink>
            )}
            <ThemeToggle />
          </div>
          <div className="-mr-2 flex md:hidden">
             <ThemeToggle />
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-light-subtle dark:text-dark-subtle hover:bg-slate-500/10 ml-2">
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <XIcon className="block h-6 w-6" /> : <MenuIcon className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden bg-light-bg/95 dark:bg-dark-bg/95 backdrop-blur-lg pb-4 border-b border-light-border dark:border-dark-border">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            {user ? (
              <>
                {renderNavLinks(true)}
                 <div className="px-3 py-2 mt-4">
                    <div className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full shadow-subtle w-fit">
                      {user.role === 'admin' ? '∞' : user.credits} Credits
                    </div>
                  </div>
                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className={`${navLinkClass} text-left mt-2`}><LogoutIcon className="inline w-5 h-5 mr-1.5"/> Logout</button>
              </>
            ) : (
              <NavLink to="/auth" className={getNavLinkClass} onClick={() => setIsMenuOpen(false)}><LoginIcon className="inline w-5 h-5 mr-1.5"/> Login / Sign Up</NavLink>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;