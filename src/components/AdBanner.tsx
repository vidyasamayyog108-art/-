import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import { Ad } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function AdBanner() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const adsPath = 'ads';
    const unsub = onSnapshot(collection(db, adsPath), (snap) => {
      const adsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad));
      setAds(adsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, adsPath);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (ads.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % ads.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [ads]);

  useEffect(() => {
    if (ads[currentIndex]) {
      const adId = ads[currentIndex].id;
      // Increment view count
      updateDoc(doc(db, 'ads', adId), {
        views: increment(1)
      }).catch(error => {
        console.error('Failed to increment view count:', error);
      });
    }
  }, [currentIndex, ads]);

  const handleClick = (ad: Ad) => {
    // Increment click count
    updateDoc(doc(db, 'ads', ad.id), {
      clicks: increment(1)
    }).catch(error => {
       console.error('Failed to increment click count:', error);
    });

    if (ad.targetUrl) {
      window.open(ad.targetUrl, '_blank');
    } else if (ad.targetPhone) {
      window.location.href = `tel:${ad.targetPhone}`;
    }
  };

  if (ads.length === 0) return null;

  return (
    <div className="w-full h-32 md:h-48 relative overflow-hidden bg-white shadow-md border-y-2 border-gold cursor-pointer">
      <AnimatePresence mode="wait">
        <motion.div
          key={ads[currentIndex].id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full"
          onClick={() => handleClick(ads[currentIndex])}
        >
          <img 
            src={ads[currentIndex].imageUrl} 
            alt="Advertisement" 
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
