import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar as CalendarIcon, User, Mail, MessageSquare, CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const bookingSchema = z.object({
  customerName: z.string().min(2, 'Le nom est requis'),
  customerEmail: z.string().email('Email invalide'),
  eventDate: z.string().min(1, 'La date est requise'),
  message: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: {
    name: string;
    price: string;
    amount: number;
  };
}

export function BookingModal({ isOpen, onClose, service }: BookingModalProps) {
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema)
  });

  const onSubmitDetails = async (data: BookingFormData) => {
    setIsProcessing(true);
    try {
      // 1. Save to Firestore
      const docRef = await addDoc(collection(db, 'bookings'), {
        ...data,
        serviceType: service.name,
        price: service.price,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setBookingId(docRef.id);
      setStep('payment');
    } catch (error) {
      console.error('Booking save error:', error);
      alert('Une erreur est survenue lors de l\'enregistrement.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          bookingId,
          amount: service.amount,
          serviceName: service.name
        }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Erreur lors de la redirection vers le paiement.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[50px] shadow-2xl overflow-hidden"
          >
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <X size={24} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-5 h-full min-h-[500px]">
              {/* Sidebar Info */}
              <div className="md:col-span-2 bg-[#1A1A1A] p-10 text-white space-y-8">
                <div className="space-y-2">
                  <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest">Réservation</span>
                  <h3 className="text-3xl font-serif font-bold">{service.name}</h3>
                </div>
                <div className="space-y-4">
                   <div className="flex items-center space-x-3">
                     <div className="p-2 bg-white/10 rounded-lg text-[#D4AF37]"><CreditCard size={18} /></div>
                     <div>
                        <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Prix</div>
                        <div className="text-lg font-bold">{service.price}</div>
                     </div>
                   </div>
                </div>
                <div className="pt-8 border-t border-white/10 text-sm text-white/60 font-light leading-relaxed">
                  Réserver un évènement avec Franck Events garantit une qualité de service exceptionnelle et un matériel de décoration haut de gamme.
                </div>
              </div>

              {/* Form Content */}
              <div className="md:col-span-3 p-10 md:p-14 overflow-y-auto max-h-[80vh]">
                {step === 'details' ? (
                  <form onSubmit={handleSubmit(onSubmitDetails)} className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-xl font-serif font-bold">Vos Informations</h4>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-[#999] ml-1">Nom complet</label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]" size={16} />
                            <input 
                              {...register('customerName')}
                              className="w-full bg-gray-50 border border-[#EEE] py-4 pl-12 pr-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#D4AF37] transition-all"
                              placeholder="Jean Dupont"
                            />
                          </div>
                          {errors.customerName && <p className="text-red-500 text-[10px] ml-1">{errors.customerName.message}</p>}
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-[#999] ml-1">Email</label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]" size={16} />
                            <input 
                              {...register('customerEmail')}
                              className="w-full bg-gray-50 border border-[#EEE] py-4 pl-12 pr-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#D4AF37] transition-all"
                              placeholder="jean@example.com"
                            />
                          </div>
                          {errors.customerEmail && <p className="text-red-500 text-[10px] ml-1">{errors.customerEmail.message}</p>}
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-[#999] ml-1">Date souhaitée</label>
                          <div className="relative">
                            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]" size={16} />
                            <input 
                              {...register('eventDate')}
                              type="date"
                              className="w-full bg-gray-50 border border-[#EEE] py-4 pl-12 pr-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#D4AF37] transition-all text-sm"
                            />
                          </div>
                          {errors.eventDate && <p className="text-red-500 text-[10px] ml-1">{errors.eventDate.message}</p>}
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-[#999] ml-1">Message (optionnel)</label>
                          <div className="relative">
                            <MessageSquare className="absolute left-4 top-4 text-[#999]" size={16} />
                            <textarea 
                              {...register('message')}
                              rows={3}
                              className="w-full bg-gray-50 border border-[#EEE] py-4 pl-12 pr-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#D4AF37] transition-all text-sm"
                              placeholder="Précisez vos besoins..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <button 
                      disabled={isProcessing}
                      className="w-full py-4 bg-[#1A1A1A] text-white rounded-full font-bold tracking-widest uppercase hover:bg-[#D4AF37] transition-all flex items-center justify-center space-x-2"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" size={18} /> : 'CONTINUER'}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-10 text-center py-6">
                    <div className="space-y-4">
                       <CheckCircle className="mx-auto text-green-500" size={60} strokeWidth={1} />
                       <h4 className="text-2xl font-serif font-bold">Détails Enregistrés</h4>
                       <p className="text-[#666] font-light italic">
                         Votre pré-réservation pour le service <b>{service.name}</b> est prête. 
                         Veuillez procéder au paiement de l'acompte pour confirmer.
                       </p>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-3xl border border-[#EEE] space-y-4 text-left">
                       <div className="flex justify-between text-sm">
                          <span className="text-[#999]">Service</span>
                          <span className="font-bold">{service.name}</span>
                       </div>
                       <div className="flex justify-between text-lg border-t border-gray-200 pt-4">
                          <span className="font-serif">Total</span>
                          <span className="font-bold text-[#D4AF37]">{service.price}</span>
                       </div>
                    </div>

                    <button 
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="w-full py-5 bg-[#D4AF37] text-white rounded-full font-bold tracking-widest uppercase hover:bg-[#1A1A1A] transition-all flex items-center justify-center space-x-3 shadow-lg"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <><CreditCard size={20} /> <span>PAYER MAINTENANT</span></>}
                    </button>
                    
                    <button 
                      onClick={() => setStep('details')}
                      className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999] hover:text-[#1A1A1A] transition-colors"
                    >
                      Modifier mes informations
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
