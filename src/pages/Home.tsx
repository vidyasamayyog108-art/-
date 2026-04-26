import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { Heart, ShieldCheck, Users, Star, Landmark, BookMarked as Hand } from 'lucide-react';
import { motion } from 'motion/react';
import AdBanner from '../components/AdBanner';

export default function Home() {
  const { t } = useLanguage();

  const features = [
    { icon: <Landmark className="text-maroon" size={32} />, title: t('feature.exclusive.title'), desc: t('feature.exclusive.desc') },
    { icon: <Heart className="text-gold" size={32} />, title: t('feature.kundali.title'), desc: t('feature.kundali.desc') },
    { icon: <ShieldCheck className="text-maroon" size={32} />, title: t('feature.secure.title'), desc: t('feature.secure.desc') },
    { icon: <Users className="text-gold" size={32} />, title: t('feature.messaging.title'), desc: t('feature.messaging.desc') }
  ];

  return (
    <div className="flex flex-col">
      <AdBanner />
      
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden bg-maroon-dark">
        <div className="absolute inset-0 opacity-40">
           <img 
             src="https://images.unsplash.com/photo-1621244290494-0d9c4fd7723d?q=80&w=2070&auto=format&fit=crop" 
             alt="Wedding background" 
             className="w-full h-full object-cover"
           />
        </div>
        <div className="relative text-center px-4 max-w-4xl flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-32 h-32 md:w-48 md:h-48 bg-maroon rounded-full border-4 border-gold shadow-2xl flex items-center justify-center mb-8"
          >
            <Hand size={80} className="text-gold md:w-32 md:h-32" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl text-gold mb-6 font-display"
          >
            {t('hero.title')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white text-xl md:text-2xl mb-10 font-sans tracking-wide"
          >
            {t('hero.subtitle')}
          </motion.p>
          <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.4 }}
          >
            <Link 
              to="/login" 
              className="bg-gold hover:bg-gold-light text-maroon font-bold py-4 px-10 rounded-full text-lg shadow-xl shadow-black/20 uppercase tracking-widest transition-all"
            >
              {t('hero.cta')}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats/Intro Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl text-maroon mb-12 relative inline-block">
            {t('section.why.title')}
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-gold rounded-full"></span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="p-8 rounded-2xl bg-amber-50 border border-gold-light shadow-sm"
              >
                <div className="mb-4 flex justify-center">{f.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Preview */}
      <section className="py-20 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl text-maroon font-display mb-2">{t('nav.stories')}</h2>
              <p className="text-gray-600">{t('section.stories.subtitle')}</p>
            </div>
            <Link to="/stories" className="text-maroon font-bold hover:underline">View All &rarr;</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gold-light">
                <div className="h-64 overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1000&auto=format&fit=crop`}
                    alt="Couple"
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex text-gold mb-2"><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/>< Star size={16} fill="currentColor"/></div>
                  <h3 className="text-xl font-bold text-maroon mb-2">Amit & Neha</h3>
                  <p className="text-gray-600 text-sm italic">"We found our perfect match through Vivah Setu. The community-based approach made everything feel trustful and easy."</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-maroon text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-4xl font-display mb-6">{t('section.cta.title')}</h2>
          <p className="text-gold-light text-lg mb-10 tracking-wide">{t('section.cta.desc')}</p>
          <Link 
            to="/login" 
            className="border-2 border-gold text-gold hover:bg-gold hover:text-maroon font-bold py-4 px-12 rounded-full text-lg transition-all"
          >
            {t('section.cta.button')}
          </Link>
        </div>
      </section>
    </div>
  );
}
