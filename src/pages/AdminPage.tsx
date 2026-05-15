import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Briefcase, 
  FileText, 
  Mail, 
  Calendar, 
  Settings,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  LogOut,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  TrendingUp,
  Users,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  Star,
  MapPin,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { cn } from '../lib/utils';

const ADMIN_EMAIL = 'elstromemayindou@gmail.com';
const ADMIN_EMAIL_2 = 'ngakossofrancksimeon@icloud.com';

function HelpTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block ml-2 group">
      <div 
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help text-[#A0A0A0] hover:text-[#D4AF37] transition-colors"
      >
        <AlertCircle size={14} />
      </div>
      <AnimatePresence>
        {show && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-black text-white text-[10px] rounded-xl shadow-2xl z-50 pointer-events-none text-center leading-relaxed"
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ImageUpload({ label, value, onUpload, help }: { label: string, value: string, onUpload: (url: string) => void, help?: string }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 1MB for Firestore storage as Base64)
    if (file.size > 1024 * 1024) {
      alert("L'image est trop lourde (max 1Mo). Veuillez la compresser ou utiliser un lien externe.");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      onUpload(base64String);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase font-bold tracking-widest text-[#A0A0A0] ml-4 flex items-center">
        {label}
        {help && <HelpTooltip text={help} />}
      </label>
      <div className="flex gap-4 items-center">
        <div className="relative group flex-1">
          <input 
            type="text" 
            placeholder="Lien URL ou importez une image..." 
            className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none border border-[#EEE] focus:border-[#D4AF37] transition-colors pr-12 text-sm"
            value={value}
            onChange={(e) => onUpload(e.target.value)}
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute right-2 top-2 bottom-2 px-4 bg-black text-white rounded-xl flex items-center justify-center hover:bg-[#D4AF37] transition-colors disabled:opacity-50"
            disabled={uploading}
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Upload size={18} />
            )}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />
        </div>
        <div className="w-14 h-14 bg-[#EEE] rounded-2xl overflow-hidden shadow-inner flex items-center justify-center shrink-0 border border-[#EEE]">
          {value ? (
            <img src={value} alt="Aperçu" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon size={20} className="text-[#A0A0A0]" />
          )}
        </div>
      </div>
      <p className="text-[9px] text-[#A0A0A0] italic ml-4">Importez de votre galerie ou collez un lien.</p>
    </div>
  );
}

type Tab = 'dashboard' | 'portfolio' | 'services' | 'blog' | 'content' | 'messages' | 'bookings' | 'calendar' | 'testimonials' | 'subscribers' | 'settings';

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        if ((u.email === ADMIN_EMAIL || u.email === ADMIN_EMAIL_2) && u.emailVerified) {
          setIsAdmin(true);
          setLoading(false);
        } else {
          // Check if user is in admins collection
          // We don't use onSnapshot here to avoid permission issues if they aren't admin yet
          // Actually, we can use onSnapshot if we handle the error
          const adminDoc = doc(db, 'admins', u.uid);
          const unsubAdmin = onSnapshot(adminDoc, (snapshot) => {
            if (snapshot.exists()) {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
            }
            setLoading(false);
          }, () => {
            setIsAdmin(false);
            setLoading(false);
          });
          return () => unsubAdmin();
        }
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const logout = () => signOut(auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8 max-w-md"
        >
          <div className="w-24 h-24 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <Settings size={48} className="text-[#D4AF37]" />
          </div>
          <h1 className="text-4xl font-serif">Administration</h1>
          <p className="text-[#666] font-light">
            Veuillez vous connecter avec le compte propriétaire pour accéder au panneau de gestion.
          </p>
          <button 
            onClick={login}
            className="w-full bg-[#D4AF37] text-white py-4 rounded-full font-bold tracking-widest uppercase hover:bg-black transition-colors shadow-xl"
          >
            Se connecter avec Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row">
      {/* Mobile Top Bar */}
      <div className="lg:hidden bg-white border-b border-[#EEE] p-4 flex justify-between items-center sticky top-0 z-[100]">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-serif italic text-lg">F</div>
          <span className="font-serif font-bold italic text-sm">Franck Events Admin</span>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="p-2 bg-[#F2F2F2] rounded-lg text-black"
          >
            {isMobileMenuOpen ? <X size={20} /> : <LayoutDashboard size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed inset-0 z-[90] bg-white pt-24 px-6 overflow-y-auto"
          >
            <nav className="space-y-4 pb-20">
              <div className="mb-6 px-4">
                <a 
                  href="/" 
                  className="flex items-center space-x-3 p-5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-3xl font-bold uppercase tracking-widest text-xs"
                >
                  <ArrowLeft size={18} />
                  <span>Quitter l'Admin</span>
                </a>
              </div>
              <MobileNavItem active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} icon={<LayoutDashboard size={24} />} label="Dashboard" />
              <MobileNavItem active={activeTab === 'portfolio'} onClick={() => { setActiveTab('portfolio'); setIsMobileMenuOpen(false); }} icon={<ImageIcon size={24} />} label="Portfolio" />
              <MobileNavItem active={activeTab === 'services'} onClick={() => { setActiveTab('services'); setIsMobileMenuOpen(false); }} icon={<Briefcase size={24} />} label="Services" />
              <MobileNavItem active={activeTab === 'blog'} onClick={() => { setActiveTab('blog'); setIsMobileMenuOpen(false); }} icon={<FileText size={24} />} label="Blog" />
              <MobileNavItem active={activeTab === 'calendar'} onClick={() => { setActiveTab('calendar'); setIsMobileMenuOpen(false); }} icon={<Calendar size={24} />} label="Calendrier" />
              <MobileNavItem active={activeTab === 'testimonials'} onClick={() => { setActiveTab('testimonials'); setIsMobileMenuOpen(false); }} icon={<Star size={24} />} label="Témoignages" />
              <MobileNavItem active={activeTab === 'subscribers'} onClick={() => { setActiveTab('subscribers'); setIsMobileMenuOpen(false); }} icon={<Users size={24} />} label="Abonnés" />
              <MobileNavItem active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }} icon={<Settings size={24} />} label="Réglages" />
              <MobileNavItem active={activeTab === 'content'} onClick={() => { setActiveTab('content'); setIsMobileMenuOpen(false); }} icon={<Settings size={24} />} label="Textes & Images" />
              <MobileNavItem active={activeTab === 'messages'} onClick={() => { setActiveTab('messages'); setIsMobileMenuOpen(false); }} icon={<Mail size={24} />} label="Messages" />
              <MobileNavItem active={activeTab === 'bookings'} onClick={() => { setActiveTab('bookings'); setIsMobileMenuOpen(false); }} icon={<Calendar size={24} />} label="Réservations" />
              
              <div className="pt-8 border-t border-[#EEE]">
                <button 
                  onClick={logout} 
                  className="w-full flex items-center justify-center space-x-3 py-5 bg-red-50 text-red-500 rounded-3xl font-bold uppercase tracking-widest text-xs"
                >
                  <LogOut size={18} />
                  <span>Se déconnecter</span>
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar (Desktop Only) */}
      <aside className="w-80 bg-white border-r border-[#EEE] hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-10 border-b border-[#EEE] space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white font-serif italic text-2xl">F</div>
            <div>
              <h2 className="font-serif font-bold italic leading-tight">Franck Events</h2>
              <p className="text-[10px] text-[#A0A0A0] uppercase tracking-widest font-bold">Admin Panel</p>
            </div>
          </div>
          <a 
            href="/" 
            className="flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] hover:text-black transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Retour au site public</span>
          </a>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem active={activeTab === 'portfolio'} onClick={() => setActiveTab('portfolio')} icon={<ImageIcon size={20} />} label="Portfolio" />
          <NavItem active={activeTab === 'services'} onClick={() => setActiveTab('services')} icon={<Briefcase size={20} />} label="Services" />
          <NavItem active={activeTab === 'blog'} onClick={() => setActiveTab('blog')} icon={<FileText size={20} />} label="Blog / Chroniques" />
          <NavItem active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={<Calendar size={20} />} label="Calendrier Événements" />
          <NavItem active={activeTab === 'testimonials'} onClick={() => setActiveTab('testimonials')} icon={<Star size={20} />} label="Témoignages Clients" />
          <NavItem active={activeTab === 'subscribers'} onClick={() => setActiveTab('subscribers')} icon={<Users size={20} />} label="Newsletter" />
          <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={20} />} label="Paramètres" />
          <NavItem active={activeTab === 'content'} onClick={() => setActiveTab('content')} icon={<Settings size={20} />} label="Contenu Site" />
          <NavItem active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} icon={<Mail size={20} />} label="Messages Clients" />
          <NavItem active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} icon={<Calendar size={20} />} label="Réservations" />
        </nav>

        <div className="p-6 border-t border-[#EEE]">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center space-x-3 py-4 text-red-500 hover:bg-red-50 rounded-2xl transition-colors font-bold uppercase tracking-widest text-xs"
          >
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6 py-12 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-end mb-12">
            <div>
              <p className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase mb-2">Bienvenue Franck</p>
              <h1 className="text-4xl font-serif capitalize">{activeTab}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs font-medium text-[#666] hidden sm:block">{user?.email}</span>
              <img src={user?.photoURL || undefined} alt="Admin" className="w-10 h-10 rounded-full border-2 border-white shadow-md" />
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'dashboard' && <DashboardTab />}
              {activeTab === 'portfolio' && <PortfolioTab />}
              {activeTab === 'services' && <ServicesTab />}
              {activeTab === 'blog' && <BlogTab />}
              {activeTab === 'content' && <ContentTab />}
              {activeTab === 'messages' && <MessagesTab />}
              {activeTab === 'bookings' && <BookingsTab />}
              {activeTab === 'calendar' && <CalendarTab />}
              {activeTab === 'testimonials' && <TestimonialsTab />}
              {activeTab === 'subscribers' && <SubscribersTab />}
              {activeTab === 'settings' && <SettingsTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 group",
        active 
          ? "bg-black text-white shadow-xl shadow-black/10" 
          : "text-[#666] hover:bg-[#F2F2F2]"
      )}
    >
      <span className={cn("transition-colors", active ? "text-[#D4AF37]" : "group-hover:text-black")}>
        {icon}
      </span>
      <span className="font-bold tracking-wide text-sm">{label}</span>
      {active && <motion.div layoutId="nav-pill" className="ml-auto w-1.5 h-1.5 bg-[#D4AF37] rounded-full" />}
    </button>
  );
}

function MobileNavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center space-x-4 p-5 rounded-3xl transition-all",
        active ? "bg-black text-[#D4AF37]" : "bg-[#F8F9FA] text-[#666]"
      )}
    >
      {icon}
      <span className="font-bold text-lg">{label}</span>
    </button>
  );
}

// Sub-components for each tab
function DashboardTab() {
  const [stats, setStats] = useState({
    projects: 0,
    bookings: 0,
    messages: 0,
    services: 0
  });

  useEffect(() => {
    const unsubGallery = onSnapshot(collection(db, 'gallery'), s => setStats(prev => ({ ...prev, projects: s.size })));
    const unsubBookings = onSnapshot(collection(db, 'bookings'), s => setStats(prev => ({ ...prev, bookings: s.size })));
    const unsubMessages = onSnapshot(collection(db, 'messages'), s => setStats(prev => ({ ...prev, messages: s.size })));
    const unsubServices = onSnapshot(collection(db, 'services'), s => setStats(prev => ({ ...prev, services: s.size })));
    
    return () => {
      unsubGallery();
      unsubBookings();
      unsubMessages();
      unsubServices();
    };
  }, []);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<ImageIcon />} label="Projets" value={stats.projects} color="bg-blue-600" trend="Galerie active" />
        <StatCard icon={<Calendar />} label="Réservations" value={stats.bookings} color="bg-emerald-600" trend="Total reçus" />
        <StatCard icon={<Mail />} label="Messages" value={stats.messages} color="bg-[#D4AF37]" trend="Depuis le site" />
        <StatCard icon={<Briefcase />} label="Services" value={stats.services} color="bg-indigo-600" trend="Offres actives" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[40px] shadow-sm border border-[#EEE]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-serif">Guide Rapide</h3>
            <CheckCircle className="text-emerald-500" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <AdminGuideItem 
              title="Gérer la Galerie" 
              desc="Ajoutez vos dernières photos de mariages ou événements Canal+ pour attirer de nouveaux clients." 
            />
            <AdminGuideItem 
              title="Modifier les Textes" 
              desc="Changez les slogans ou les descriptions de vos services sans toucher au code." 
            />
            <AdminGuideItem 
              title="Répondre aux Clients" 
              desc="Consultez les messages envoyés via le formulaire de contact." 
            />
            <AdminGuideItem 
              title="Calendrier" 
              desc="Mettez à jour vos événements publics (mariages à venir, cocktails, etc.)." 
            />
          </div>
        </div>

        <div className="bg-black text-white p-10 rounded-[40px] shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-serif text-[#D4AF37] mb-6">Conseil du jour</h3>
            <p className="text-lg font-light leading-relaxed opacity-80 mb-8 italic">
              "Une galerie photo mise à jour régulièrement augmente vos chances de réservation de 40%."
            </p>
            <div className="p-6 bg-white/10 rounded-3xl backdrop-blur-md">
              <p className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-2">Astuce Image</p>
              <p className="text-[11px] leading-relaxed opacity-70">
                Utilisez des images au format paysage pour les bannières et portrait pour les détails.
              </p>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#D4AF37] blur-[100px] opacity-20" />
        </div>
      </div>
    </div>
  );
}

