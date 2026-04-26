import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { SuccessStory } from '../types';
import { motion } from 'motion/react';
import { Star, Heart } from 'lucide-react';

export default function SuccessStories() {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storiesPath = 'successStories';
    const q = query(collection(db, storiesPath), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setStories(snap.docs.map(d => ({ id: d.id, ...d.data() } as SuccessStory)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, storiesPath);
    });
    return () => unsub();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
         <Heart size={64} className="text-maroon mx-auto mb-4" />
         <h2 className="text-5xl font-display text-maroon mb-4">Happy Marriages</h2>
         <p className="text-gray-600 text-lg">Every success story is a blessing for us.</p>
      </div>

      {loading ? (
        <div className="text-center py-20">Loading stories...</div>
      ) : stories.length === 0 ? (
        <div className="text-center py-20 text-gray-400 italic">More success stories coming soon!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {stories.map((story) => (
            <motion.div 
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl overflow-hidden shadow-xl border-2 border-gold-light"
            >
              <div className="h-64 overflow-hidden">
                <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
              </div>
              <div className="p-8">
                <div className="flex text-gold mb-4">
                   {[1,2,3,4,5].map(i => <Star key={i} size={18} fill="currentColor" />)}
                </div>
                <h3 className="text-2xl font-display text-maroon mb-4">{story.title}</h3>
                <p className="text-gray-600 leading-relaxed italic">"{story.content}"</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
