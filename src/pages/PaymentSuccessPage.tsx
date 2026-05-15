import { motion } from 'motion/react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="pt-32 pb-20 flex items-center justify-center min-h-[70vh]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-12 rounded-[60px] shadow-2xl border border-[#EEE] text-center space-y-8"
      >
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={48} />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-serif font-bold">Paiement Réussi !</h1>
          <p className="text-[#666] font-light">
            Votre réservation a été confirmée. Nous avons bien reçu votre paiement. 
            {sessionId === 'mock' && " (Ceci est une simulation de paiement)"}
          </p>
        </div>
        <div className="space-y-4 pt-6">
          <Link 
            to="/" 
            className="w-full block py-4 bg-[#1A1A1A] text-white rounded-full font-bold tracking-widest uppercase hover:bg-[#D4AF37] transition-all"
          >
            RETOURNER À L'ACCUEIL
          </Link>
          <div className="text-xs text-[#999] uppercase tracking-widest">
            Un email de confirmation vous a été envoyé.
          </div>
        </div>
      </motion.div>
    </div>
  );
}
