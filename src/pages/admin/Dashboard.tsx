import React, { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, addDoc, query, orderBy } from 'firebase/firestore';
import { UserProfile, PaymentRecord, Ad, SuccessStory } from '../../types';
import { useLanguage } from '../../LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { Users, CreditCard, Image as ImageIcon, MessageSquare, Settings, LogOut, Check, X, Trash2, Edit, Plus, Info, Star, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'members' | 'payments' | 'ads' | 'stories' | 'settings' | 'invitations' | 'affiliate' | 'packages' | 'notifications' | 'search'>('members');
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // ... same effect logic as before ...
    const unsubMembers = onSnapshot(collection(db, 'users'), (snap) => {
      setMembers(snap.docs.map(d => ({ ...d.data(), uid: d.id } as UserProfile)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'users'));

    const unsubPayments = onSnapshot(collection(db, 'payments'), (snap) => {
       setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() } as PaymentRecord)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'payments'));

    const unsubAds = onSnapshot(collection(db, 'ads'), (snap) => {
       setAds(snap.docs.map(d => ({ id: d.id, ...d.data() } as Ad)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'ads'));

    const unsubStories = onSnapshot(collection(db, 'successStories'), (snap) => {
       setStories(snap.docs.map(d => ({ id: d.id, ...d.data() } as SuccessStory)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'successStories'));

    return () => {
      unsubMembers();
      unsubPayments();
      unsubAds();
      unsubStories();
    };
  }, []);

  const handleApproveMember = async (userId: string) => {
    await updateDoc(doc(db, 'users', userId), { status: 'approved', isVerified: true });
  };

  const handleApprovePayment = async (paymentId: string, userId: string) => {
    await updateDoc(doc(db, 'payments', paymentId), { status: 'approved' });
    await updateDoc(doc(db, 'users', userId), { isPremium: true });
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col p-4 md:sticky md:top-0 md:h-screen">
        <div className="mb-6 text-center border-b border-white/10 pb-6">
            <h1 className="text-2xl font-display text-gold">Vivah Setu</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Admin Control Center</p>
        </div>

        <nav className="flex-grow space-y-1 overflow-y-auto pr-2 custom-scrollbar">
          <TabButton active={activeTab === 'members'} onClick={() => setActiveTab('members')} icon={<Users size={18}/>} label={t('admin.customers')} />
          <TabButton active={activeTab === 'invitations'} onClick={() => setActiveTab('invitations')} icon={<MessageSquare size={18}/>} label={t('admin.invitations')} />
          <TabButton active={activeTab === 'affiliate'} onClick={() => setActiveTab('affiliate')} icon={<Users size={18}/>} label={t('admin.affiliate')} />
          <TabButton active={activeTab === 'stories'} onClick={() => setActiveTab('stories')} icon={<Star size={18}/>} label={t('admin.stories')} />
          <TabButton active={activeTab === 'packages'} onClick={() => setActiveTab('packages')} icon={<CreditCard size={18}/>} label={t('admin.packages')} />
          <TabButton active={activeTab === 'ads'} onClick={() => setActiveTab('ads')} icon={<ImageIcon size={18}/>} label={t('admin.promotions')} />
          <TabButton active={activeTab === 'search'} onClick={() => setActiveTab('search')} icon={<Search size={18}/>} label={t('admin.search')} />
          <TabButton active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} icon={<CreditCard size={18}/>} label={t('admin.payments')} />
          <TabButton active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} icon={<Info size={18}/>} label={t('admin.notifications')} />
          <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={18}/>} label="Settings" />
        </nav>

        <button 
          onClick={handleLogout}
          className="mt-6 flex items-center gap-3 text-red-400 font-bold hover:text-red-300 transition-colors p-3"
        >
          <LogOut size={18} /> {t('nav.logout')}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-10 overflow-y-auto">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h2 className="text-2xl font-display text-slate-800">{t(`admin.${activeTab === 'members' ? 'customers' : activeTab}`)}</h2>
            <div className="flex gap-4 w-full md:w-auto">
               <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Total</p>
                  <p className="text-xl font-bold text-slate-800">{members.length}</p>
               </div>
               <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Pending</p>
                  <p className="text-xl font-bold text-amber-600">{members.filter(m => m.status === 'pending').length}</p>
               </div>
            </div>
         </div>

         <AnimatePresence mode="wait">
           <motion.div 
             key={activeTab}
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
             className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
           >
              {activeTab === 'members' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase">
                      <tr>
                        <th className="p-4">Member</th>
                        <th className="p-4">Identity</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {members.map(m => (
                        <tr key={m.uid} className="hover:bg-gray-50">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                               <img src={m.profilePhotoUrl || 'https://via.placeholder.com/40'} className="w-8 h-8 rounded-full object-cover" />
                               <div>
                                  <p className="text-sm font-bold text-slate-800">{m.fullName}</p>
                                  <p className="text-[10px] text-gray-500">{m.phoneNumber}</p>
                               </div>
                            </div>
                          </td>
                          <td className="p-4 text-xs">
                             <p className="font-medium">{m.subCaste}</p>
                             <p className="text-gray-400">{m.gotra}</p>
                          </td>
                          <td className="p-4">
                             <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                               m.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                             }`}>
                               {m.status}
                             </span>
                          </td>
                          <td className="p-4 text-right">
                             {m.status === 'pending' && (
                               <button 
                                 onClick={() => handleApproveMember(m.uid)}
                                 className="text-green-600 p-2 hover:bg-green-50 rounded-lg"
                               >
                                 <Check size={18} />
                               </button>
                             )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Placeholder for other tabs */}
              {['invitations', 'affiliate', 'packages', 'notifications', 'search'].includes(activeTab) && (
                <div className="p-20 text-center text-gray-400">
                  <Settings size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Management feature for {activeTab} coming soon.</p>
                </div>
              )}
              
              {activeTab === 'payments' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    {/* ... Payments table as before ... */}
                    <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase">
                      <tr>
                        <th className="p-4">User</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {payments.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="p-4 text-xs font-medium">{p.userId}</td>
                          <td className="p-4">
                            <span className={`text-[10px] font-bold ${p.status === 'approved' ? 'text-green-600' : 'text-amber-600'}`}>{p.status}</span>
                          </td>
                          <td className="p-4 text-right">
                            {p.status === 'pending' && (
                              <button 
                                 onClick={() => handleApprovePayment(p.id, p.userId)}
                                 className="text-white bg-green-500 px-4 py-1 rounded-full text-[10px] font-bold hover:bg-green-600 transition-colors"
                              >
                                Approve
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
           </motion.div>
         </AnimatePresence>
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 rounded-xl font-medium transition-all ${
        active ? 'bg-maroon text-gold' : 'text-gray-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      {icon} {label}
    </button>
  );
}

function StarIcon({ size }: { size: number }) {
  return <Star size={size} className="text-gold" />;
}
