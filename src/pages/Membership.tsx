import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../LanguageContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Landmark, QrCode, Upload, CheckCircle, Download, Loader2 } from 'lucide-react';

export default function Membership() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file) return;

    setLoading(true);
    const paymentsPath = 'payments';
    try {
      // In real app, upload to storage. 
      // For now, we'll store a placeholder URL or base64.
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          await addDoc(collection(db, paymentsPath), {
            userId: user.uid,
            amount: 499,
            screenshotUrl: reader.result as string,
            status: 'pending',
            createdAt: new Date().toISOString()
          });
          setLoading(false);
          setSubmitted(true);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, paymentsPath);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const downloadQR = () => {
    // Mock download
    alert('QR Code downloaded successfully!');
  };

  if (profile?.isPremium) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <CheckCircle size={80} className="text-green-500 mx-auto mb-6" />
        <h2 className="text-4xl font-display text-maroon mb-4">You are a Premium Member!</h2>
        <p className="text-gray-600">Enjoy unlimited messages and full profile access.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-display text-maroon mb-4">{t('nav.membership')}</h2>
        <p className="text-gray-600">Join our premium community to connect with your life partner</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-gold p-8 md:p-12">
        {/* Payment Info */}
        <div className="space-y-6">
          <div className="bg-amber-50 p-6 rounded-2xl border border-gold-light">
            <h3 className="text-2xl font-bold text-maroon mb-4">Premium Plan</h3>
            <div className="text-4xl font-display text-maroon mb-2">{t('membership.price')}</div>
            <p className="text-sm text-gray-500 mb-6">One-time payment for lifetime access</p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle size={16} className="text-maroon" /> Unlimited Messages
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle size={16} className="text-maroon" /> Unlock All Profiles
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle size={16} className="text-maroon" /> Kundali Matching (Nakshatra)
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle size={16} className="text-maroon" /> 36 Guna Milan Results
              </li>
            </ul>
          </div>

          <div>
             <h4 className="font-bold text-maroon mb-2">Pay via UPI</h4>
             <div className="bg-gray-100 p-4 rounded-xl flex items-center justify-between border-2 border-dashed border-gold">
                <span className="font-mono text-lg font-bold">vivahsetu@ptaxis</span>
                <Landmark className="text-maroon" />
             </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="bg-white p-4 border-2 border-gold rounded-xl shadow-inner">
               {/* Mock QR Code */}
               <img 
                 src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=vivahsetu@ptaxis&pn=VivahSetu&am=499&cu=INR" 
                 alt="UPI QR Code" 
                 className="w-48 h-48"
               />
            </div>
            <button 
              onClick={downloadQR}
              className="flex items-center gap-2 text-maroon font-bold hover:underline"
            >
              <Download size={18} /> Download QR Code
            </button>
          </div>
        </div>

        {/* Upload Form */}
        <div className="flex flex-col h-full">
          {!submitted ? (
            <form onSubmit={handleUpload} className="flex flex-col flex-grow">
               <h3 className="text-2xl font-bold text-maroon mb-6">Upload Screenshot</h3>
               <p className="text-gray-500 text-sm mb-8">
                 After making the payment of ₹499, please upload the payment receipt/screenshot here. Admin will verify and activate your account.
               </p>

               <label className="flex-grow flex flex-col items-center justify-center border-4 border-dashed border-gold-light rounded-3xl p-8 hover:bg-amber-50 transition-colors cursor-pointer group">
                  {file ? (
                    <div className="flex flex-col items-center">
                       <CheckCircle size={48} className="text-green-500 mb-2" />
                       <span className="text-sm font-bold text-gray-700">{file.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-gold group-hover:text-maroon transition-colors">
                       <Upload size={48} className="mb-2" />
                       <span className="font-bold">Select Screenshot</span>
                       <span className="text-xs">Max 5MB (JPEG/PNG)</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    required
                  />
               </label>

               <button 
                 type="submit"
                 disabled={loading || !file}
                 className="w-full bg-maroon text-white py-4 rounded-2xl font-bold mt-8 flex items-center justify-center gap-2 hover:bg-maroon-dark transition-all disabled:opacity-50"
               >
                 {loading ? <Loader2 className="animate-spin" /> : 'Submit for Approval'}
               </button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
               <motion.div
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6"
               >
                 <CheckCircle size={40} />
               </motion.div>
               <h3 className="text-2xl font-bold text-maroon mb-2">Submitted Successfully!</h3>
               <p className="text-gray-600">Admin will verify your payment within 24 hours. You will receive access once approved.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