function AdminGuideItem({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="p-6 bg-[#F8F9FA] rounded-3xl border border-[#EEE] hover:border-[#D4AF37] transition-colors">
      <h4 className="font-serif font-bold text-lg mb-2">{title}</h4>
      <p className="text-xs text-[#666] leading-relaxed">{desc}</p>
    </div>
  );
}

function StatCard({ icon, label, value, color, trend }: any) {
  return (
    <div className="bg-white p-8 rounded-[35px] border border-[#EEE] shadow-sm group hover:shadow-xl transition-all duration-500">
      <div className={cn("inline-flex p-4 rounded-2xl text-white mb-6", color)}>
        {icon}
      </div>
      <p className="text-[10px] text-[#A0A0A0] uppercase font-bold tracking-widest mb-1">{label}</p>
      <h4 className="text-3xl font-serif font-bold mb-2">{value}</h4>
      <p className="text-[10px] text-emerald-500 font-bold bg-emerald-50 inline-block px-2 py-0.5 rounded-full">{trend}</p>
    </div>
  );
}

function ActivityItem({ status, label, time }: any) {
  const Icon = status === 'booking' ? Calendar : status === 'message' ? Mail : ImageIcon;
  return (
    <div className="flex items-center space-x-4">
      <div className="w-10 h-10 bg-[#F8F9FA] rounded-full flex items-center justify-center text-[#666]">
        <Icon size={18} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-[10px] text-[#A0A0A0] uppercase tracking-widest font-bold">{time}</p>
      </div>
      <ChevronRight size={16} className="text-[#DDD]" />
    </div>
  );
}

// Management Components (simplified versions, can be expanded)
function PortfolioTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('year', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'gallery'));
    return () => unsubscribe();
  }, []);

  const deleteItem = async (id: string) => {
    if (!confirm('Supprimer cet élément ?')) return;
    try {
      await deleteDoc(doc(db, 'gallery', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `gallery/${id}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-serif">Gestion de la Galerie</h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-[#D4AF37] text-white rounded-full font-bold uppercase tracking-widest text-[10px] shadow-lg hover:bg-black transition-colors"
        >
          <Plus size={16} />
          <span>Ajouter</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div>Chargement...</div>
        ) : (
          items.map(item => (
            <div key={item.id} className="bg-white rounded-[40px] overflow-hidden border border-[#EEE] group shadow-sm flex flex-col">
              <div className="aspect-video relative overflow-hidden">
                <img src={item.url || undefined} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                {item.type === 'video' && (
                  <div className="absolute top-4 left-4 p-2 bg-red-500 text-white rounded-full shadow-lg">
                    <Play size={16} fill="currentColor" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                  <button onClick={() => setEditingItem(item)} className="p-4 bg-white text-black rounded-2xl hover:bg-[#D4AF37] hover:text-white transition-all shadow-xl">
                    <Edit size={20} />
                  </button>
                  <button onClick={() => deleteItem(item.id)} className="p-4 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all shadow-xl">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] text-[9px] font-bold uppercase tracking-widest rounded-full">{item.category}</span>
            <span className="text-[#A0A0A0] text-[9px] uppercase font-bold">{item.year}</span>
          </div>
          <h4 className="font-serif font-bold text-lg mb-1">{item.title}</h4>
          {item.location && (
            <p className="text-[10px] text-[#A0A0A0] uppercase tracking-widest font-bold flex items-center gap-1">
              <MapPin size={10} /> {item.location}
            </p>
          )}
        </div>
      </div>
            </div>
          ))
        )}
      </div>

      {(isAdding || editingItem) && (
        <GalleryModal 
          item={editingItem} 
          onClose={() => { setIsAdding(false); setEditingItem(null); }} 
        />
      )}
    </div>
  );
}

function GalleryModal({ item, onClose }: { item?: any, onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: item?.title || '',
    url: item?.url || '',
    videoUrl: item?.videoUrl || '',
    category: item?.category || 'Mariage',
    year: item?.year || new Date().getFullYear(),
    type: item?.type || 'photo',
    size: item?.size || 'small',
    clientName: item?.clientName || '',
    location: item?.location || '',
    date: item?.date || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (item) {
        await updateDoc(doc(db, 'gallery', item.id), {
          ...formData,
          year: Number(formData.year),
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'gallery'), {
          ...formData,
          year: Number(formData.year),
          createdAt: serverTimestamp()
        });
      }
      onClose();
    } catch (err) {
      handleFirestoreError(err, item ? OperationType.UPDATE : OperationType.CREATE, 'gallery');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-xl bg-black/40">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl p-10 overflow-y-auto max-h-[90vh]"
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <button onClick={onClose} className="p-2 hover:bg-[#F8F9FA] rounded-full transition-colors group">
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <h3 className="text-3xl font-serif">{item ? 'Modifier l\'œuvre' : 'Nouvelle œuvre'}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F8F9FA] rounded-full transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-[#A0A0A0] ml-4 flex items-center">
              Titre du projet
              <HelpTooltip text="Nom de l'événement ou du client (ex: Mariage Sarah & Paul)" />
            </label>
            <input required placeholder="Ex: Mariage Sarah & Paul" className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none border border-[#EEE] focus:border-[#D4AF37] transition-colors" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#A0A0A0] ml-4">Type de média</label>
              <select className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none border border-[#EEE]" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                <option value="photo">📷 Photo HD</option>
                <option value="video">🎥 Vidéo / Film</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#A0A0A0] ml-4">Année</label>
              <input type="number" className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none border border-[#EEE]" value={formData.year} onChange={e => setFormData({...formData, year: Number(e.target.value)})} />
            </div>
          </div>

          <ImageUpload 
            label="Image du projet" 
            value={formData.url} 
            onUpload={(url) => setFormData({...formData, url})} 
            help="Sélectionnez une photo de votre galerie ou collez l'URL d'une image déjà en ligne."
          />

          {formData.type === 'video' && (
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#A0A0A0] ml-4 flex items-center">
                Lien de la Vidéo (YouTube, Facebook, etc.)
                <HelpTooltip text="Collez le lien YouTube, Facebook ou l'adresse d'un fichier vidéo." />
              </label>
              <input 
                required 
                placeholder="YouTube, Facebook, Vimeo ou lien .mp4" 
                className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none border border-[#EEE] focus:border-[#D4AF37] transition-colors text-sm" 
                value={formData.videoUrl} 
                onChange={e => setFormData({...formData, videoUrl: e.target.value})} 
              />
              <p className="text-[9px] text-[#A0A0A0] italic ml-4">YouTube, Facebook, Vimeo et les fichiers directs (.mp4) sont supportés.</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#A0A0A0] ml-4">Client / Événement</label>
              <input placeholder="Ex: SNPC, Gala 2024" className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none border border-[#EEE]" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#A0A0A0] ml-4">Lieu</label>
              <input placeholder="Ex: Case de Gaulle" className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none border border-[#EEE]" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#A0A0A0] ml-4">Catégorie d'affichage</label>
              <select className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none border border-[#EEE]" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="Mariage">Mariage</option>
                <option value="Professionnel">Professionnel</option>
                <option value="Anniversaire">Anniversaire</option>
                <option value="Vidéos">Vidéos</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#A0A0A0] ml-4">Format Visuel</label>
              <select className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none border border-[#EEE]" value={formData.size} onChange={e => setFormData({...formData, size: e.target.value as any})}>
                <option value="small">Carré (Classique)</option>
                <option value="large">Grand Carré (Mise en avant)</option>
                <option value="wide">Rectangle (Paysage)</option>
                <option value="tall">Rectangle (Portrait)</option>
              </select>
            </div>
          </div>

          <button className="w-full py-5 bg-black text-white rounded-full font-bold uppercase tracking-widest mt-6 hover:bg-[#D4AF37] transition-all shadow-xl shadow-black/20">
            {item ? 'Confirmer les modifications' : 'Ajouter à la galerie'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// Content Management Simplified
function ContentTab() {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'site_content'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setContents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateContent = async (id: string, value: string) => {
    try {
      await updateDoc(doc(db, 'site_content', id), { value });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `site_content/${id}`);
    }
  };

  const deleteContent = async (id: string) => {
    if (confirm('Attention : supprimer ce texte pourrait affecter l\'affichage du site. Supprimer ?')) {
      try {
        await deleteDoc(doc(db, 'site_content', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `site_content/${id}`);
      }
    }
  };

  const seedContent = async () => {
    const defaultData = [
      { page: 'Accueil', section: 'Héro', key: 'Titre Principal', value: 'Franck Events Agency', type: 'text', help: 'Le grand titre qui apparaît sur la bannière de bienvenue.' },
      { page: 'Accueil', section: 'Héro', key: 'Sous-titre', value: 'Célèbrez l\'exceptionnel au bord du majestueux fleuve Congo', type: 'text', help: 'La petite phrase juste en dessous du titre principal.' },
      { page: 'Accueil', section: 'Services', key: 'Titre Section', value: 'L\'Art de Recevoir', type: 'text', help: 'Le titre de la section qui présente vos services.' },
      { page: 'Global', section: 'Infos', key: 'Téléphone', value: '+242 06 000 00 00', type: 'text', help: 'Apparaît dans le bas de page et la page contact.' },
      { page: 'Global', section: 'Infos', key: 'Adresse', value: 'Brazzaville, République du Congo', type: 'text', help: 'Votre adresse physique affichée sur le site.' },
      { page: 'Accueil', section: 'Héro', key: 'Image Fond', value: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=2000', type: 'image', help: 'L\'image de grande taille en arrière-plan du haut de page.' }
    ];
    
    for (const data of defaultData) {
      await addDoc(collection(db, 'site_content'), data);
    }
  };

  return (
    <div className="space-y-12">
      <header className="bg-white p-10 rounded-[40px] border border-[#EEE] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center space-x-3 mb-3">
              <Settings className="text-[#D4AF37]" size={28} />
              <h3 className="text-2xl font-serif">Personnalisation du Site</h3>
            </div>
            <p className="text-sm text-[#666] font-light leading-relaxed">
              Modifiez ici les textes et les images clés de votre site. 
              <span className="block mt-2 font-bold text-black">Note : Cliquez en dehors du champ ou appuyez sur Entrée pour enregistrer.</span>
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setIsAdding(true)}
              className="px-8 py-4 bg-[#D4AF37] text-white rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-xl"
            >
              Ajouter un élément
            </button>
            {contents.length === 0 && (
              <button 
                onClick={seedContent}
                className="px-8 py-4 bg-black text-white rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-[#D4AF37] transition-all shadow-xl"
              >
                Initialiser les Textes par défaut
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Image Upload Guide */}
      <div className="bg-[#D4AF37]/5 p-8 rounded-[40px] border border-[#D4AF37]/20 flex flex-col md:flex-row items-center gap-8">
        <div className="w-16 h-16 bg-[#D4AF37] rounded-3xl flex items-center justify-center text-white shrink-0">
          <ImageIcon size={32} />
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-serif font-bold text-black mb-2">Comment changer une image ?</h4>
          <p className="text-xs text-[#666] leading-relaxed">
            Vous pouvez désormais <strong>importer directement vos photos</strong> depuis votre appareil en cliquant sur l'icône de téléchargement dans les champs de saisie. Vous pouvez aussi continuer à utiliser des liens (URL) d'images.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {contents.map(item => (
          <div key={item.id} className="bg-white p-10 rounded-[40px] border border-[#EEE] shadow-sm flex flex-col lg:flex-row gap-10 group hover:border-[#D4AF37] transition-colors relative">
            <button 
              onClick={() => deleteContent(item.id)}
              className="absolute top-6 right-6 p-3 text-[#A0A0A0] hover:text-red-500 hover:bg-red-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all z-10"
              title="Supprimer cette clé de contenu"
            >
              <Trash2 size={18} />
            </button>
            <div className="lg:w-1/3">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-black text-white text-[9px] font-bold uppercase tracking-widest rounded-full">{item.page}</span>
                <span className="text-[10px] text-[#A0A0A0] font-bold uppercase tracking-widest">{item.section}</span>
              </div>
              <h4 className="text-xl font-serif mb-2 flex items-center">
                {item.key}
                <HelpTooltip text={item.help || "Modifie cet élément sur le site public."} />
              </h4>
              <p className="text-xs text-[#A0A0A0] italic">Type : {item.type === 'image' ? 'Image HD' : 'Texte libre'}</p>
            </div>
            
            <div className="flex-1">
              {item.type === 'image' ? (
                <ImageUpload 
                  label="Modifier l'image" 
                  value={item.value} 
                  onUpload={(url) => updateContent(item.id, url)} 
                />
              ) : (
                <textarea 
                  className="w-full p-6 bg-[#F8F9FA] rounded-[30px] border border-[#EEE] focus:ring-2 focus:ring-[#D4AF37] outline-none min-h-[120px] font-medium leading-relaxed"
                  defaultValue={item.value}
                  onBlur={(e) => updateContent(item.id, e.target.value)}
                  placeholder="Écrivez votre texte ici..."
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-xl bg-black/40">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-4">
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-[#F8F9FA] rounded-full transition-colors group">
                  <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <h3 className="text-3xl font-serif">Nouvel élément</h3>
              </div>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-[#F8F9FA] rounded-full transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={async (e: any) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              await addDoc(collection(db, 'site_content'), {
                page: formData.get('page'),
                section: formData.get('section'),
                key: formData.get('key'),
                type: formData.get('type'),
                value: '',
                help: formData.get('help')
              });
              setIsAdding(false);
            }} className="space-y-4">
              <input required name="page" placeholder="Page (ex: Accueil)" className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none" />
              <input required name="section" placeholder="Section (ex: Hero)" className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none" />
              <input required name="key" placeholder="Nom de la clé (ex: Titre)" className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none" />
              <select name="type" className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none">
                <option value="text">Texte</option>
                <option value="image">Image</option>
              </select>
              <input name="help" placeholder="Indication pour l'admin (Optionnel)" className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none" />
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 bg-[#F2F2F2] rounded-full font-bold uppercase tracking-widest text-[10px]">Annuler</button>
                <button type="submit" className="flex-1 py-4 bg-black text-white rounded-full font-bold uppercase tracking-widest text-[10px]">Créer</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}


function TestimonialsTab() {
  const [items, setItems] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, s => setItems(s.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const deleteItem = async (id: string) => {
    if (confirm('Supprimer ce témoignage ?')) await deleteDoc(doc(db, 'testimonials', id));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-serif">Avis Clients</h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-[#D4AF37] text-white rounded-full font-bold uppercase tracking-widest text-[10px] shadow-lg"
        >
          <Plus size={16} />
          <span>Ajouter un témoignage</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map(item => (
          <div key={item.id} className="bg-white p-8 rounded-[40px] border border-[#EEE] shadow-sm relative group">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center space-x-1 text-[#D4AF37]">
                {[...Array(item.rating || 5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              {item.videoUrl && (
                <div className="px-2 py-0.5 bg-red-50 text-red-500 text-[8px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1">
                  <Play size={8} fill="currentColor" /> Vidéo
                </div>
              )}
            </div>
            <p className="text-xl font-serif italic mb-6">"{item.text}"</p>
            <div className="flex justify-between items-end">
              <div>
                <p className="font-bold text-sm uppercase tracking-widest">{item.author}</p>
                <p className="text-[10px] text-[#A0A0A0] uppercase font-bold">{item.event}</p>
              </div>
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditingItem(item)} className="p-3 bg-[#F2F2F2] rounded-xl hover:bg-black hover:text-white transition-all"><Edit size={16} /></button>
                <button onClick={() => deleteItem(item.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(isAdding || editingItem) && (
        <TestimonialModal item={editingItem} onClose={() => { setIsAdding(false); setEditingItem(null); }} />
      )}
    </div>
  );
}

function TestimonialModal({ item, onClose }: any) {
  const [formData, setFormData] = useState({
    author: item?.author || '',
    text: item?.text || '',
    event: item?.event || '',
    videoUrl: item?.videoUrl || '',
    rating: item?.rating || 5
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (item) await updateDoc(doc(db, 'testimonials', item.id), formData);
      else await addDoc(collection(db, 'testimonials'), { ...formData, createdAt: serverTimestamp() });
      onClose();
    } catch (err) {
      handleFirestoreError(err, item ? OperationType.UPDATE : OperationType.CREATE, 'testimonials');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-xl bg-black/40">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <button onClick={onClose} className="p-2 hover:bg-[#F8F9FA] rounded-full transition-colors group">
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <h3 className="text-3xl font-serif">Témoignage</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F8F9FA] rounded-full transition-colors"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required placeholder="Nom du client" className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
          <input required placeholder="Événement (ex: Mariage Royal)" className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none" value={formData.event} onChange={e => setFormData({...formData, event: e.target.value})} />
          <textarea required placeholder="Le témoignage..." className="w-full p-6 bg-[#F8F9FA] rounded-2xl outline-none min-h-[120px]" value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})} />
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-[#A0A0A0] ml-4">Lien Vidéo (Optionnel - YouTube/Vimeo)</label>
            <input placeholder="https://www.youtube.com/watch?v=..." className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none" value={formData.videoUrl} onChange={e => setFormData({...formData, videoUrl: e.target.value})} />
          </div>
          <select className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none" value={formData.rating} onChange={e => setFormData({...formData, rating: Number(e.target.value)})}>
             {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Étoiles</option>)}
          </select>
          <button className="w-full py-5 bg-black text-white rounded-full font-bold uppercase tracking-widest mt-4">Enregistrer</button>
        </form>
      </motion.div>
    </div>
  );
}

function SettingsTab() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) setSettings(doc.data());
      setLoading(false);
    });
  }, []);

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'settings', 'global'), settings);
      alert('Paramètres enregistrés !');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'settings/global');
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-8">
      <div className="bg-white p-10 rounded-[40px] border border-[#EEE] shadow-sm">
        <h3 className="text-3xl font-serif mb-8">Paramètres Généraux</h3>
        <form onSubmit={saveSettings} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-[#D4AF37]">Réseaux Sociaux</h4>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-[#A0A0A0] ml-4">Instagram URL</label>
                <input className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none" value={settings.instagram || ''} onChange={e => setSettings({...settings, instagram: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-[#A0A0A0] ml-4">WhatsApp (Numéro complet)</label>
                <input className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none" value={settings.whatsapp || ''} onChange={e => setSettings({...settings, whatsapp: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-[#A0A0A0] ml-4">Lien Facebook</label>
                <input className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none" value={settings.facebook || ''} onChange={e => setSettings({...settings, facebook: e.target.value})} />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-[#D4AF37]">Contact & SEO</h4>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-[#A0A0A0] ml-4">Email de contact</label>
                <input className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none" value={settings.contactEmail || ''} onChange={e => setSettings({...settings, contactEmail: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-[#A0A0A0] ml-4">Adresse physique</label>
                <input className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none" value={settings.address || ''} onChange={e => setSettings({...settings, address: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-[#A0A0A0] ml-4">Titre SEO (Meta Title)</label>
                <input className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none" value={settings.metaTitle || ''} onChange={e => setSettings({...settings, metaTitle: e.target.value})} />
              </div>
            </div>
          </div>
          
          <button type="submit" className="w-full py-5 bg-black text-white rounded-full font-bold uppercase tracking-widest shadow-xl hover:bg-[#D4AF37] transition-all">
            Sauvegarder les réglages
          </button>
        </form>
      </div>

      <div className="bg-white p-10 rounded-[40px] border border-[#EEE] shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-3xl font-serif">Administrateurs</h3>
            <p className="text-xs text-[#A0A0A0] mt-1">Gérez les personnes ayant accès au panneau de contrôle.</p>
          </div>
          <Users className="text-[#D4AF37]" size={32} />
        </div>
        
        <AdminsList />
      </div>
    </div>
  );
}

function AdminsList() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [newAdmin, setNewAdmin] = useState({ email: '', uid: '' });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'admins'), orderBy('addedAt', 'desc'));
    return onSnapshot(q, s => setAdmins(s.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const addAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.uid || !newAdmin.email) return;
    try {
      await addDoc(collection(db, 'admins'), {
        ...newAdmin,
        addedAt: serverTimestamp()
      });
      // Also need to set the document ID to the UID for the firestore rules to work easy
      // Wait, the rules use exists(/admins/uid), so we should use setDoc with UID as ID
      const adminRef = doc(db, 'admins', newAdmin.uid);
      await updateDoc(adminRef, {
        email: newAdmin.email,
        addedAt: serverTimestamp()
      }).catch(async () => {
        // If it doesn't exist, set it
        await setDoc(adminRef, {
          email: newAdmin.email,
          addedAt: serverTimestamp()
        });
      });
      
      setNewAdmin({ email: '', uid: '' });
      setIsAdding(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'admins');
    }
  };

  const removeAdmin = async (id: string) => {
    if (confirm('Retirer cet administrateur ?')) {
      await deleteDoc(doc(db, 'admins', id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {admins.map(admin => (
          <div key={admin.id} className="p-6 bg-[#F8F9FA] rounded-3xl border border-[#EEE] flex justify-between items-center group">
            <div>
              <p className="font-bold text-sm">{admin.email}</p>
              <p className="text-[9px] text-[#A0A0A0] uppercase font-bold tracking-widest">ID: {admin.id}</p>
            </div>
            <button onClick={() => removeAdmin(admin.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {!isAdding ? (
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 text-[10px] uppercase font-bold tracking-[0.2em] text-[#D4AF37] hover:text-black transition-colors"
        >
          <Plus size={14} />
          <span>Ajouter un administrateur</span>
        </button>
      ) : (
        <form onSubmit={addAdmin} className="p-8 bg-[#F8F9FA] rounded-[30px] border border-dashed border-[#D4AF37]/30 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input required placeholder="Email de l'admin" className="h-12 px-5 bg-white rounded-xl outline-none text-sm border border-[#EEE]" value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} />
            <input required placeholder="UID Firebase de l'admin" className="h-12 px-5 bg-white rounded-xl outline-none text-sm border border-[#EEE]" value={newAdmin.uid} onChange={e => setNewAdmin({...newAdmin, uid: e.target.value})} />
          </div>
          <p className="text-[10px] text-[#A0A0A0] leading-relaxed italic">
            Note: Vous trouverez l'UID de l'utilisateur dans la console Firebase (Authentification). 
            L'utilisateur doit d'abord s'être connecté au moins une fois au site.
          </p>
          <div className="flex gap-3">
            <button type="submit" className="px-6 py-3 bg-black text-white rounded-xl font-bold uppercase tracking-widest text-[10px]">Ajouter</button>
            <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-3 bg-[#EEE] text-[#666] rounded-xl font-bold uppercase tracking-widest text-[10px]">Annuler</button>
          </div>
        </form>
      )}
    </div>
  );
}

function SubscribersTab() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    const q = query(collection(db, 'newsletter'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, s => setItems(s.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const deleteItem = async (id: string) => {
    if (confirm('Supprimer cet abonné ?')) await deleteDoc(doc(db, 'newsletter', id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-10 rounded-[40px] border border-[#EEE] flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-serif">Liste de Diffusion</h3>
          <p className="text-sm text-[#A0A0A0]">{items.length} abonnés actifs</p>
        </div>
        <Mail className="text-[#D4AF37]" size={32} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-3xl border border-[#EEE] flex justify-between items-center group">
            <div>
              <p className="font-bold text-sm">{item.email}</p>
              <p className="text-[10px] text-[#A0A0A0] font-bold uppercase tracking-widest">Inscrit le {item.createdAt?.toDate?.().toLocaleDateString()}</p>
            </div>
            <button onClick={() => deleteItem(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessagesTab() {
  const [messages, setMessages] = useState<any[]>([]);
  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, s => setMessages(s.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const deleteMessage = async (id: string) => {
    if (confirm('Supprimer ce message ?')) {
      await deleteDoc(doc(db, 'messages', id));
    }
  };

  return (
    <div className="space-y-6">
      {messages.map(msg => (
        <div key={msg.id} className="bg-white p-8 rounded-[40px] border border-[#EEE] shadow-sm hover:border-[#D4AF37] transition-colors relative group">
          <button 
            onClick={() => deleteMessage(msg.id)}
            className="absolute top-6 right-6 p-3 text-[#A0A0A0] hover:text-red-500 hover:bg-red-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all"
          >
            <Trash2 size={18} />
          </button>
          <div className="flex justify-between items-start mb-4 pr-12">
            <div>
              <h4 className="text-xl font-serif mb-1">{msg.name}</h4>
              <p className="text-sm font-bold text-[#D4AF37] tracking-widest uppercase">{msg.email}</p>
            </div>
            <span className="text-[10px] text-[#A0A0A0] font-bold">{msg.createdAt?.toDate?.().toLocaleString()}</span>
          </div>
          <div className="bg-[#F8F9FA] p-6 rounded-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-[#A0A0A0] mb-2">{msg.subject}</p>
            <p className="text-[#666] leading-relaxed">{msg.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ServicesTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'services'), orderBy('order', 'asc'));
    return onSnapshot(q, s => {
      setItems(s.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, err => handleFirestoreError(err, OperationType.LIST, 'services'));
  }, []);

  const deleteItem = async (id: string) => {
    if (!confirm('Supprimer ce service ?')) return;
    await deleteDoc(doc(db, 'services', id));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-serif">Gestion des Services</h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-[#D4AF37] text-white rounded-full font-bold uppercase tracking-widest text-[10px] shadow-lg"
        >
          <Plus size={16} />
          <span>Nouveau Service</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map(item => (
          <div key={item.id} className="bg-white p-8 rounded-[40px] border border-[#EEE] shadow-sm flex items-start space-x-6 relative group">
            <div className="w-16 h-16 bg-[#F8F9FA] rounded-2xl flex items-center justify-center text-[#D4AF37]">
              <Settings size={32} />
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-serif mb-1">{item.title}</h4>
              <p className="text-sm text-[#666] line-clamp-2">{item.description}</p>
              <p className="text-[#D4AF37] font-bold mt-2">{item.price}</p>
            </div>
            <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setEditingItem(item)} className="p-2 text-black hover:bg-[#F2F2F2] rounded-lg">
                <Edit size={18} />
              </button>
              <button onClick={() => deleteItem(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {(isAdding || editingItem) && (
        <ServiceModal 
          item={editingItem} 
          onClose={() => { setIsAdding(false); setEditingItem(null); }} 
        />
      )}
    </div>
  );
}

function ServiceModal({ item, onClose }: any) {
  const [formData, setFormData] = useState({
    title: item?.title || '',
    description: item?.description || '',
    price: item?.price || '',
    icon: item?.icon || 'Package',
    image: item?.image || '',
    features: item?.features?.join('\n') || '',
    order: item?.order || 0
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        features: formData.features.split('\n').filter((f: string) => f.trim())
      };
      
      if (item) {
        await updateDoc(doc(db, 'services', item.id), data);
      } else {
        await addDoc(collection(db, 'services'), data);
      }
      onClose();
    } catch (err) {
      handleFirestoreError(err, item ? OperationType.UPDATE : OperationType.CREATE, 'services');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-xl bg-black/40">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-xl rounded-[40px] p-10 overflow-y-auto max-h-[90vh] shadow-2xl"
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <button onClick={onClose} className="p-2 hover:bg-[#F8F9FA] rounded-full transition-colors group">
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <h3 className="text-3xl font-serif">Gestion de Service</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F8F9FA] rounded-full transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-[#A0A0A0] ml-4 flex items-center">
              Nom du Service
              <HelpTooltip text="Exemple : Organisation de Mariage VIP" />
            </label>
            <input required placeholder="Ex: Mariage VIP" className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none border border-[#EEE] focus:border-[#D4AF37]" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-[#A0A0A0] ml-4">Courte Description</label>
            <textarea required placeholder="Décrivez brièvement le service..." className="w-full p-6 bg-[#F8F9FA] rounded-2xl outline-none border border-[#EEE] focus:border-[#D4AF37] min-h-[100px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#A0A0A0] ml-4">Prix ou Mention</label>
              <input required placeholder="Ex: Sur devis" className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none border border-[#EEE]" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#A0A0A0] ml-4">Ordre d'affichage</label>
              <input type="number" className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none border border-[#EEE]" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} />
            </div>
          </div>

          <ImageUpload 
            label="Image de présentation" 
            value={formData.image} 
            onUpload={(url) => setFormData({...formData, image: url})} 
            help="Cette image illustrera le service dans la liste et sur la page détails."
          />

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-[#A0A0A0] ml-4">Inclus dans le service (un par ligne)</label>
            <textarea placeholder="Ex: Traiteur haut de gamme&#10;Photographe certifié" className="w-full p-6 bg-[#F8F9FA] rounded-2xl outline-none border border-[#EEE] min-h-[120px]" value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} />
          </div>

          <button className="w-full py-5 bg-black text-white rounded-full font-bold uppercase tracking-widest mt-4 hover:bg-[#D4AF37] transition-all">
            {item ? 'Enregistrer les modifications' : 'Créer le service'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function BlogTab() {
  const [items, setItems] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'blog_posts'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, s => setItems(s.docs.map(d => ({ id: d.id, ...d.data() }))), err => handleFirestoreError(err, OperationType.LIST, 'blog_posts'));
  }, []);

  const deleteItem = async (id: string) => {
    if (confirm('Supprimer cet article ?')) await deleteDoc(doc(db, 'blog_posts', id));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-serif">Chroniques & Actualités</h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-[#D4AF37] text-white rounded-full font-bold uppercase tracking-widest text-[10px] shadow-lg"
        >
          <Plus size={16} />
          <span>Nouvel Article</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-[30px] border border-[#EEE] flex flex-col sm:flex-row items-center justify-between group gap-4">
            <div className="flex items-center space-x-6 w-full">
              <img src={item.image || undefined} className="w-24 h-24 object-cover rounded-2xl border border-[#EEE]" />
              <div className="flex-1">
                <p className="text-[10px] text-[#A0A0A0] uppercase font-bold tracking-widest mb-1">{item.category} • {item.author}</p>
                <h4 className="text-xl font-serif leading-snug">{item.title}</h4>
                <p className="text-sm text-[#666] line-clamp-1 mt-1">{item.excerpt}</p>
              </div>
            </div>
            <div className="flex space-x-2 w-full sm:w-auto mt-4 sm:mt-0">
              <button 
                onClick={() => setEditingItem(item)}
                className="flex-1 sm:flex-none p-4 bg-[#F2F2F2] text-black sm:bg-black sm:text-white rounded-2xl hover:bg-[#D4AF37] hover:text-white transition-all"
              >
                <Edit size={20} />
              </button>
              <button 
                onClick={() => deleteItem(item.id)} 
                className="flex-1 sm:flex-none p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {(isAdding || editingItem) && (
        <BlogModal 
          item={editingItem} 
          onClose={() => { setIsAdding(false); setEditingItem(null); }} 
        />
      )}
    </div>
  );
}

function BlogModal({ item, onClose }: any) {
  const [formData, setFormData] = useState({
    title: item?.title || '',
    excerpt: item?.excerpt || '',
    content: item?.content || '',
    category: item?.category || 'Mariage',
    author: item?.author || 'Franck Events',
    image: item?.image || '',
    readTime: item?.readTime || '5 min'
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (item) {
        await updateDoc(doc(db, 'blog_posts', item.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'blog_posts'), {
          ...formData,
          createdAt: serverTimestamp(),
          date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
        });
      }
      onClose();
    } catch (err) {
      handleFirestoreError(err, item ? OperationType.UPDATE : OperationType.CREATE, 'blog_posts');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-xl bg-black/40 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-2xl rounded-[40px] p-10 my-10 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <button onClick={onClose} className="p-2 hover:bg-[#F2F2F2] rounded-full transition-colors group">
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <h3 className="text-3xl font-serif">{item ? 'Modifier l\'article' : 'Nouvel Article'}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F2F2F2] rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-[#A0A0A0] ml-4 flex items-center">
              Titre de l'Article
              <HelpTooltip text="Évitez les titres trop longs. Soyez accrocheur !" />
            </label>
            <input required placeholder="Titre de l'article" className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none focus:ring-2 focus:ring-[#D4AF37]" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-[#A0A0A0] ml-4">Résumé (Extrait)</label>
            <input required placeholder="Bref résumé (extrait)" className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none focus:ring-2 focus:ring-[#D4AF37]" value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-[#A0A0A0] ml-4">Contenu Complet</label>
            <textarea required placeholder="Contenu de l'article (Markdown supporté)" className="w-full p-6 bg-[#F8F9FA] rounded-2xl outline-none focus:ring-2 focus:ring-[#D4AF37] min-h-[250px]" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#A0A0A0] ml-4">Catégorie</label>
              <input required placeholder="Mariage, Lifestyle, etc." className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#A0A0A0] ml-4">Temps de lecture</label>
              <input required placeholder="Ex: 5 min" className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none" value={formData.readTime} onChange={e => setFormData({...formData, readTime: e.target.value})} />
            </div>
          </div>

          <ImageUpload 
            label="Image de couverture" 
            value={formData.image} 
            onUpload={(url) => setFormData({...formData, image: url})} 
            help="L'image principale de l'article."
          />

          <button className="w-full py-5 bg-black text-white rounded-full font-bold uppercase tracking-widest shadow-xl hover:bg-[#D4AF37] transition-all duration-500">
            {item ? 'Mettre à jour' : 'Publier l\'article'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function BookingsTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, s => {
      setItems(s.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, err => handleFirestoreError(err, OperationType.LIST, 'bookings'));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'bookings');
    }
  };

  const deleteBooking = async (id: string) => {
    if (confirm('Supprimer définitivement cette réservation ?')) {
      await deleteDoc(doc(db, 'bookings', id));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-8 rounded-[40px] border border-[#EEE] shadow-sm">
        <div>
          <h3 className="text-2xl font-serif">Réservations Clients</h3>
          <p className="text-sm text-[#A0A0A0]">{items.length} demandes au total</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 px-8 py-4 bg-black text-white rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-[#D4AF37] transition-all"
        >
          <Plus size={16} />
          <span>Nouvelle Saisie</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
      {items.map(item => (
        <div key={item.id} className="bg-white p-8 rounded-[40px] border border-[#EEE] shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className={cn(
                "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest",
                item.status === 'Confirmé' ? "bg-emerald-50 text-emerald-600" : 
                item.status === 'Annulé' ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-500"
              )}>
                {item.status || 'En attente'}
              </span>
              <span className="text-sm font-serif">{item.eventDate}</span>
            </div>
            <h4 className="text-xl font-bold">{item.customerName}</h4>
            <p className="text-[#666] text-sm">{item.customerEmail}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-[#A0A0A0] mb-1">Service</p>
            <p className="font-serif">{item.serviceType}</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => updateStatus(item.id, 'Confirmé')}
              className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-colors"
              title="Confirmer"
            >
              <CheckCircle size={18} />
            </button>
            <button 
              onClick={() => updateStatus(item.id, 'Annulé')}
              className="p-4 bg-orange-50 text-orange-500 rounded-2xl hover:bg-orange-100 transition-colors"
              title="Annuler"
            >
              <X size={18} />
            </button>
            <button 
              onClick={() => deleteBooking(item.id)}
              className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors"
              title="Supprimer"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
      </div>
      {isAdding && (
        <BookingModal onClose={() => setIsAdding(false)} />
      )}
    </div>
  );
}

function BookingModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    serviceType: 'Mariage',
    eventDate: '',
    message: '',
    status: 'En attente'
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'bookings'), {
        ...formData,
        createdAt: serverTimestamp()
      });
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'bookings');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-xl bg-black/40">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
             <button onClick={onClose} className="p-2 hover:bg-[#F8F9FA] rounded-full transition-colors group">
               <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
             </button>
             <h3 className="text-3xl font-serif">Saisie Manuelle</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F8F9FA] rounded-full transition-colors"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required placeholder="Nom du client" className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
          <input required type="email" placeholder="Email" className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none" value={formData.customerEmail} onChange={e => setFormData({...formData, customerEmail: e.target.value})} />
          <input placeholder="Téléphone" className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none" value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <select className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none" value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})}>
               <option value="Mariage">Mariage</option>
               <option value="Professionnel">Professionnel</option>
               <option value="Anniversaire">Anniversaire</option>
               <option value="Autre">Autre</option>
            </select>
            <input required type="date" className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none" value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})} />
          </div>
          <textarea placeholder="Commentaires / Besoins du client" className="w-full p-6 bg-[#F8F9FA] rounded-2xl outline-none min-h-[100px]" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
          <button className="w-full py-5 bg-black text-white rounded-full font-bold uppercase tracking-widest mt-4">Enregistrer la demande</button>
        </form>
      </motion.div>
    </div>
  );
}

function CalendarTab() {
  const [items, setItems] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'calendar_events'), orderBy('date', 'asc'));
    return onSnapshot(q, s => setItems(s.docs.map(d => ({ id: d.id, ...d.data() }))), err => handleFirestoreError(err, OperationType.LIST, 'calendar_events'));
  }, []);

  const deleteItem = async (id: string) => {
    if (confirm('Supprimer cet événement ?')) await deleteDoc(doc(db, 'calendar_events', id));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-serif">Événements Publics</h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-[#D4AF37] text-white rounded-full font-bold uppercase tracking-widest text-[10px] shadow-lg"
        >
          <Plus size={16} />
          <span>Nouvel Événement</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-[30px] border border-[#EEE] flex items-center justify-between group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#F8F9FA] rounded-2xl flex flex-col items-center justify-center text-[#D4AF37]">
                <Calendar size={20} />
              </div>
              <div>
                <h4 className="text-lg font-serif">{item.title}</h4>
                <p className="text-xs text-[#A0A0A0] font-bold uppercase tracking-widest">{item.date} • {item.location}</p>
              </div>
            </div>
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setEditingItem(item)} className="p-2 hover:bg-[#F2F2F2] rounded-lg"><Edit size={16} /></button>
              <button onClick={() => deleteItem(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {(isAdding || editingItem) && (
        <CalendarModal item={editingItem} onClose={() => { setIsAdding(false); setEditingItem(null); }} />
      )}
    </div>
  );
}

function CalendarModal({ item, onClose }: any) {
  const [formData, setFormData] = useState({
    title: item?.title || '',
    date: item?.date || '',
    description: item?.description || '',
    type: item?.type || 'Public',
    location: item?.location || '',
    time: item?.time || ''
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (item) {
        await updateDoc(doc(db, 'calendar_events', item.id), formData);
      } else {
        await addDoc(collection(db, 'calendar_events'), formData);
      }
      onClose();
    } catch (err) {
      handleFirestoreError(err, item ? OperationType.UPDATE : OperationType.CREATE, 'calendar_events');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-xl bg-black/40">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <button onClick={onClose} className="p-2 hover:bg-[#F8F9FA] rounded-full transition-colors group">
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <h3 className="text-3xl font-serif">{item ? 'Modifier l\'événement' : 'Nouvel Événement'}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F8F9FA] rounded-full transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-[#A0A0A0] ml-4">Titre de l'événement</label>
            <input required placeholder="Ex: Mariage VIP au Fleuve" className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none border border-[#EEE] focus:border-[#D4AF37]" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#A0A0A0] ml-4">Date</label>
              <input required type="date" className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none border border-[#EEE]" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#A0A0A0] ml-4">Lieu</label>
              <input required placeholder="Brazzaville..." className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none border border-[#EEE]" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#A0A0A0] ml-4">Heure</label>
              <input type="time" className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none border border-[#EEE]" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#A0A0A0] ml-4">Type d'accès</label>
              <select className="w-full h-14 px-6 bg-[#F8F9FA] rounded-2xl outline-none border border-[#EEE]" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="Public">🌍 Public</option>
                <option value="Privé">🔒 Privé</option>
                <option value="Sur invitation">✉️ Sur invitation</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-[#A0A0A0] ml-4">Description (Optionnel)</label>
            <textarea placeholder="Description" className="w-full p-6 bg-[#F8F9FA] rounded-2xl outline-none border border-[#EEE] min-h-[100px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          <button className="w-full py-5 bg-black text-white rounded-full font-bold uppercase tracking-widest hover:bg-[#D4AF37] transition-all mt-4">Enregistrer l'événement</button>
        </form>
      </motion.div>
    </div>
  );
}
