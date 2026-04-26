import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useLanguage } from '../LanguageContext';
import { motion } from 'motion/react';
import { Phone, ArrowRight, Loader2, BookMarked as Hand } from 'lucide-react';

export default function Login() {
  const { t } = useLanguage();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // "Temporary - without OTP" was requested:
  // Since we can't truly bypass Firebase Auth without a backend, 
  // and the user said "Currently only mobile number entry will login",
  // I will use a placeholder logic that "authenticates" them or uses a specific test flow.
  // Actually, I'll implement a simple "Pseudo-Auth" for this prototype turn 
  // OR use Firebase Anonymous auth linked to the phone number in metadata if real SMS isn't configured yet.
  // But wait, the prompt says "आत्ता फक्त मोबाईल नंबर टाकल्यावर login होईल" (Currently login will happen only by entering mobile number).
  
  // I'll implement a custom "Login" that stores the phone in Firestore and uses it as ID
  // but to keep it secure per Firebase rules, I should use any legitimate Firebase Auth.
  // I'll use Anonymous Sign-In for now and store the phone number in the profile.

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError('Please enter a valid mobile number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use email/password under the hood to bypass restricted anonymous service
      // but keep the user experience as "Login with Mobile"
      const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import('firebase/auth');
      const dummyEmail = `${phone}@vivahsetu.com`;
      const dummyPass = `vivahsetu_${phone}`;
      
      try {
        await signInWithEmailAndPassword(auth, dummyEmail, dummyPass);
      } catch (signErr: any) {
        if (signErr.code === 'auth/user-not-found' || signErr.code === 'auth/invalid-credential') {
          // Create new user if not exists
          await createUserWithEmailAndPassword(auth, dummyEmail, dummyPass);
        } else {
          throw signErr;
        }
      }
      
      localStorage.setItem('pending_phone', phone);
      navigate('/profiles');
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.code === 'auth/operation-not-allowed' 
        ? 'Firebase Console मध्ये "Email/Password" authentication सुरू करा (Enable Email/Password in Firebase Console -> Authentication -> Sign-in method).'
        : (err.message || 'Login failed. Please try again.');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-amber-50 px-4 py-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 md:p-12 rounded-3xl shadow-２xl border-2 border-gold max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="w-32 h-32 bg-white rounded-full border-2 border-gold flex items-center justify-center mx-auto mb-6 shadow-xl overflow-hidden">
            <img src="/logo_vivah_setu.png" alt="Vivah Setu Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          </div>
          <h2 className="text-3xl font-display text-maroon mb-2">{t('nav.login')}</h2>
          <p className="text-gray-500">Exclusively for Digambar Jain Community</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">+91</span>
              <input 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full bg-gray-50 border-2 border-gold-light rounded-2xl py-4 pl-14 pr-4 focus:border-maroon outline-none font-bold text-lg tracking-widest"
                placeholder="9876543210"
                required
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-maroon text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-maroon-dark transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Continue <ArrowRight size={20} /></>}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-400 px-6">
          By continuing, you agree to our Terms of Service and Privacy Policy. OTP verification will be added soon.
        </p>
      </motion.div>
    </div>
  );
}
