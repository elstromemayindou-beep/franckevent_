import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, Star, Calendar, Music, Sparkles, MapPin, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getEmbedUrl, isDirectVideoUrl } from '../lib/utils';

export function Home() {
  const { t } = useLanguage();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'), limit(3));
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setTestimonials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else {
        setTestimonials([
          {
            text: "Une attention aux détails absolument incomparable. Franck a transformé notre mariage en un conte de fées moderne à Brazzaville.",
            author: "Mélanie K.",
            event: "Mariage Royal",
            rating: 5
          },
          {
            text: "Professionnalisme exemplaire pour notre gala d'entreprise. La scénographie a laissé tous nos invités sans voix.",
            author: "Directeur Marketing, SNPC",
            event: "Gala Annuel",
            rating: 5
          },
          {
            text: "Discrétion, luxe et efficacité. Ma soirée d'anniversaire privée a été gérée avec une main de maître du début à la fin.",
            author: "Jean-Pierre N.",
            event: "Anniversaire Privé",
            rating: 5
          }
        ]);
      }
    });
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero Section - Editorial Style */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=2000" 
            alt="Elite Event" 
            className="w-full h-full object-cover opacity-70 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
        </motion.div>

        <div className="relative z-10 text-center text-white px-6 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="space-y-12"
          >
            <div className="flex items-center justify-center space-x-6 mb-4">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: 48 }}
                transition={{ duration: 1.5, ease: "circOut" }}
                className="h-[1px] bg-[#D4AF37]" 
              />
              <span className="text-[#D4AF37] text-[10px] md:text-xs font-bold tracking-[0.5em] uppercase text-reveal">
                <span className="text-reveal-inner">Brazzaville • Pointe-Noire</span>
              </span>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: 48 }}
                transition={{ duration: 1.5, ease: "circOut" }}
                className="h-[1px] bg-[#D4AF37]" 
              />
            </div>

            <h1 className="text-6xl md:text-[10rem] font-serif font-light leading-[0.85] tracking-tight">
              <span className="text-reveal"><span className="text-reveal-inner">{t('hero_title_art')}</span></span> <br />
              <motion.span 
                initial={{ opacity: 0, x: -40, filter: 'blur(10px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.6, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="italic text-[#D4AF37] block"
              >
                {t('hero_title_exception')}
              </motion.span>
            </h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 1 }}
              className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto font-light leading-relaxed font-sans"
            >
              {t('hero_subtitle')}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col md:flex-row items-center justify-center gap-6 pt-10"
            >
              <Link 
                to="/services" 
                className="px-12 py-5 bg-[#D4AF37] text-white rounded-full font-bold tracking-widest uppercase hover:bg-white hover:text-[#1A1A1A] transition-all duration-500 shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-none"
              >
                {t('hero_cta_book')}
              </Link>
              <Link 
                to="/calendar" 
                className="px-12 py-5 border border-white/30 text-white rounded-full font-bold tracking-widest uppercase backdrop-blur-md hover:bg-white/10 transition-all duration-500"
              >
                {t('hero_cta_calendar')}
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 flex flex-col items-center space-y-4"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Découvrir</span>
          <div className="w-[1px] h-20 bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>
      </section>

      {/* Stats Section with Glassmorphism */}
      <section className="relative z-20 -mt-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 p-1 bg-white/5 backdrop-blur-2xl rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.2)] border border-white/10 overflow-hidden">
          {[
            { label: 'Événements', value: '150+', icon: Calendar },
            { label: 'Clients Unis', value: '5k+', icon: Star },
            { label: 'Partenaires', value: '25+', icon: Sparkles },
            { label: 'Villes', value: '05', icon: MapPin },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="text-center space-y-1 py-12 px-8 border-r border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors"
            >
              <div className="text-4xl md:text-5xl font-serif font-light text-white mb-2">{stat.value}</div>
              <div className="text-[9px] text-[#D4AF37] uppercase tracking-[0.4em] font-bold">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Curated Services Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto space-y-20">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="space-y-6">
            <span className="text-[#D4AF37] text-xs font-bold tracking-[0.5em] uppercase">{t('excellence_badge')}</span>
            <h2 className="text-5xl md:text-7xl font-serif leading-tight">
              {t('vision_title')} <br />
              <span className="italic">{t('vision_subtitle')}</span>
            </h2>
          </div>
          <p className="text-xl text-[var(--text-secondary)] max-w-md font-light leading-relaxed">
            {t('vision_desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { 
              title: "Scénographie", 
              desc: "Des designs botaniques et architecturaux pour une immersion totale.", 
              category: "Design",
              color: "bg-[#1A1A1A]"
            },
            { 
              title: "Gastronomie", 
              desc: "Une expérience culinaire raffinée orchestrée par les meilleurs chefs.", 
              category: "Premium",
              color: "bg-[#F5F2ED]"
            },
            { 
              title: "Entertainment", 
              desc: "Artistes internationaux et sonorisation de pointe pour vos soirées.", 
              category: "Ambiance",
              color: "bg-[#1A1A1A]"
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -15 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`group relative aspect-[3/4] rounded-[60px] shadow-2xl p-12 flex flex-col justify-end overflow-hidden border border-[var(--border-color)] ${item.color} ${item.color === 'bg-[#1A1A1A]' ? 'text-white' : 'text-[var(--text-primary)]'}`}
            >
              <div className="relative z-10 space-y-2 pointer-events-none">
                <span className={`${item.color === 'bg-[#1A1A1A]' ? 'text-[#D4AF37]' : 'text-[#D4AF37]'} text-[10px] font-bold tracking-[0.3em] uppercase`}>{item.category}</span>
                <h3 className="text-3xl font-serif font-bold">{item.title}</h3>
                <p className={`${item.color === 'bg-[#1A1A1A]' ? 'text-white/60' : 'text-[var(--text-secondary)]'} text-sm font-light mt-4 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-500`}>
                  {item.desc}
                </p>
              </div>
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
                <Sparkles size={120} strokeWidth={0.5} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="py-32 px-6 bg-[var(--bg-primary)]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -inset-10 bg-[#D4AF37]/5 rounded-[80px] blur-3xl" />
            <img 
              src="/images/franck.png" 
              alt="Franck Events Team" 
              className="relative rounded-[60px] shadow-2xl z-10"
            />
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#D4AF37] rounded-[40px] flex items-center justify-center p-8 z-20 shadow-xl hidden md:flex">
              <Sparkles className="text-white w-full h-full" strokeWidth={1} />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-10"
          >
            <div className="space-y-6">
              <span className="text-[#D4AF37] text-xs font-bold tracking-[0.5em] uppercase">À Propos</span>
              <h2 className="text-5xl md:text-7xl font-serif leading-tight">
                {t('about_title')} <br />
                <span className="italic text-[#D4AF37]">{t('about_subtitle')}</span>
              </h2>
            </div>
            
            <div className="space-y-6 text-lg text-[var(--text-secondary)] font-light leading-relaxed">
              <p>{t('about_p1')}</p>
              <p>{t('about_p2')}</p>
              <p>{t('about_p3')}</p>
            </div>

            <div className="pt-6">
              <div className="inline-block p-8 bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-color)] shadow-xl">
                <p className="text-xl md:text-2xl font-serif italic text-[var(--text-primary)]">
                  {t('about_slogan')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Quote / Section */}
      <section className="py-40 bg-[#1A1A1A] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
           <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#D4AF37] rounded-full blur-[200px] -translate-y-1/2 translate-x-1/2" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
           <div className="flex justify-center mb-12">
             <Star className="text-[#D4AF37]" size={40} strokeWidth={1} />
           </div>
           <blockquote className="text-4xl md:text-6xl font-serif text-white max-w-5xl mx-auto leading-tight italic">
             "Franck Events ne se contente pas d'organiser, nous orchestrons l'inoubliable dans chaque souffle de vent du fleuve Congo."
           </blockquote>
           <div className="mt-12 flex flex-col items-center">
              <div className="w-20 h-[1px] bg-[#D4AF37] mb-6" />
              <span className="text-[#D4AF37] text-xs font-bold tracking-[0.5em] uppercase">Franck, Fondateur</span>
           </div>
        </div>
      </section>

      {/* Testimonials Slider */}
      <section className="py-32 bg-[var(--bg-primary)] px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <span className="text-[#D4AF37] text-xs font-bold tracking-[0.5em] uppercase">Témoignages</span>
            <h2 className="text-5xl md:text-7xl font-serif font-light leading-none">Voices of <span className="italic">Excellence</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div 
                key={testimonial.id || i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                onClick={() => testimonial.videoUrl ? setSelectedVideo(testimonial.videoUrl) : null}
                className={`p-12 bg-[var(--bg-secondary)] rounded-[40px] border border-[var(--border-color)] relative group hover:shadow-2xl transition-all duration-500 ${testimonial.videoUrl ? 'cursor-pointer border-[#D4AF37]/30 hover:border-[#D4AF37]' : ''}`}
              >
                <div className="absolute top-0 right-0 p-8 flex flex-col items-end gap-2">
                   <Star className="text-[#D4AF37]/20 group-hover:text-[#D4AF37] transition-colors" size={40} strokeWidth={1} />
                   {testimonial.videoUrl && (
                      <div className="px-2 py-1 bg-red-50 text-red-500 text-[8px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1 animate-pulse">
                        <Play size={8} fill="currentColor" /> Vidéo
                      </div>
                   )}
                </div>
                <div className="flex space-x-1 mb-8">
                  {[...Array(testimonial.rating || 5)].map((_, i) => (
                    <Star key={i} size={14} className="text-[#D4AF37] fill-[#D4AF37]" />
                  ))}
                </div>
                <p className="text-xl font-serif italic text-[var(--text-primary)] leading-relaxed mb-8">
                  "{testimonial.text}"
                </p>
                {testimonial.videoUrl && (
                  <div className="mb-8 flex items-center gap-2 text-[#D4AF37] font-bold text-[9px] uppercase tracking-widest">
                    <Play size={12} fill="currentColor" /> Visionner le témoignage
                  </div>
                )}
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-primary)]">{testimonial.author}</div>
                  <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-[0.2em]">{testimonial.event}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Video Overlay Modal */}
          {selectedVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 backdrop-blur-2xl bg-black/90"
              onClick={() => setSelectedVideo(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                {selectedVideo ? (
                  isDirectVideoUrl(selectedVideo) ? (
                    <video 
                      src={selectedVideo} 
                      className="w-full h-full" 
                      controls 
                      autoPlay 
                      playsInline
                    />
                  ) : (
                    <iframe
                      src={getEmbedUrl(selectedVideo, true)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  )
                ) : null}
                <button 
                  onClick={() => setSelectedVideo(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <Sparkles size={20} className="rotate-45" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="bg-[#D4AF37] p-12 md:p-20 rounded-[60px] text-center space-y-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
             <Sparkles size={300} className="text-white" strokeWidth={0.5} />
          </div>
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl md:text-6xl font-serif text-white">Rejoignez le <br /><span className="italic">Cercle Privé</span></h2>
            <p className="text-white/80 max-w-md mx-auto font-light leading-relaxed">
              Inscrivez-vous pour recevoir en exclusivité nos carnets d'inspiration et invitations privées.
            </p>
          </div>

          <form className="relative max-w-md mx-auto flex flex-col md:flex-row gap-4 z-10">
            <input 
              type="email" 
              placeholder="Votre adresse email" 
              className="flex-1 px-8 py-5 rounded-full bg-white/20 border border-white/30 text-white placeholder:text-white/60 outline-none focus:bg-white/30 transition-all font-light"
            />
            <button className="px-10 py-5 bg-white text-[#D4AF37] rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all">
              S'inscrire
            </button>
          </form>
        </div>
      </section>

      {/* Luxury Call to Action */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="relative rounded-[80px] overflow-hidden bg-[var(--bg-secondary)] p-12 md:p-32 border border-[var(--border-color)] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-8 flex-1">
             <h2 className="text-5xl md:text-7xl font-serif">Commencez Votre <br /><span className="text-[#D4AF37] font-light">Histoire</span></h2>
             <p className="text-xl text-[var(--text-secondary)] font-light max-w-md">
               Rencontrez nos experts pour une consultation privée et laissez la magie opérer.
             </p>
             <Link 
               to="/contact" 
               className="inline-flex items-center space-x-4 text-xs font-bold tracking-[0.5em] uppercase group text-[var(--text-primary)]"
             >
               <span>Nous Contacter</span>
               <div className="w-12 h-12 rounded-full border border-[#D4AF37] flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-white transition-all duration-500">
                 <ArrowRight size={18} />
               </div>
             </Link>
          </div>
          <div className="flex-1 w-full flex justify-center md:justify-end">
            <div className="relative group">
              <div className="absolute -inset-4 bg-[#D4AF37]/10 rounded-[60px] blur-2xl group-hover:bg-[#D4AF37]/20 transition-all duration-700" />
              <img 
                src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=800" 
                alt="Experience" 
                className="relative rounded-[60px] w-full max-w-md aspect-[4/5] object-cover shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
