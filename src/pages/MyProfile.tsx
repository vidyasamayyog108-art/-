import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../LanguageContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Calendar, Clock, MapPin, Upload, Save, Loader2, Plus, Heart } from 'lucide-react';
import { UserProfile } from '../types';

export default function MyProfile() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    fullName: '',
    subCaste: '',
    gotra: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    gender: 'male',
    profilePhotoUrl: '',
    extraPhotoUrls: [],
    horoscopePhotoUrl: '',
    education: '',
    occupation: '',
    height: '',
    weight: '',
    bloodGroup: '',
    preferences: {
      minAge: 18,
      maxAge: 45,
      requiredEducation: '',
      preferredNativePlace: ''
    }
  });

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    } else {
      const pendingPhone = localStorage.getItem('pending_phone');
      if (pendingPhone) {
        setFormData(prev => ({ ...prev, phoneNumber: pendingPhone }));
      }
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    const queryPath = 'users';
    try {
      const profileData = {
        ...formData,
        uid: user.uid,
        status: profile?.status || 'pending',
        isPremium: profile?.isPremium || false,
        isVerified: profile?.isVerified || false,
        updatedAt: new Date().toISOString(),
        createdAt: profile?.createdAt || new Date().toISOString(),
      };

      await setDoc(doc(db, queryPath, user.uid), profileData);
      
      if (!profile?.isPremium) {
        navigate('/membership');
      } else {
        navigate('/profiles');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, queryPath);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'horoscope' | 'extra') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File too large (max 5MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'profile') setFormData(prev => ({ ...prev, profilePhotoUrl: result }));
        else if (type === 'horoscope') setFormData(prev => ({ ...prev, horoscopePhotoUrl: result }));
        else if (type === 'extra') setFormData(prev => ({ ...prev, extraPhotoUrls: [...(prev.extraPhotoUrls || []), result] }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-gold"
      >
        <div className="bg-maroon p-8 text-white text-center">
          <h2 className="text-3xl font-display text-gold mb-2">{t('nav.profile')}</h2>
          <p className="opacity-80">Complete your profile to find your perfect partner</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-12">
          {/* Photos & Horoscope */}
          <section className="space-y-6">
            <h3 className="text-xl font-bold text-maroon border-b-2 border-gold pb-2 flex items-center gap-2">
              <Upload size={20} /> {t('profile.upload')} & {t('profile.horoscope')}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 items-start">
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-bold text-gray-600">Profile Photo</p>
                <div className="w-32 h-32 rounded-2xl bg-gray-100 border-2 border-gold overflow-hidden relative group">
                  {formData.profilePhotoUrl ? (
                    <img src={formData.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="m-auto mt-8 text-gray-300" />
                  )}
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Upload className="text-white" />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'profile')} />
                  </label>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-bold text-gray-600">Horoscope (Kundali)</p>
                <div className="w-32 h-32 rounded-2xl bg-gray-100 border-2 border-gold overflow-hidden relative group">
                  {formData.horoscopePhotoUrl ? (
                    <img src={formData.horoscopePhotoUrl} alt="Horoscope" className="w-full h-full object-cover" />
                  ) : (
                    <Clock size={48} className="m-auto mt-8 text-gray-300" />
                  )}
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Upload className="text-white" />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'horoscope')} />
                  </label>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-bold text-gray-600">More Photos</p>
                <div className="flex gap-2 overflow-x-auto w-full pb-2">
                  <label className="w-16 h-16 shrink-0 rounded-lg bg-gray-50 border-2 border-dashed border-gold flex items-center justify-center cursor-pointer hover:bg-gold/10">
                    <Plus size={24} className="text-gold" />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'extra')} />
                  </label>
                  {formData.extraPhotoUrls?.map((url, i) => (
                    <div key={i} className="w-16 h-16 shrink-0 rounded-lg border border-gold overflow-hidden">
                      <img src={url} alt={`Extra ${i}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Personal Details */}
          <section className="space-y-6">
            <h3 className="text-xl font-bold text-maroon border-b-2 border-gold pb-2 flex items-center gap-2">
              <User size={20} /> Personal Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-full">
                <label className="block text-sm font-bold text-maroon mb-1">Full Name</label>
                <input 
                  type="text" required
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-gold outline-none bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-maroon mb-1">{t('profile.subcaste')}</label>
                <input 
                  type="text" required
                  value={formData.subCaste}
                  onChange={e => setFormData({...formData, subCaste: e.target.value})}
                  className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-gold outline-none bg-gray-50"
                  placeholder="e.g. Setwal"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-maroon mb-1">{t('profile.gotra')}</label>
                <input 
                  type="text" required
                  value={formData.gotra}
                  onChange={e => setFormData({...formData, gotra: e.target.value})}
                  className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-gold outline-none bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-maroon mb-1">Education</label>
                <input 
                  type="text" required
                  value={formData.education}
                  onChange={e => setFormData({...formData, education: e.target.value})}
                  className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-gold outline-none bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-maroon mb-1">Occupation</label>
                <input 
                  type="text" required
                  value={formData.occupation}
                  onChange={e => setFormData({...formData, occupation: e.target.value})}
                  className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-gold outline-none bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-maroon mb-1">Height</label>
                  <input 
                    type="text" placeholder="e.g. 5'8\"
                    value={formData.height}
                    onChange={e => setFormData({...formData, height: e.target.value})}
                    className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-gold outline-none bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-maroon mb-1">Weight</label>
                  <input 
                    type="text" placeholder="kg"
                    value={formData.weight}
                    onChange={e => setFormData({...formData, weight: e.target.value})}
                    className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-gold outline-none bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-maroon mb-1">Blood Group</label>
                <input 
                  type="text"
                  value={formData.bloodGroup}
                  onChange={e => setFormData({...formData, bloodGroup: e.target.value})}
                  className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-gold outline-none bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-maroon mb-1">Gender</label>
                <select 
                  value={formData.gender}
                  onChange={e => setFormData({...formData, gender: e.target.value as 'male' | 'female'})}
                  className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-gold outline-none bg-gray-50"
                  required
                >
                  <option value="male">Male (वर)</option>
                  <option value="female">Female (वधू)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-maroon mb-1">Mobile Number</label>
                <input 
                  type="tel"
                  value={formData.phoneNumber}
                  disabled
                  className="w-full border-2 border-gray-100 rounded-xl p-3 bg-gray-100 text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>
          </section>

          {/* Birth Details */}
          <section className="space-y-6">
            <h3 className="text-xl font-bold text-maroon border-b-2 border-gold pb-2 flex items-center gap-2">
              <Calendar size={20} /> Birth Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-maroon mb-1">{t('profile.dob')}</label>
                <input type="date" required value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-maroon mb-1">{t('profile.tob')}</label>
                <input type="time" required value={formData.birthTime} onChange={e => setFormData({...formData, birthTime: e.target.value})} className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-maroon mb-1">{t('profile.pob')}</label>
                <input type="text" required value={formData.birthPlace} onChange={e => setFormData({...formData, birthPlace: e.target.value})} className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none" />
              </div>
            </div>
          </section>

          {/* Partner Preferences */}
          <section className="space-y-6">
            <h3 className="text-xl font-bold text-maroon border-b-2 border-gold pb-2 flex items-center gap-2">
              <Heart size={20} className="text-red-500" /> {t('profile.preferences')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-maroon mb-1">Min Age</label>
                  <input type="number" value={formData.preferences?.minAge} onChange={e => setFormData({...formData, preferences: {...formData.preferences!, minAge: parseInt(e.target.value)}})} className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-maroon mb-1">Max Age</label>
                  <input type="number" value={formData.preferences?.maxAge} onChange={e => setFormData({...formData, preferences: {...formData.preferences!, maxAge: parseInt(e.target.value)}})} className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-maroon mb-1">Preferred Education</label>
                <input type="text" value={formData.preferences?.requiredEducation} onChange={e => setFormData({...formData, preferences: {...formData.preferences!, requiredEducation: e.target.value}})} className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none" />
              </div>
            </div>
          </section>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-maroon text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-maroon-dark shadow-xl shadow-maroon/20 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><Save size={24} /> {t('common.save')}</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
