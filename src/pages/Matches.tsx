import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { calculateMoonLongitude, getNakshatraInfo, calculateGunaMilan, GUNA_WEIGHTS } from '../services/kundaliService';
import { Heart, Star, ShieldCheck, AlertTriangle, Zap, CheckCircle } from 'lucide-react';

export default function Matches() {
  const [searchParams] = useSearchParams();
  const partnerId = searchParams.get('partnerId');
  const { profile: myProfile } = useAuth();
  const [partner, setPartner] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (partnerId) {
      setLoading(true);
      const queryPath = 'users';
      getDoc(doc(db, queryPath, partnerId)).then(snap => {
        if (snap.exists()) {
          setPartner(snap.data() as UserProfile);
        }
        setLoading(false);
      }).catch(error => {
        handleFirestoreError(error, OperationType.GET, queryPath);
        setLoading(false);
      });
    }
  }, [partnerId]);

  const runMatch = () => {
    if (!myProfile || !partner) return;

    const long1 = calculateMoonLongitude(myProfile.birthDate, myProfile.birthTime, myProfile.birthPlace);
    const long2 = calculateMoonLongitude(partner.birthDate, partner.birthTime, partner.birthPlace);

    const nak1 = getNakshatraInfo(long1);
    const nak2 = getNakshatraInfo(long2);

    const guna = calculateGunaMilan(long1, long2);
    const total = guna.varna + guna.vashya + guna.tara + guna.yoni + guna.maitri + guna.gana + guna.bhakoot + guna.nadi;
    guna.total = total;

    setResult({ nak1, nak2, guna });
  };

  if (!partnerId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
         <Heart size={80} className="text-gold mx-auto mb-6 opacity-20" />
         <h2 className="text-3xl font-display text-maroon mb-4">Select a profile to start Kundali Milan</h2>
         <Link to="/profiles" className="bg-maroon text-white font-bold py-3 px-8 rounded-full shadow-lg">Browse Profiles</Link>
      </div>
    );
  }

  if (loading) return <div className="py-20 text-center">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
         <h2 className="text-4xl font-display text-maroon mb-2">कुंडली मिलन (Kundali Milan)</h2>
         <p className="text-gray-600">Checking compatibility between profiles based on Vedic Astrology</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
         {/* My Info */}
         <div className="bg-white p-6 rounded-3xl border-2 border-gold-light shadow-md flex items-center gap-6">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gold">
               <img src={myProfile?.profilePhotoUrl || ''} alt="Me" className="w-full h-full object-cover" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-maroon">{myProfile?.fullName}</h3>
               <p className="text-xs text-gray-500 uppercase tracking-widest">{myProfile?.subCaste}</p>
            </div>
         </div>

         {/* Partner Info */}
         <div className="bg-white p-6 rounded-3xl border-2 border-gold shadow-md flex items-center gap-6">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-maroon">
               <img src={partner?.profilePhotoUrl || ''} alt="Partner" className="w-full h-full object-cover" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-maroon">{partner?.fullName}</h3>
               <p className="text-xs text-gray-500 uppercase tracking-widest">{partner?.subCaste}</p>
            </div>
         </div>
      </div>

      {!result ? (
        <div className="text-center">
           <button 
             onClick={runMatch}
             className="bg-maroon text-white font-bold py-6 px-16 rounded-full text-2xl shadow-2xl hover:scale-105 transition-transform border-4 border-gold group"
           >
             <Heart className="inline-block mr-2 group-hover:scale-125 transition-transform" fill="currentColor" /> Check Match
           </button>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Main Score */}
          <div className="bg-white rounded-3xl p-10 border-4 border-gold shadow-2xl text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-maroon to-gold"></div>
             <div className="text-6xl font-display text-maroon mb-2">{result.guna.total} / 36</div>
             <div className={`text-2xl font-bold mb-6 ${result.guna.total >= 25 ? 'text-green-600' : result.guna.total >= 18 ? 'text-amber-600' : 'text-red-600'}`}>
                {result.guna.total >= 25 ? 'Uttam (Excellent)' : result.guna.total >= 18 ? 'Madhyam (Good)' : 'Ashubh (Incompatible)'}
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-amber-50 p-6 rounded-2xl border border-gold-light">
                <div className="px-4 py-2">
                   <p className="text-xs text-gray-500 uppercase">My Nakshatra</p>
                   <p className="text-xl font-bold text-maroon">{result.nak1.name} (Charan {result.nak1.charan})</p>
                </div>
                <div className="px-4 py-2 border-t md:border-t-0 md:border-l border-gold-light">
                   <p className="text-xs text-gray-500 uppercase">Partner's Nakshatra</p>
                   <p className="text-xl font-bold text-maroon">{result.nak2.name} (Charan {result.nak2.charan})</p>
                </div>
             </div>
          </div>

          {/* Guna Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {Object.entries(GUNA_WEIGHTS).map(([key, weight]) => (
                <div key={key} className="bg-white p-4 rounded-xl shadow-sm border border-gold-light text-center">
                   <p className="text-xs text-gray-400 uppercase mb-1">{key}</p>
                   <div className="text-lg font-bold text-maroon">
                      {result.guna[key]} / {weight}
                   </div>
                </div>
             ))}
          </div>
          
          <div className="flex justify-center gap-4">
             <Link to="/profiles" className="bg-gray-100 text-gray-600 font-bold py-3 px-8 rounded-full border border-gray-200">Back to Profiles</Link>
             <Link to={`/chats/${partnerId}`} className="bg-maroon text-white font-bold py-3 px-8 rounded-full shadow-lg">Start Chat</Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
