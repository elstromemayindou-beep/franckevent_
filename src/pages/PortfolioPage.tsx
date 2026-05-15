import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Maximize2, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../lib/utils';
// Assure-toi que ces imports correspondent à ta configuration Firebase
import { db } from '../lib/firebase'; 
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

interface GalleryItem {
  id: string;
  type: 'photo' | 'tiktok' | 'video';
  url?: string;
  videoUrl?: string;
  title: string;
  category: string;
  year: number;
  size: 'small' | 'large' | 'tall' | 'wide';
}

// TES VIDÉOS LOCALES (Elles seront toujours affichées en premier)
const LOCAL_GALLERY: GalleryItem[] = [
  { 
    id: 'local-1', 
    type: 'video', 
    videoUrl: '/images/1.mp4', 
    title: "Aftermovie Gala 2024", 
    category: 'Vidéos', 
    year: 2024, 
    size: 'large' 
  },
  { 
    id: 'local-2', 
    type: 'video', 
    videoUrl: '/videos/mariage-brazza.mp4', 
    title: "Mariage Royal", 
    category: 'Mariage', 
    year: 2024, 
    size: 'wide' 
  },
  { 
    id: 'local-3', 
    type: 'photo', 
    url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2000', 
    title: 'Scénographie Exotique', 
    category: 'Décoration', 
    year: 2023, 
    size: 'tall' 
  }
];

export function PortfolioPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Tous');
  const [yearFilter, setYearFilter] = useState('Toutes');
  const [activeTab, setActiveTab] = useState<'gallery' | 'testimonials'>('gallery');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const categories = ['Tous', 'Vidéos', 'Mariage', 'Anniversaire', 'Professionnel', 'Décoration'];
  const years = ['Toutes', '2024', '2023', '2022'];

  useEffect(() => {
    // Connexion à Firestore pour récupérer les ajouts de la page Admin
    const q = query(collection(db, 'gallery'), orderBy('year', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firestoreItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GalleryItem[];

      // FUSION : On combine le local et le distant
      setItems([...LOCAL_GALLERY, ...firestoreItems]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredItems = items.filter(item => {
    const categoryMatch = filter === 'Tous' || item.category === filter;
    const yearMatch = yearFilter === 'Toutes' || item.year.toString() === yearFilter;
    return categoryMatch && yearMatch;
  });

  const sizeClasses = {
    small: "col-span-1 row-span-1",
    large: "col-span-2 row-span-2",
    tall: "col-span-1 row-span-2",
    wide: "col-span-2 row-span-1"
  };

  return (
    <div className="pt-32 pb-40 text-[var(--text-primary)]">
      <div className="max-w-7xl mx-auto px-6 relative">
        
        {/* Header Section */}
        <header className="mb-20 space-y-10 text-center relative py-24 overflow-hidden rounded-[80px] border border-[var(--border-color)]">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[var(--bg-primary)]" />
          </div>
          <div className="space-y-4 relative">
             <h1 className="text-6xl md:text-8xl font-serif">Galerie <span className="italic text-[#D4AF37]">Privée</span></h1>
             <p className="text-[10px] font-bold tracking-[0.5em] uppercase opacity-60">Archive d'Émotions</p>
          </div>
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 pt-4">
             <div className="flex space-x-2 bg-[var(--bg-secondary)]/50 backdrop-blur-xl p-1.5 rounded-full border border-[var(--border-color)]">
               <button onClick={() => setActiveTab('gallery')} className={cn("px-8 py-3 rounded-full text-xs font-bold uppercase transition-all", activeTab === 'gallery' ? "bg-[#D4AF37] text-white" : "text-[var(--text-primary)]")}>Galerie</button>
               <button onClick={() => setActiveTab('testimonials')} className={cn("px-8 py-3 rounded-full text-xs font-bold uppercase transition-all", activeTab === 'testimonials' ? "bg-[#D4AF37] text-white" : "text-[var(--text-primary)]")}>Témoignages</button>
             </div>
             <div className="flex gap-4">
                <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-5 py-2.5 text-[10px] font-bold uppercase outline-none">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-5 py-2.5 text-[10px] font-bold uppercase outline-none">
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
             </div>
          </div>
        </header>

        {/* Gallery Grid */}
        <AnimatePresence mode="wait">
          {activeTab === 'gallery' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[250px]"
            >
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  onClick={() => setSelectedItem(item)}
                  className={cn(
                    "relative overflow-hidden rounded-[40px] group cursor-pointer border border-[var(--border-color)] bg-black",
                    sizeClasses[item.size]
                  )}
                >
                  {item.type === 'video' ? (
                    <video 
                      src={item.videoUrl}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      muted
                      loop
                      autoPlay
                      playsInline
                    />
                  ) : (
                    <img 
                      src={item.url} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}
                  
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                    <span className="text-[#D4AF37] text-[9px] font-bold uppercase mb-2">{item.category}</span>
                    <h3 className="text-xl font-serif text-white mb-4">{item.title}</h3>
                    <div className="flex items-center gap-2 text-white/70 text-[10px] font-bold uppercase">
                      {item.type === 'video' ? <Play size={12} fill="white" /> : <Maximize2 size={12} />}
                      {item.type === 'video' ? "Voir en grand" : "Agrandir"}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Overlay */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/90"
              onClick={() => setSelectedItem(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-full max-w-5xl aspect-video rounded-[30px] overflow-hidden bg-black shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {selectedItem.type === 'video' ? (
                  <video 
                    key={selectedItem.videoUrl}
                    src={selectedItem.videoUrl} 
                    className="w-full h-full" 
                    controls 
                    autoPlay 
                  />
                ) : (
                  <img src={selectedItem.url} className="w-full h-full object-contain" alt={selectedItem.title} />
                )}
                
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-6 right-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white"
                >
                  ✕
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}