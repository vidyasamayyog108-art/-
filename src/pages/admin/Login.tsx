import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { ShieldAlert, Key, Smartphone, Loader2, BookMarked as Hand } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Login, 2: OTP
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Admin should ideally be set up in Firebase with an email/password
      // and their UID added to the 'admins' collection.
      const cred = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if this user is actually an admin in Firestore
      const adminSnap = await getDoc(doc(db, 'admins', cred.user.uid));
      if (adminSnap.exists()) {
        setStep(2);
      } else {
        await auth.signOut();
        setError('Unauthorized access.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = () => {
     if (otp === '1008') { // Fake OTP for demo as requested
        navigate('/admin-portal');
     } else {
        setError('Invalid OTP');
     }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full border-b-8 border-maroon"
      >
        <div className="text-center mb-10">
           <div className="w-24 h-24 bg-maroon rounded-full border-2 border-gold flex items-center justify-center mx-auto mb-6 shadow-lg">
             <Hand size={48} className="text-gold" />
           </div>
           <h1 className="text-3xl font-display text-maroon">Admin Portal</h1>
           <p className="text-gray-500">Secure access for authorized personnel only</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Username/Email</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-maroon outline-none bg-gray-50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-maroon outline-none bg-gray-50"
                required
              />
            </div>
            <button 
              disabled={loading}
              className="w-full bg-maroon text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><Key size={20} /> Login</>}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
             <div className="bg-amber-50 p-4 rounded-xl border border-gold-light text-center text-maroon font-bold">
               OTP sent to registered mobile number
             </div>
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Verification Code</label>
                <input 
                  type="text" 
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  className="w-full border-2 border-gray-100 rounded-xl p-4 text-center text-3xl font-bold tracking-[0.5em] focus:border-maroon outline-none bg-gray-50"
                  placeholder="0000"
                  maxLength={4}
                />
             </div>
             <button 
               onClick={handleVerifyOtp}
               className="w-full bg-maroon text-white font-bold py-4 rounded-xl"
             >
               Verify & Access
             </button>
          </div>
        )}

        {error && <p className="mt-4 text-red-500 text-sm text-center font-bold">{error}</p>}
      </motion.div>
    </div>
  );
}
