import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import logo from '../assets/rincon.png';

export default function Navbar() {
  const { cart } = useCart();

  return (
    <nav className="sticky top-0 p-4 sm:p-6 flex justify-between items-center z-50 bg-[#2D3025]/90 backdrop-blur-md border-b border-[#E6DCC8]/10">
      <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
        <img
          src={logo}
          alt="Rincón Argentino Logo"
          className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border border-[#E6DCC8]/20 shadow-lg object-cover shrink-0"
        />
        <span className="font-serif font-bold text-[#E6DCC8] tracking-tight text-base sm:text-lg md:text-xl hidden md:block truncate">
          RINCÓN ARGENTINOO
        </span>
      </Link>

      <div className="flex gap-4 sm:gap-6 md:gap-8 items-center font-light text-[#E6DCC8] opacity-80 uppercase tracking-widest text-xs sm:text-sm">
        <Link to="/" className="hover:opacity-100 transition duration-300">Inicio</Link>
        <Link to="/about" className="hover:opacity-100 transition duration-300">Nosotros</Link>

        <Link to="/cart" className="relative group transition-all duration-300 hover:scale-110 active:scale-95 shrink-0">
          <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 hover:opacity-100" />
          {cart.length > 0 && (
            <span className="absolute -top-2.5 -right-2.5 sm:-top-3 sm:-right-3 bg-[#E6DCC8] text-[#2D3025] text-[9px] sm:text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full animate-bounce">
              {cart.length}
            </span>
          )}
        </Link>
      </div>
    </nav>
  )
}