import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, User, ArrowRight, Plus, Loader2, Facebook, Twitter, Linkedin, Share2 } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { CreateBlogPost } from '../components/CreateBlogPost';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useLanguage } from '../context/LanguageContext';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  imageUrl: string;
  createdAt?: any;
}

export function BlogPage() {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const path = 'blog_posts';
    const q = query(
      collection(db, path),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BlogPost[];
      setPosts(fetchedPosts);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="absolute top-20 left-0 -z-10 select-none pointer-events-none opacity-[0.03] dark:opacity-[0.05] hidden lg:block overflow-hidden">
          <span className="text-[12vw] font-serif font-bold whitespace-nowrap uppercase tracking-tighter block -translate-x-20">Chroniques</span>
        </div>
        <header className="mb-20 flex flex-col md:flex-row justify-between items-end gap-8 relative py-20 px-12 overflow-hidden rounded-[60px] border border-[var(--border-color)]">
          {/* Background Image */}
          <div className="absolute inset-0 -z-10">
            <img 
              src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=2000" 
              alt="Blog Background" 
              className="w-full h-full object-cover opacity-70 scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
          </div>

          <div className="absolute top-1/2 left-0 -translate-y-1/2 -z-10 select-none pointer-events-none opacity-[0.03] dark:opacity-[0.05] md:hidden">
            <span className="text-[20vw] font-serif font-bold uppercase text-white">Blog</span>
          </div>
          <div className="space-y-6 relative z-10">
            <span className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase drop-shadow-md">Blog</span>
            <h1 className="text-5xl md:text-7xl font-serif text-white drop-shadow-2xl">{t('blog_title')}</h1>
            <p className="text-xl text-white/80 max-w-xl font-light drop-shadow-lg">
              {t('blog_desc')}
            </p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="group flex items-center space-x-3 px-8 py-4 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-bold tracking-widest uppercase hover:bg-[#D4AF37] hover:text-white transition-all duration-500 shadow-xl"
          >
            <Plus size={18} className="transition-transform group-hover:rotate-90" />
            <span>{t('blog_add')}</span>
          </button>
        </header>

        {isLoading ? (
          <div className="flex justify-center items-center py-40">
            <Loader2 className="animate-spin text-[#D4AF37]" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {posts.map((post, i) => (
              <motion.article 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="aspect-[16/10] overflow-hidden rounded-[40px] mb-8 relative border border-[var(--border-color)]">
                  <img 
                    src={post.imageUrl || undefined} 
                    alt={post.title} 
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute top-6 left-6 px-4 py-2 bg-[var(--bg-secondary)]/90 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-widest text-[var(--text-primary)]">
                    Inspiration
                  </div>
                </div>
                <div className="space-y-4 px-2">
                  <div className="flex items-center space-x-4 text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-[0.2em]">
                    <div className="flex items-center space-x-1">
                      <Calendar size={12} className="text-[#D4AF37]" /> 
                      <span>{post.createdAt ? format(post.createdAt.toDate(), 'dd MMM yyyy', { locale: fr }) : 'Récent'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User size={12} className="text-[#D4AF37]" /> 
                      <span>{post.author}</span>
                    </div>
                  </div>
                  <h2 className="text-2xl font-serif font-bold group-hover:text-[#D4AF37] transition-colors line-clamp-2 leading-tight text-[var(--text-primary)]">{post.title}</h2>
                  <p className="text-[var(--text-secondary)] font-light leading-relaxed line-clamp-3 text-sm">{post.content}</p>
                  <div className="pt-4 flex items-center justify-between">
                    <div className="flex items-center text-xs font-bold uppercase tracking-widest group-hover:text-[#D4AF37] transition-all transform group-hover:translate-x-2">
                      {t('blog_read_more')} <ArrowRight className="ml-2" size={14} />
                    </div>
                    
                    <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <button 
                        title="Partager sur Facebook"
                        className="p-2 hover:text-[#D4AF37] transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
                        }}
                      >
                        <Facebook size={16} />
                      </button>
                      <button 
                        title="Partager sur Twitter"
                        className="p-2 hover:text-[#D4AF37] transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`, '_blank');
                        }}
                      >
                        <Twitter size={16} />
                      </button>
                      <button 
                        title="Partager sur LinkedIn"
                        className="p-2 hover:text-[#D4AF37] transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank');
                        }}
                      >
                        <Linkedin size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {posts.length === 0 && !isLoading && (
          <div className="text-center py-40 bg-[var(--bg-secondary)] rounded-[40px] border border-[var(--border-color)]">
            <h3 className="text-2xl font-serif text-[var(--text-secondary)] italic">{t('blog_no_posts')}</h3>
            <button onClick={() => setIsModalOpen(true)} className="mt-6 text-[#D4AF37] font-bold uppercase tracking-widest underline decoration-2 underline-offset-8">{t('blog_start_writing')}</button>
          </div>
        )}
      </div>

      <CreateBlogPost 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {}} 
      />
    </div>
  );
}
