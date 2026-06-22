import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import Navbar from './components/Navbar';
import ProductGrid from './components/ProductGrid';
import ProductDetail from './components/ProductDetail';
import CartPage from './components/CartPage';
import About from './components/About';
import Footer from './components/Footer'; 
import FloatingCart from './components/FloatingCart'; 
import { CartProvider } from './context/CartContext';
import { Toaster } from 'sonner';
// Importamos el panel
import AdminDashboard from './pages/AdminDashboard'; 

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen flex flex-col font-sans bg-[#2D3025] text-[#E6DCC8] selection:bg-[#E6DCC8] selection:text-[#2D3025]">
          <Toaster position="bottom-right" richColors />
          
          <Navbar />
          <FloatingCart />
          
          <a 
            href="https://wa.me/541134703230" 
            target="_blank" 
            rel="noopener noreferrer"
            className="fixed bottom-24 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300"
          >
            <MessageCircle size={24} />
          </a>
          
          <main className="flex-grow">
            <Routes>
              {/* Ruta principal */}
              <Route path="/" element={
                <div className="flex flex-col">
                  <section className="py-24 md:py-40 px-6 text-center border-b border-[#E6DCC8]/5">
                    <h1 className="text-5xl md:text-8xl font-serif font-bold tracking-tighter mb-8 text-[#E6DCC8]">
                      RINCÓN ARGENTINO
                    </h1>
                    <div className="flex justify-center items-center gap-4">
                      <div className="h-px w-12 bg-[#E6DCC8]/30"></div>
                      <p className="text-sm md:text-base font-light tracking-[0.4em] uppercase text-[#E6DCC8]/60">
                        Artesanías auténticas con alma
                      </p>
                      <div className="h-px w-12 bg-[#E6DCC8]/30"></div>
                    </div>
                  </section>

                  <section className="max-w-7xl mx-auto py-20 px-6">
                    <h2 className="text-2xl font-serif font-medium mb-16 text-center tracking-widest uppercase opacity-80">
                      Nuestra Selección
                    </h2>
                    <ProductGrid />
                  </section>
                </div>
              } />

              <Route path="/cart" element={<div className="p-8 max-w-4xl mx-auto min-h-[60vh] mt-10"><CartPage /></div>} />
              <Route path="/producto/:id" element={<div className="p-8 max-w-6xl mx-auto min-h-[60vh] mt-10"><ProductDetail /></div>} />
              <Route path="/about" element={<div className="p-8 max-w-4xl mx-auto min-h-[60vh] mt-10"><About /></div>} />
              
              {/* NUEVA RUTA DEL PANEL */}
              <Route path="/admin" element={<AdminDashboard />} />
              
            </Routes>
          </main>
          
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;