import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, doc, getDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import { Send, ArrowLeft, Loader2, Crown } from 'lucide-react';
import { motion } from 'motion/react';

export default function Chat() {
  const { partnerId } = useParams();
  const { user, profile: myProfile } = useAuth();
  const [partner, setPartner] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatId = [user?.uid, partnerId].sort().join('_');

  useEffect(() => {
    if (!partnerId || !user) return;

    getDoc(doc(db, 'users', partnerId)).then(snap => {
      if (snap.exists()) setPartner(snap.data() as UserProfile);
    });

    const messagesPath = `chats/${chatId}/messages`;
    const q = query(
      collection(db, messagesPath),
      orderBy('createdAt', 'asc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, messagesPath);
    });

    return () => unsub();
  }, [chatId, partnerId, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !myProfile?.isPremium) return;

    const msg = {
      senderId: user.uid,
      receiverId: partnerId,
      text: input,
      createdAt: new Date().toISOString()
    };

    setInput('');
    await addDoc(collection(db, `chats/${chatId}/messages`), msg);
  };

  if (!myProfile?.isPremium) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
         <Crown size={80} className="text-gold mx-auto mb-6" />
         <h2 className="text-3xl font-display text-maroon mb-4">Premium Required</h2>
         <p className="text-gray-600 mb-8">Chat functionality is exclusive for premium members. Upgrade now to connect!</p>
         <Link to="/membership" className="bg-gold text-maroon font-bold py-3 px-8 rounded-full shadow-lg">Upgrade to Premium</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-[calc(100vh-200px)] flex flex-col shadow-xl border-x border-gold-light">
      {/* Header */}
      <div className="bg-maroon p-4 text-white flex items-center gap-4 sticky top-[120px] z-10">
        <Link to="/profiles"><ArrowLeft size={24} /></Link>
        <div className="w-10 h-10 rounded-full bg-gold-light border-2 border-gold overflow-hidden">
          <img src={partner?.profilePhotoUrl || ''} alt="" className="w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="font-bold">{partner?.fullName}</h3>
          <p className="text-xs text-gold-light tracking-widest uppercase">{partner?.subCaste}</p>
        </div>
      </div>

      {/* Messages List */}
      <div 
        ref={scrollRef}
        className="flex-grow p-6 overflow-y-auto bg-amber-50 space-y-4"
      >
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-maroon" /></div>
        ) : messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm ${
              msg.senderId === user?.uid 
                ? 'bg-maroon text-white rounded-tr-none' 
                : 'bg-white text-gray-800 rounded-tl-none border border-gold-light'
            }`}>
              <p>{msg.text}</p>
              <p className="text-[10px] mt-1 opacity-50 text-right">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-gold flex gap-3">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow border-2 border-gold-light rounded-xl px-4 py-3 focus:border-maroon outline-none"
        />
        <button 
          type="submit"
          className="bg-maroon text-white p-4 rounded-xl hover:bg-maroon-dark transition-all disabled:opacity-50"
          disabled={!input.trim()}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
