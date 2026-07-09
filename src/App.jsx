import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'sonner';
import CheckoutEntrega from './components/CheckoutEntrega';
import heroImage from './assets/hero-mate.jpg';

// Componentes Públicos
import Navbar from './components/Navbar';
import ProductGrid from './components/ProductGrid';
import ProductDetail from './components/ProductDetail';
import CartPage from './components/CartPage';
import About from './components/About';
import Footer from './components/Footer';
import FloatingCart from './components/FloatingCart';

// Componentes Administrativos
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* RUTAS ADMINISTRATIVAS */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />

          {/* RUTAS PÚBLICAS */}
          <Route path="*" element={
            <div className="min-h-screen flex flex-col font-sans bg-[#2D3025] text-[#E6DCC8] selection:bg-[#E6DCC8] selection:text-[#2D3025]">
              <Toaster position="bottom-right" richColors />
              <Navbar />
              <FloatingCart />

              {/* Botón flotante actualizado */}
              <a href="https://wa.me/5491133962727" target="_blank" rel="noopener noreferrer"
                className="fixed bottom-24 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300">
                <MessageCircle size={24} />
              </a>

              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={
                    <div className="flex flex-col">
                      <section
                        className="relative min-h-[60vh] sm:min-h-[70vh] md:min-h-[85vh] flex items-center justify-center px-4 sm:px-6 text-center border-b border-[#E6DCC8]/5 bg-cover bg-top"
                        style={{ backgroundImage: `url(${heroImage})` }}
                      >
                        <div className="absolute inset-0 bg-[#2D3025]/70" />

                        <div className="relative z-10">
                          <h1 className="text-4xl sm:text-6xl md:text-8xl font-serif font-bold tracking-tighter mb-6 sm:mb-8 text-[#E6DCC8]">
                            RINCÓN<br className="sm:hidden" /> ARGENTINOO
                          </h1>
                          <div className="flex justify-center items-center gap-3 sm:gap-4">
                            <div className="h-px w-8 sm:w-12 bg-[#E6DCC8]/30"></div>
                            <p className="text-xs sm:text-sm md:text-base font-light tracking-[0.3em] sm:tracking-[0.4em] uppercase text-[#E6DCC8]/60">
                              Artesanías auténticas con alma
                            </p>
                            <div className="h-px w-8 sm:w-12 bg-[#E6DCC8]/30"></div>
                          </div>
                        </div>
                      </section>
                      <section className="max-w-7xl mx-auto py-12 sm:py-20 px-4 sm:px-6">
                        <h2 className="text-xl sm:text-2xl font-serif font-medium mb-8 sm:mb-16 text-center tracking-widest uppercase opacity-80">Nuestra Selección</h2>
                        <ProductGrid />
                      </section>
                    </div>
                  } />
                  <Route path="/cart" element={<div className="p-8 max-w-4xl mx-auto min-h-[60vh] mt-10"><CartPage /></div>} />
                  <Route path="/producto/:id" element={<div className="p-8 max-w-6xl mx-auto min-h-[60vh] mt-10"><ProductDetail /></div>} />
                  <Route path="/about" element={<div className="p-8 max-w-4xl mx-auto min-h-[60vh] mt-10"><About /></div>} />
                  <Route path="/checkout/entrega" element={<CheckoutEntrega />} />
                </Routes>
              </main>
              <Footer />
            </div>
          } />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;