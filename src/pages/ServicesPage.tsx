import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Info, Sparkles, Diamond, Crown, ChevronRight, Music, Plus } from 'lucide-react';
import { BookingModal } from '../components/BookingModal';
import { useLanguage } from '../context/LanguageContext';

const packages = [
  {
    name: 'Essentiel',
    price: '350.000 FCFA',
    amount: 350000,
    desc: 'La signature Franck Events pour vos célébrations intimes.',
    features: ['Conseil initial stylistique', 'Organisation partielle', 'Décoration florale basique', 'Coordination jour J'],
    color: 'bg-[var(--bg-secondary)]',
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600'
  },
  {
    name: 'Prestige',
    price: '1.000.000 FCFA',
    amount: 1000000,
    desc: "L'excellence transcendée pour un événement mémorable et sans couture.",
    features: ['Organisation complète A-Z', 'Design scénographique sur mesure', 'Location mobilier premium', 'Animation sonorisation & Light', 'Gestion photographe', 'Conciergerie invités'],
    color: 'bg-[#1A1A1A]',
    dark: true,
    icon: Diamond,
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=600'
  },
  {
    name: 'Hautes Terres',
    price: 'Sur devis (> 3.000.000 FCFA)',
    amount: 3000000,
    desc: 'Le luxe absolu, une pièce d\'orfèvrerie événementielle unique au monde.',
    features: ['Service majordome privé', 'Production artistique exclusive', 'Décoration importée sur mesure', 'Logistique VIP & Sécurité', 'Suivi post-événement premium'],
    color: 'bg-[var(--bg-secondary)]',
    icon: Crown,
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=600'
  }
];

