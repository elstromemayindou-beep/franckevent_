import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  parseISO
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Tag, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  type: 'Mariage' | 'Public' | 'Privé' | 'Pro';
  location: string;
}

export function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'calendar_events'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CalendarEvent));
      setEvents(prev => docs.length > 0 ? docs : prev);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'calendar_events');
    });
    
    // Mock data for demo if collection is empty
    if (events.length === 0) {
        setEvents([
            { id: '1', title: 'Mariage de Sarah & Armel', date: '2024-03-25', description: 'Une cérémonie royale au bord du fleuve.', type: 'Mariage', location: 'Corniche de Brazzaville' },
            { id: '2', title: 'Soirée Networking Entrepreneurs', date: '2024-04-12', description: 'Rencontre annuelle des entrepreneurs francophones.', type: 'Pro', location: 'Hotel Ledger Plaza' },
            { id: '3', title: 'Anniversaire 50 ans VIP', date: '2024-05-02', description: 'Une fête grandiose avec 200 invités.', type: 'Privé', location: 'Résidence Privée' },
        ]);
    }

    return () => unsubscribe();
  }, []);

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-4 py-8">
        <div className="space-y-1">
          <span className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase">Évènements</span>
          <h2 className="text-4xl font-serif font-bold text-[#1A1A1A]">
            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
          </h2>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-3 hover:bg-white rounded-full border border-[#EEE] transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-3 hover:bg-white rounded-full border border-[#EEE] transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    return (
      <div className="grid grid-cols-7 mb-4">
        {days.map((day, i) => (
          <div key={i} className="text-center text-[10px] uppercase font-bold tracking-[0.2em] text-[#999]">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarRows = [];
    let days = [];
    let day = startDate;

    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7 border-t border-l border-[#EEE]">
        {allDays.map((day, i) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayEvents = events.filter(e => e.date === dateStr);
          const isSelected = isSameDay(day, selectedDate || new Date(-1));
          const isCurrentMonth = isSameMonth(day, monthStart);

          return (
            <div
              key={i}
              onClick={() => {
                setSelectedDate(day);
                if (dayEvents.length > 0) setSelectedEvent(dayEvents[0]);
                else setSelectedEvent(null);
              }}
              className={cn(
                "h-32 p-4 border-r border-b border-[#EEE] transition-all cursor-pointer relative group",
                !isCurrentMonth ? "bg-gray-50/50" : "bg-white",
                isSelected ? "ring-2 ring-inset ring-[#D4AF37]" : "hover:bg-[#F9F9F9]"
              )}
            >
              <span className={cn(
                "text-sm font-medium",
                !isCurrentMonth ? "text-gray-300" : "text-[#1A1A1A]",
                isSameDay(day, new Date()) && "bg-[#D4AF37] text-white w-6 h-6 rounded-full flex items-center justify-center"
              )}>
                {format(day, 'd')}
              </span>

              <div className="mt-2 space-y-1">
                {dayEvents.map((e, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={idx} 
                    className="text-[10px] px-2 py-1 rounded-md bg-[#1A1A1A] text-white truncate font-bold uppercase tracking-tight"
                  >
                    {e.title}
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 relative">
        <header className="mb-12 space-y-6 relative py-20 px-12 overflow-hidden rounded-[60px] border border-[var(--border-color)]">
          {/* Background Image */}
          <div className="absolute inset-0 -z-10 bg-black">
            <img 
              src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=2000" 
              alt="Calendar Background" 
              className="w-full h-full object-cover opacity-70 scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[var(--bg-primary)]" />
          </div>

          <div className="relative z-10">
            <span className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase">Calendrier interactif</span>
            <h1 className="text-5xl md:text-7xl font-serif text-white">Planifiez l'Inoubliable</h1>
            <p className="text-xl text-white/70 max-w-xl font-light">
              Découvrez nos disponibilités et les évènements Franck Events à venir.
            </p>
          </div>
        </header>

        <div className="bg-white rounded-[40px] shadow-2xl border border-[#EEE] overflow-hidden">
          {renderHeader()}
          <div className="px-8 pb-8">
            {renderDays()}
            {renderCells()}
          </div>
        </div>

        {/* Event Detail Sidebar/Modal */}
        <AnimatePresence>
          {selectedEvent && (
            <motion.div 
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="fixed right-6 bottom-6 w-full max-w-md bg-white rounded-[40px] shadow-2xl border border-[#EEE] p-10 z-50 overflow-hidden"
            >
              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-3 text-[#D4AF37]">
                  <CalendarIcon size={20} />
                  <span className="text-sm font-bold uppercase tracking-widest">
                    {format(parseISO(selectedEvent.date), 'EEEE d MMMM yyyy', { locale: fr })}
                  </span>
                </div>
                
                <h3 className="text-3xl font-serif font-bold">{selectedEvent.title}</h3>
                
                <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full w-fit">
                   <Tag size={14} className="text-[#D4AF37]" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">{selectedEvent.type}</span>
                </div>

                <p className="text-[#666] leading-relaxed italic">
                  "{selectedEvent.description}"
                </p>

                <div className="flex items-center space-x-3 pt-4 border-t border-[#EEE]">
                  <MapPin size={20} className="text-[#D4AF37]" />
                  <span className="text-sm font-medium">{selectedEvent.location}</span>
                </div>

                <Link 
                  to="/contact" 
                  className="block w-full py-4 bg-[#1A1A1A] text-white rounded-full text-center text-xs font-bold tracking-widest uppercase hover:bg-[#D4AF37] transition-all pt-1"
                >
                  RÉSERVER UN ÉVÈNEMENT SIMILAIRE
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 bg-[#1A1A1A] p-12 md:p-20 rounded-[60px] text-white">
           <div className="space-y-6">
             <h2 className="text-4xl font-serif">Vous avez une date en tête ?</h2>
             <p className="text-white/60 font-light text-lg">
               Notre calendrier se remplit vite, surtout pour la saison des mariages à Brazzaville. 
               Vérifiez nos disponibilités et bloquez votre date dès aujourd'hui.
             </p>
           </div>
           <div className="flex items-center justify-center md:justify-end">
             <Link 
               to="/contact" 
               className="px-12 py-5 bg-[#D4AF37] text-white rounded-full font-bold tracking-widest uppercase hover:bg-white hover:text-[#1A1A1A] transition-all"
             >
               Vérifier ma date
             </Link>
           </div>
        </div>
      </div>
    </div>
  );
}
