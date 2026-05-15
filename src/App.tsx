import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { ServicesPage } from './pages/ServicesPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { ContactPage } from './pages/ContactPage';
import { BlogPage } from './pages/BlogPage';
import { CalendarPage } from './pages/CalendarPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { AdminPage } from './pages/AdminPage';
import { ScrollToTop } from './components/ScrollToTop';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  if (isAdminPage) {
    return (
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/admin" element={<PageWrapper><AdminPage /></PageWrapper>} />
        </Routes>
      </AnimatePresence>
    );
  }

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
          <Route path="/services" element={<PageWrapper><ServicesPage /></PageWrapper>} />
          <Route path="/portfolio" element={<PageWrapper><PortfolioPage /></PageWrapper>} />
          <Route path="/calendar" element={<PageWrapper><CalendarPage /></PageWrapper>} />
          <Route path="/contact" element={<PageWrapper><ContactPage /></PageWrapper>} />
          <Route path="/blog" element={<PageWrapper><BlogPage /></PageWrapper>} />
          <Route path="/payment-success" element={<PageWrapper><PaymentSuccessPage /></PageWrapper>} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      exit={{ opacity: 0, filter: 'blur(10px)', y: -20 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
