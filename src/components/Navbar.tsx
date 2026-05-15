import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Calendar, Camera, Phone, Info, LayoutGrid, Languages, ChevronDown, Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('nav_home'), path: '/', icon: Info },
    { name: t('nav_services'), path: '/services', icon: Calendar },
    { name: t('nav_calendar'), path: '/calendar', icon: Calendar },
    { name: t('nav_portfolio'), path: '/portfolio', icon: Camera },
    { name: t('nav_blog'), path: '/blog', icon: LayoutGrid },
    { name: t('nav_contact'), path: '/contact', icon: Phone },
  ];

  const languages = [
    { code: 'fr', name: 'Français' },
    { code: 'ln', name: 'Lingala' },
    { code: 'kt', name: 'Kituba' },
  ];

  return (
    <nav 
      id="main-nav"
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-500 px-6 py-4",
        isScrolled ? "bg-[var(--bg-primary)]/80 backdrop-blur-xl shadow-lg border-b border-[var(--border-color)]/50 py-3" : "bg-transparent py-8"
      )}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className={cn(
          "text-2xl font-serif font-bold tracking-tighter transition-colors duration-500",
          !isScrolled && location.pathname === '/' ? "text-white" : "text-[var(--text-primary)]"
        )}>
          FRANCK EVENTS
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-10">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-500 hover:text-[#D4AF37]",
                location.pathname === link.path ? "text-[#D4AF37]" : (!isScrolled && location.pathname === '/' ? "text-white/70" : "text-[var(--text-primary)]")
              )}
            >
              {link.name}
            </Link>
          ))}

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className={cn(
              "p-2 rounded-full transition-all duration-500 hover:bg-[#D4AF37]/10",
              !isScrolled && location.pathname === '/' ? "text-white/70 hover:text-white" : "text-[var(--text-primary)] hover:text-[#D4AF37]"
            )}
            title={theme === 'light' ? 'Mode Sombre' : 'Mode Clair'}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Language Selector */}
          <div className="relative group">
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className={cn(
                "flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-500",
                !isScrolled && location.pathname === '/' ? "text-white/70" : "text-[var(--text-primary)]"
              )}
            >
              <Languages size={14} />
              <span>{languages.find(l => l.code === language)?.name || 'Français'}</span>
              <ChevronDown size={12} className={cn("transition-transform", isLangOpen && "rotate-180")} />
            </button>
            
            <AnimatePresence>
              {isLangOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-4 right-0 bg-[var(--bg-secondary)] shadow-2xl rounded-2xl border border-[var(--border-color)] overflow-hidden min-w-[120px]"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as any);
                        setIsLangOpen(false);
                      }}
                      className={cn(
                        "w-full px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-[var(--bg-primary)]",
                        language === lang.code ? "text-[#D4AF37] bg-[var(--bg-primary)]" : "text-[var(--text-primary)]"
                      )}
                    >
                      {lang.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link 
            to="/contact" 
            className={cn(
              "px-8 py-3 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-500",
              !isScrolled && location.pathname === '/' 
                ? "bg-white text-[#1A1A1A] hover:bg-[#D4AF37] hover:text-white" 
                : "bg-[#1A1A1A] text-white hover:bg-[#D4AF37]"
            )}
          >
            {t('nav_book')}
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className={cn(
            "md:hidden transition-colors duration-500",
            !isScrolled && location.pathname === '/' ? "text-white" : "text-[var(--text-primary)]"
          )} 
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            role="navigation"
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden bg-[var(--bg-secondary)] mt-4 rounded-3xl shadow-2xl border border-[var(--border-color)]"
          >
            <motion.div 
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
                closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
              }}
              className="flex flex-col p-8 space-y-6"
            >
              <motion.div 
                variants={{
                  open: { opacity: 1, y: 0 },
                  closed: { opacity: 0, y: -10 }
                }}
                className="flex justify-between items-center pb-4 border-b border-[var(--border-color)]"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">Menu</span>
                <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-[var(--text-primary)]"
                  aria-label="Changer de thème"
                >
                  {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
              </motion.div>
              {navLinks.map((link) => (
                <motion.div
                  key={link.path}
                  variants={{
                    open: { opacity: 1, x: 0 },
                    closed: { opacity: 0, x: -20 }
                  }}
                >
                  <Link
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center space-x-4 text-xs font-bold uppercase tracking-widest transition-colors group",
                      location.pathname === link.path ? "text-[#D4AF37]" : "text-[var(--text-primary)]"
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#D4AF37]/5 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-white transition-all duration-300">
                      <link.icon size={16} />
                    </div>
                    <span>{link.name}</span>
                  </Link>
                </motion.div>
              ))}
              
              <motion.div 
                variants={{
                  open: { opacity: 1, y: 20 },
                  closed: { opacity: 0, y: 10 }
                }}
                className="pt-6"
              >
                <Link 
                  to="/contact" 
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center py-5 bg-[#D4AF37] text-white rounded-2xl text-[10px] font-bold tracking-[0.2em] uppercase shadow-lg shadow-[#D4AF37]/20"
                >
                  {t('nav_book')}
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