const FAQItem = ({ q, a, i }: { q: string, a: string, i: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.1 }}
      className="border-b border-[var(--border-color)] overflow-hidden"
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-8 flex justify-between items-center text-left group"
      >
        <span className="text-xl md:text-2xl font-serif text-[var(--text-primary)] group-hover:text-[#D4AF37] transition-colors">{q}</span>
        <div className={`w-8 h-8 rounded-full border border-[var(--border-color)] flex items-center justify-center transition-all ${isOpen ? 'bg-[#D4AF37] border-[#D4AF37] rotate-45' : 'group-hover:border-[#D4AF37]'}`}>
           <Plus size={18} className={isOpen ? 'text-white' : 'text-[var(--text-secondary)] group-hover:text-[#D4AF37]'} />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-8 text-lg text-[var(--text-secondary)] font-light leading-relaxed max-w-3xl">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export function ServicesPage() {
  const { t } = useLanguage();
  const [selectedPackage, setSelectedPackage] = useState<typeof packages[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenBooking = (pkg: typeof packages[0]) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  return (
    <div className="pt-32 pb-40">
      <div className="max-w-7xl mx-auto px-6 relative">
        <header className="mb-32 space-y-8 text-center relative py-20 overflow-hidden rounded-[80px] border border-[var(--border-color)]">
          {/* Background Image Added based on user request */}
          <div className="absolute inset-0 -z-10">
            <img 
              src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=2000" 
              alt="Services Background" 
              className="w-full h-full object-cover opacity-70 scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[var(--bg-primary)]" />
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 select-none pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
            <span className="text-[15vw] font-serif font-bold whitespace-nowrap uppercase tracking-tighter text-white">Services</span>
          </div>
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-block px-6 py-2 bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-bold tracking-[0.5em] uppercase rounded-full backdrop-blur-md"
          >
            {t('nav_services')}
          </motion.span>
          <h1 className="text-6xl md:text-8xl font-serif leading-tight text-white drop-shadow-2xl">{t('services_title')} <br /><span className="italic">{t('services_subtitle')}</span></h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-lg">
            {t('services_desc')}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-12">
          {packages.map((pkg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, duration: 0.8 }}
              className={`relative overflow-hidden rounded-[80px] border border-[var(--border-color)] flex flex-col h-full min-h-[400px] ${pkg.color} ${pkg.dark ? 'text-white' : 'text-[var(--text-primary)]'} shadow-sm hover:shadow-[0_50px_100px_rgba(0,0,0,0.08)] transition-all duration-700 group`}
            >
              <div className="w-full p-12 md:p-20 flex flex-col justify-between space-y-10 relative z-10">
                <div className="space-y-10">
                  <div className="flex justify-between items-start">
                    <div className={`p-4 rounded-3xl ${pkg.dark ? 'bg-white/10' : 'bg-[#D4AF37]/10'}`}>
                        <pkg.icon className={pkg.dark ? 'text-white' : 'text-[#D4AF37]'} size={32} strokeWidth={1} />
                    </div>
                    {pkg.dark && <span className="bg-[#D4AF37] text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest">Le Plus Prisé</span>}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">{pkg.name}</h3>
                    <div className="text-3xl font-light text-[#D4AF37] font-serif uppercase tracking-widest">{pkg.price}</div>
                  </div>

                  <p className={`${pkg.dark ? 'text-white/60' : 'text-[var(--text-secondary)]'} font-light text-lg leading-relaxed italic`}>
                    "{pkg.desc}"
                  </p>

                  <div className={`h-[1px] w-full ${pkg.dark ? 'bg-white/10' : 'bg-[var(--border-color)]'}`} />

                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {pkg.features.map((f, j) => (
                      <li key={j} className="flex items-start space-x-4">
                        <div className={`mt-1 p-1 rounded-full ${pkg.dark ? 'bg-[#D4AF37]' : 'bg-[#D4AF37]/20 text-[#D4AF37]'}`}>
                          <Check size={12} strokeWidth={3} className={pkg.dark ? 'text-[#1A1A1A]' : ''} />
                        </div>
                        <span className="text-sm font-medium leading-tight">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={() => handleOpenBooking(pkg)}
                  className={`w-full md:w-fit px-12 py-6 rounded-full text-center text-xs font-bold tracking-[0.3em] uppercase transition-all duration-500 flex items-center justify-center space-x-3 ${
                    pkg.dark ? 'bg-white text-[#1A1A1A] hover:bg-[#D4AF37] hover:text-white' : 'bg-[var(--text-primary)] text-[var(--bg-primary)] hover:bg-[#D4AF37] hover:text-white'
                  }`}
                >
                  <span>{t('services_choose')}</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <section className="mt-40 max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <span className="text-[#D4AF37] text-xs font-bold tracking-[0.5em] uppercase">FAQ</span>
            <h2 className="text-4xl md:text-6xl font-serif">Questions <span className="italic">Fréquentes</span></h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: "Combien de temps à l'avance dois-je réserver ?",
                a: "Pour un mariage ou un événement d'envergure, nous recommandons une réservation 6 à 12 mois à l'avance. Pour des événements privés plus petits, 2 à 3 mois suffisent généralement."
              },
              {
                q: "Proposez-vous des services en dehors de Brazzaville ?",
                a: "Absolument. Nous intervenons régulièrement à Pointe-Noire et pouvons organiser des événements sur l'ensemble du territoire national ainsi qu'à l'international sur demande."
              },
              {
                q: "Puis-je personnaliser les forfaits proposés ?",
                a: "Nos forfaits sont des bases de travail. Chaque événement Franck Events est unique et nous adaptons systématiquement nos services à vos besoins spécifiques et à votre vision."
              },
              {
                q: "Comment se déroule le premier rendez-vous ?",
                a: "Le premier rendez-vous est une consultation de découverte offerte. Nous discutons de votre projet, de vos envies et de votre budget pour établir une première proposition créative."
              }
            ].map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} i={i} />
            ))}
          </div>
        </section>

        {/* Our Process Section */}
        <section className="mt-40 space-y-24">
          <div className="text-center space-y-4">
            <span className="text-[#D4AF37] text-xs font-bold tracking-[0.5em] uppercase">Méthodologie</span>
            <h2 className="text-5xl md:text-7xl font-serif">La Signature <span className="italic">Franck</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[var(--border-color)] hidden md:block -z-10" />
            
            {[
              { 
                step: "01", 
                title: "L'Immersion", 
                desc: "Rendez-vous confidentiel pour comprendre votre ADN et définir les contours de votre rêve.",
                icon: Info
              },
              { 
                step: "02", 
                title: "La Création", 
                desc: "Conception de planches de tendances, sélection des prestataires d'élite et budgétisation.",
                icon: Sparkles
              },
              { 
                step: "03", 
                title: "L'Orchestration", 
                desc: "Coordination millimétrée le jour J pour que vous puissiez simplement vivre l'instant présent.",
                icon: Crown
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="bg-[var(--bg-primary)] p-12 rounded-[50px] border border-[var(--border-color)] space-y-6 text-center hover:border-[#D4AF37] transition-colors group"
              >
                <div className="w-16 h-16 bg-[#D4AF37] text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-[#D4AF37]/20 group-hover:scale-110 transition-transform">
                   <item.icon size={28} strokeWidth={1} />
                </div>
                <div className="space-y-4">
                  <div className="text-[#D4AF37] text-xs font-bold tracking-[0.4em] uppercase">Étape {item.step}</div>
                  <h3 className="text-3xl font-serif font-bold">{item.title}</h3>
                  <p className="text-[var(--text-secondary)] font-light leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {selectedPackage && (
          <BookingModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            service={selectedPackage} 
          />
        )}

        {/* Custom Service Section */}
        <section className="mt-40 bg-[#1A1A1A] px-12 py-24 md:p-32 rounded-[80px] text-white flex flex-col md:flex-row items-center gap-20 overflow-hidden relative">
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D4AF37] rounded-full blur-[200px] opacity-10 -translate-y-1/2 translate-x-1/2" />
           
           <div className="flex-1 space-y-8 relative z-10">
              <span className="text-[#D4AF37] text-xs font-bold tracking-[0.5em] uppercase">Tailleur d'Événements</span>
              <h2 className="text-5xl md:text-7xl font-serif tracking-tight">Besoin de <span className="italic text-[#D4AF37]">Lumière ?</span></h2>
              <p className="text-xl text-white/50 font-light max-w-xl leading-relaxed">
                Vous avez des besoins spécifiques non listés ? Nos experts en logistique scénique peuvent concevoir un matériel exclusif pour votre événement.
              </p>
              <button className="px-12 py-5 bg-[#D4AF37] text-white rounded-full font-bold tracking-widest uppercase hover:scale-105 transition-all shadow-xl">
                 Demander un devis libre
              </button>
           </div>
           
           <div className="flex-1 w-full grid grid-cols-2 gap-4 relative z-10">
              <div className="space-y-4">
                 <div className="aspect-square bg-white/5 rounded-[40px] p-8 flex flex-col justify-end border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                    <Music className="text-[#D4AF37] mb-4" size={32} strokeWidth={1} />
                    <div className="text-sm font-bold uppercase tracking-widest">Sonorisation</div>
                 </div>
              </div>
              <div className="space-y-4 pt-12">
                 <div className="aspect-square bg-white/5 rounded-[40px] p-8 flex flex-col justify-end border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                    <Sparkles className="text-[#D4AF37] mb-4" size={32} strokeWidth={1} />
                    <div className="text-sm font-bold uppercase tracking-widest">Lumières</div>
                 </div>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}
