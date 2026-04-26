import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { UserProfile } from '../types';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, MapPin, Calendar, Clock, Crown, Heart, Landmark, Briefcase, GraduationCap, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Profiles() {
  const { profile: myProfile } = useAuth();
  const { t } = useLanguage();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [subCasteFilter, setSubCasteFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!myProfile) return;

    const queryPath = 'users';
    const q = query(collection(db, queryPath), where('status', '==', 'approved'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs
        .map(doc => ({ ...doc.data(), uid: doc.id } as UserProfile))
        .filter(p => p.uid !== myProfile?.uid);
      setProfiles(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, queryPath);
    });
    return () => unsub();
  }, [myProfile]);

  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = p.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
                          p.occupation?.toLowerCase().includes(searchText.toLowerCase()) ||
                          p.education?.toLowerCase().includes(searchText.toLowerCase());
    const matchesGender = genderFilter === 'all' || p.gender === genderFilter;
    const matchesSubCaste = !subCasteFilter || p.subCaste.toLowerCase().includes(subCasteFilter.toLowerCase());
    
    return matchesSearch && matchesGender && matchesSubCaste;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
        <div>
           <h2 className="text-4xl font-display text-maroon mb-2">{t('profile.browse')}</h2>
           <p className="text-gray-600">Find your ideal match within Digambar Jain community</p>
        </div>
        
        <div className="flex flex-col gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold" size={20} />
            <input 
              type="text"
              placeholder={t('profile.search')}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full bg-white border-2 border-gold-light rounded-2xl py-3 pl-12 pr-4 focus:border-maroon outline-none shadow-sm"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 bg-white border-2 border-gold-light py-2 px-6 rounded-xl text-maroon font-bold hover:bg-gold-light transition-all"
          >
            <Filter size={18} /> Filters
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="bg-white border-2 border-gold-light rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              <button 
                onClick={() => setShowFilters(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-maroon"
              >
                <X size={20} />
              </button>
              <div>
                <label className="block text-sm font-bold text-maroon mb-2">Gender</label>
                <select 
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value as any)}
                  className="w-full border-2 border-gray-100 rounded-xl p-2 outline-none focus:border-gold"
                >
                  <option value="all">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-maroon mb-2">{t('profile.subcaste')}</label>
                <input 
                  type="text"
                  placeholder="Filter by sub-caste"
                  value={subCasteFilter}
                  onChange={(e) => setSubCasteFilter(e.target.value)}
                  className="w-full border-2 border-gray-100 rounded-xl p-2 outline-none focus:border-gold"
                />
              </div>
              <div className="flex items-end">
                <button 
                  onClick={() => {
                    setGenderFilter('all');
                    setSubCasteFilter('');
                    setSearchText('');
                  }}
                  className="w-full bg-gray-100 text-gray-600 font-bold py-2 rounded-xl hover:bg-gray-200 transition-all"
                >
                  Reset All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!myProfile?.isPremium && (
        <div className="bg-maroon p-6 rounded-3xl text-white mb-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
              <Crown size={120} />
           </div>
           <div className="relative z-10">
              <h3 className="text-2xl font-display text-gold mb-1">Upgrade to Premium</h3>
              <p className="opacity-80">View full details, photos, and expressive interests.</p>
           </div>
           <Link to="/membership" className="bg-gold text-maroon font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gold-light transition-all whitespace-nowrap relative z-10">
              Subscribe Now
           </Link>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-maroon border-t-gold"></div>
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-gold-light">
           <Heart size={64} className="text-gold mx-auto mb-4 opacity-30" />
           <h3 className="text-xl text-gray-500">No matching profiles found.</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProfiles.map((p) => (
            <ProfileCardComponent key={p.uid} profile={p} isPremium={myProfile?.isPremium || false} />
          ))}
        </div>
      )}
    </div>
  );
}

interface ProfileCardProps {
  profile: UserProfile;
  isPremium: boolean;
  key?: string;
}

function ProfileCardComponent({ profile, isPremium }: ProfileCardProps) {
  const { t } = useLanguage();
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl shadow-lg border border-gold-light overflow-hidden group hover:border-maroon transition-all flex flex-col h-full"
    >
      <div className="h-64 relative overflow-hidden">
        <img 
          src={profile.profilePhotoUrl || 'https://via.placeholder.com/400x400?text=Profile'} 
          alt={profile.fullName} 
          className={`w-full h-full object-cover transition-all duration-700 ${!isPremium ? 'blur-md grayscale' : 'group-hover:scale-110'}`}
        />
        {profile.isPremium && (
          <div className="absolute top-4 right-4 bg-gold text-maroon p-2 rounded-full shadow-lg">
            <Crown size={18} />
          </div>
        )}
        {!isPremium && (
          <div className="absolute inset-0 bg-maroon/20 flex flex-col items-center justify-center text-white backdrop-blur-[4px]">
             <span className="font-bold px-4 py-2 bg-maroon/80 rounded-full text-[10px] uppercase tracking-widest border border-gold">Upgrade to Unblur</span>
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-display text-maroon">{isPremium ? profile.fullName : '********'}</h3>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">{profile.subCaste}</p>
          </div>
          <div className="bg-amber-50 px-3 py-1 rounded-full text-gold flex items-center gap-1 border border-gold-light">
             <Landmark size={14} />
             <span className="text-xs font-bold font-sans">{profile.gotra}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2 text-gray-600 text-xs">
            <GraduationCap size={14} className="text-maroon shrink-0" />
            <span className="truncate">{isPremium ? profile.education : '****'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-xs">
            <Briefcase size={14} className="text-maroon shrink-0" />
            <span className="truncate">{isPremium ? profile.occupation : '****'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-xs">
            <Calendar size={14} className="text-maroon shrink-0" />
            <span>{isPremium && profile.birthDate ? new Date().getFullYear() - new Date(profile.birthDate).getFullYear() : '??'} Years</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-xs">
            <MapPin size={14} className="text-maroon shrink-0" />
            <span className="truncate">{isPremium ? profile.birthPlace : '****'}</span>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-3">
           <Link 
             to={isPremium ? `/chats/${profile.uid}` : '/membership'} 
             className="flex-grow bg-maroon text-white font-bold py-3 rounded-xl text-center text-sm hover:bg-maroon-dark transition-all flex items-center justify-center gap-2"
           >
             <Heart size={16} /> {t('profile.interest')}
           </Link>
           <Link 
             to={`/kundali-milan?partnerId=${profile.uid}`} 
             className="flex-grow border-2 border-gold text-maroon font-bold py-3 rounded-xl text-center text-sm hover:bg-gold hover:text-white transition-all whitespace-nowrap"
           >
             {t('kundali.button')}
           </Link>
        </div>
      </div>
    </motion.div>
  );
}
