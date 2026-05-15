import { Mail, Phone, MapPin, Instagram, Facebook, Youtube, Heart, ArrowUp, Music, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export function Footer() {
  const { t } = useLanguage();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="main-footer" className="bg-[#1A1A1A] text-white pt-32 pb-20 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8 mb-32">
          {/* Logo and Brand */}
          <div className="md:col-span-12 lg:col-span-5 space-y-10">
            <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-tighter">
              FRANCK <span className="text-[#D4AF37]">EVENTS</span>
            </h2>
            <p className="text-white/40 max-w-md font-light text-lg leading-relaxed italic">
              {t('footer_tagline')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#D4AF37] hover:border-[#D4AF37] transition-all duration-500 hover:-translate-y-2" title="Instagram"><Instagram size={20} /></a>
              <a href="#" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#D4AF37] hover:border-[#D4AF37] transition-all duration-500 hover:-translate-y-2" title="Facebook"><Facebook size={20} /></a>
              <a href="#" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#D4AF37] hover:border-[#D4AF37] transition-all duration-500 hover:-translate-y-2" title="TikTok"><Music size={20} /></a>
              <a href="#" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#D4AF37] hover:border-[#D4AF37] transition-all duration-500 hover:-translate-y-2" title="WhatsApp"><MessageCircle size={20} /></a>
              <a href="#" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#D4AF37] hover:border-[#D4AF37] transition-all duration-500 hover:-translate-y-2" title="YouTube"><Youtube size={20} /></a>
            </div>
          </div>

          {/* Nav Links */}
          <div className="md:col-span-4 lg:col-span-2 space-y-8">
             <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#D4AF37]">{t('footer_nav')}</h3>
             <ul className="space-y-4 text-sm">
               <li><Link to="/" className="text-white/60 hover:text-[#D4AF37] transition-colors font-light">{t('nav_home')}</Link></li>
               <li><Link to="/services" className="text-white/60 hover:text-[#D4AF37] transition-colors font-light">{t('nav_services')}</Link></li>
               <li><Link to="/portfolio" className="text-white/60 hover:text-[#D4AF37] transition-colors font-light">{t('nav_portfolio')}</Link></li>
               <li><Link to="/calendar" className="text-white/60 hover:text-[#D4AF37] transition-colors font-light">{t('nav_calendar')}</Link></li>
               <li><Link to="/blog" className="text-white/60 hover:text-[#D4AF37] transition-colors font-light">{t('nav_blog')}</Link></li>
               <li><Link to="/admin" className="text-white/20 hover:text-[#D4AF37] transition-colors font-bold uppercase tracking-[0.2em] text-[9px]">Admin</Link></li>
             </ul>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-4 lg:col-span-2 space-y-8">
             <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#D4AF37]">{t('footer_offices')}</h3>
             <ul className="space-y-6 text-sm">
               <li className="flex items-start space-x-4">
                 <MapPin size={16} className="text-[#D4AF37] mt-1 shrink-0" />
                 <span className="text-white/60 font-light underline underline-offset-4 decoration-white/10">Avenue du Fleuve, Brazzaville</span>
               </li>
               <li className="flex items-center space-x-4">
                 <Phone size={16} className="text-[#D4AF37] shrink-0" />
                 <span className="text-white/60 font-light">+242 06 123 4567</span>
               </li>
               <li className="flex items-center space-x-4">
                 <Mail size={16} className="text-[#D4AF37] shrink-0" />
                 <span className="text-white/60 font-light">contact@franck-events.cg</span>
               </li>
             </ul>
          </div>

          {/* Call to Action Small */}
          <div className="md:col-span-4 lg:col-span-3 space-y-8">
             <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#D4AF37]">{t('footer_inspiration')}</h3>
             <p className="text-sm text-white/40 font-light italic leading-loose">
               {t('footer_newsletter')}
             </p>
             <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
               <input 
                 type="email" 
                 placeholder="Email" 
                 className="bg-transparent border-none py-3 px-6 w-full text-xs outline-none focus:ring-0 text-white"
               />
               <button className="bg-[#D4AF37] text-white px-6 rounded-full text-[10px] font-bold tracking-widest uppercase hover:bg-white hover:text-[#1A1A1A] transition-all">OK</button>
             </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 gap-8">
          <div className="flex items-center space-x-2 text-[10px] text-white/40 tracking-widest uppercase">
            <span>© 2024 Franck Events</span>
            <span>•</span>
            <span className="flex items-center space-x-1">Design with <Heart size={10} className="text-[#D4AF37] mx-1" /> in Brazzaville</span>
          </div>
          
          <button 
            onClick={scrollToTop}
            className="group flex flex-col items-center space-y-4"
          >
             <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:border-[#D4AF37] transition-all duration-700">
               <ArrowUp size={18} className="group-hover:-translate-y-1 transition-transform" />
             </div>
          </button>

          <div className="flex space-x-8 text-[10px] text-white/40 font-bold uppercase tracking-widest">
             <Link to="#" className="hover:text-white transition-colors">Légal</Link>
             <Link to="#" className="hover:text-white transition-colors">Politique</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
