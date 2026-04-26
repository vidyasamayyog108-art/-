import { BookMarked as Hand, Menu, X, Landmark, Heart, ShieldCheck, Users, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import { auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

export default function Header() {
  const { t, language, setLanguage } = useLanguage();
  const { user, profile } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const languages = [
    { code: 'mr', name: 'मराठी' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'en', name: 'EN' }
  ];

  return (
    <header className="bg-white border-b-2 border-gold shadow-sm sticky top-0 z-50">
      {/* Top Bar with Language Switcher */}
      <div className="bg-maroon text-white py-1 px-4 flex justify-between items-center text-sm">
        <div className="flex gap-4">
           {languages.map((lang) => (
             <button 
               key={lang.code}
               onClick={() => setLanguage(lang.code as any)}
               className={`hover:text-gold transition-colors ${language === lang.code ? 'text-gold font-bold underline' : ''}`}
             >
               {lang.name}
             </button>
           ))}
        </div>
        <div className="hidden md:block">
          {t('hero.subtitle')}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-16 h-16 bg-white rounded-full border-2 border-gold shadow-lg flex items-center justify-center transition-transform group-hover:scale-105 overflow-hidden">
              <img src="/logo_vivah_setu.png" alt="Vivah Setu Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-maroon flex flex-col leading-none">
                <span className="font-display">विवाह सेतू</span>
                <span className="text-[10px] font-sans tracking-[0.2em] text-gold-dark uppercase font-bold">Vivah Setu</span>
              </h1>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-maroon font-medium uppercase text-sm tracking-widest">{t('nav.home')}</Link>
            <Link to="/profiles" className="text-gray-700 hover:text-maroon font-medium uppercase text-sm tracking-widest">{t('nav.profiles')}</Link>
            <Link to="/matches" className="text-gray-700 hover:text-maroon font-medium uppercase text-sm tracking-widest">{t('nav.matches')}</Link>
            <Link to="/membership" className="text-gray-700 hover:text-maroon font-medium uppercase text-sm tracking-widest">{t('nav.membership')}</Link>
            <Link to="/stories" className="text-gray-700 hover:text-maroon font-medium uppercase text-sm tracking-widest">{t('nav.stories')}</Link>
            
            {user ? (
              <div className="flex items-center gap-4 ml-4">
                <Link to="/my-profile" className="w-10 h-10 rounded-full bg-maroon text-white flex items-center justify-center overflow-hidden border-2 border-gold">
                  {profile?.profilePhotoUrl ? (
                    <img src={profile.profilePhotoUrl} alt="Me" className="w-full h-full object-cover" />
                  ) : (
                    <Users size={20} />
                  )}
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-maroon text-white px-4 py-2 rounded font-bold hover:bg-maroon-dark transition-colors"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-maroon text-white px-6 py-2 rounded font-bold hover:bg-maroon-dark transition-colors ml-4">
                {t('nav.login')}
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button className="lg:hidden text-maroon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </div>

      {/* Marquee */}
      <div className="marquee-container border-t border-gold-light">
        <div className="marquee-content font-medium py-2">
          {t('marquee.mr')} &nbsp; | &nbsp; {t('marquee.kn')} &nbsp; | &nbsp; {t('marquee.hi')} &nbsp; | &nbsp; {t('marquee.en')} &nbsp; | &nbsp;
          {t('marquee.mr')} &nbsp; | &nbsp; {t('marquee.kn')} &nbsp; | &nbsp; {t('marquee.hi')} &nbsp; | &nbsp; {t('marquee.en')} &nbsp; | &nbsp;
          {t('marquee.mr')} &nbsp; | &nbsp; {t('marquee.kn')} &nbsp; | &nbsp; {t('marquee.hi')} &nbsp; | &nbsp; {t('marquee.en')}
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 px-4 py-6"
          >
            <div className="flex flex-col gap-4 text-center">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-maroon font-bold text-lg">{t('nav.home')}</Link>
              <Link to="/profiles" onClick={() => setIsMenuOpen(false)} className="text-maroon font-bold text-lg">{t('nav.profiles')}</Link>
              <Link to="/matches" onClick={() => setIsMenuOpen(false)} className="text-maroon font-bold text-lg">{t('nav.matches')}</Link>
              <Link to="/membership" onClick={() => setIsMenuOpen(false)} className="text-maroon font-bold text-lg">{t('nav.membership')}</Link>
              <Link to="/stories" onClick={() => setIsMenuOpen(false)} className="text-maroon font-bold text-lg">{t('nav.stories')}</Link>
              {user ? (
                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="text-red-600 font-bold text-lg">{t('nav.logout')}</button>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-maroon font-bold text-lg">{t('nav.login')}</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
