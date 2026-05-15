import { motion } from 'motion/react';
import { GoogleMap } from '../components/GoogleMap';
import { Instagram, Facebook, Send, Phone, Mail, MapPin, Music, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

const contactSchema = z.object({
  name: z.string().min(2, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  date: z.string().min(1, 'La date est requise'),
  service: z.string().min(1, 'Veuillez choisir un service'),
  budget: z.string().optional(),
  message: z.string().min(10, 'Le message doit être plus long'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactPage() {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      await addDoc(collection(db, 'messages'), {
        ...data,
        subject: `Demande de devis - ${data.service}`,
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'messages');
    }
  };

  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="absolute top-20 right-0 -z-10 select-none pointer-events-none opacity-[0.03] dark:opacity-[0.05] hidden lg:block overflow-hidden">
          <span className="text-[15vw] font-serif font-bold whitespace-nowrap uppercase tracking-tighter block translate-x-32">Location</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Info Side */}
          <div className="space-y-12 relative p-12 overflow-hidden rounded-[60px] border border-[var(--border-color)]">
            {/* Background Image */}
            <div className="absolute inset-0 -z-10 bg-black">
              <img 
                src="https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&q=80&w=1000" 
                alt="Contact Background" 
                className="w-full h-full object-cover opacity-70 scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-[var(--bg-primary)]" />
            </div>

            <div className="absolute top-0 left-0 -z-10 select-none pointer-events-none opacity-[0.03] dark:opacity-[0.05] md:hidden">
              <span className="text-[20vw] font-serif font-bold uppercase">Hello</span>
            </div>
            <header className="space-y-6">
              <span className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase">{t('nav_contact')}</span>
              <h1 className="text-5xl md:text-7xl font-serif text-[var(--text-primary)]">{t('contact_title')} <br /><span className="italic font-light">{t('contact_subtitle')}</span></h1>
              <p className="text-xl text-[var(--text-secondary)] font-light">
                {t('contact_desc')}
              </p>
            </header>

            <div className="space-y-8">
              {[
                { icon: Phone, title: 'Téléphone / WhatsApp', val: '+242 XX XXX XXXX' },
                { icon: Mail, title: 'Email', val: 'contact@franckevents.cg' },
                { icon: MapPin, title: 'Localisation', val: 'Brazzaville, Congo (Secteur Centre-Ville)' },
              ].map((item, i) => (
                <div key={i} className="flex items-start space-x-6">
                  <div className="p-4 bg-[var(--bg-secondary)] rounded-2xl shadow-sm border border-[var(--border-color)]"><item.icon className="text-[#D4AF37]" size={24} /></div>
                  <div>
                    <div className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">{item.title}</div>
                    <div className="text-xl font-serif font-bold text-[var(--text-primary)]">{item.val}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t border-[var(--border-color)] space-y-4">
               <div className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">Suivez-nous</div>
               <div className="flex space-x-4">
                 <Link to="#" className="p-4 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-2xl hover:bg-[#D4AF37] hover:text-white transition-all" title="Instagram"><Instagram size={20}/></Link>
                 <Link to="#" className="p-4 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-2xl hover:bg-[#D4AF37] hover:text-white transition-all" title="Facebook"><Facebook size={20}/></Link>
                 <Link to="#" className="p-4 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-2xl hover:bg-[#D4AF37] hover:text-white transition-all" title="TikTok"><Music size={20}/></Link>
                 <Link to="#" className="p-4 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-2xl hover:bg-[#D4AF37] hover:text-white transition-all" title="WhatsApp"><MessageCircle size={20}/></Link>
               </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="bg-[var(--bg-secondary)] p-12 md:p-16 rounded-[60px] shadow-2xl border border-[var(--border-color)]">
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-20"
              >
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Send size={40} />
                </div>
                <h3 className="text-3xl font-serif font-bold text-[var(--text-primary)]">Message Envoyé !</h3>
                <p className="text-[var(--text-secondary)]">Merci de votre confiance. Notre équipe vous recontactera sous 24h.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="px-10 py-4 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-bold tracking-widest uppercase hover:bg-[#D4AF37] hover:text-white transition-all"
                >
                  ENVOYER UN AUTRE MESSAGE
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#999]">Nom complet</label>
                    <input 
                      {...register('name')}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-4 rounded-2xl focus:ring-2 focus:ring-[#D4AF37] outline-none text-[var(--text-primary)] transition-all" 
                      placeholder="Franck M."
                    />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#999]">Email</label>
                    <input 
                      {...register('email')}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-4 rounded-2xl focus:ring-2 focus:ring-[#D4AF37] outline-none text-[var(--text-primary)] transition-all" 
                      placeholder="franck@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#999]">Date de l'événement</label>
                    <input 
                      {...register('date')}
                      type="date"
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-4 rounded-2xl focus:ring-2 focus:ring-[#D4AF37] outline-none text-[var(--text-primary)] transition-all" 
                    />
                    {errors.date && <p className="text-red-500 text-xs">{errors.date.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#999]">Service désiré</label>
                    <select 
                      {...register('service')}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-4 rounded-2xl focus:ring-2 focus:ring-[#D4AF37] outline-none text-[var(--text-primary)] transition-all"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="planning">Organisation Complète</option>
                      <option value="rental">Location Décoration</option>
                      <option value="animation">Sono & Animation</option>
                      <option value="other">Autre</option>
                    </select>
                    {errors.service && <p className="text-red-500 text-xs">{errors.service.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#999]">Votre message</label>
                  <textarea 
                    {...register('message')}
                    rows={4}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-6 rounded-2xl focus:ring-2 focus:ring-[#D4AF37] outline-none text-[var(--text-primary)] transition-all" 
                    placeholder="Dites-nous en plus sur vos envies..."
                  />
                  {errors.message && <p className="text-red-500 text-xs">{errors.message.message}</p>}
                </div>

                <button 
                  disabled={isSubmitting}
                  className="w-full py-5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-bold tracking-widest uppercase hover:bg-[#D4AF37] hover:text-white transition-all flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? 'Envoi en cours...' : 'ENVOYER LA DEMANDE'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Office Location */}
        <div className="mt-32">
          <GoogleMap 
            center={{ lat: -4.263889, lng: 15.193139 }}
            zoom={15}
            className="grayscale hover:grayscale-0 transition-all duration-700"
          />
        </div>
      </div>
    </div>
  );
}
