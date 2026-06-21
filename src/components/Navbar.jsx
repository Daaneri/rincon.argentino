import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react'; // Importamos el icono
import { useCart } from '../context/CartContext'; // Importamos el contexto
import logo from '../assets/rincon.png';

export default function Navbar() {
  const { cart } = useCart(); // Obtenemos el carrito del contexto

  return (
    <nav className="sticky top-0 p-6 flex justify-between items-center z-50 bg-[#2D3025]/90 backdrop-blur-md border-b border-[#E6DCC8]/10">
      <Link to="/" className="flex items-center gap-3">
        <img 
          src={logo} 
          alt="Rincón Argentino Logo" 
          className="w-14 h-14 rounded-full border border-[#E6DCC8]/20 shadow-lg object-cover" 
        />
        <span className="font-serif font-bold text-[#E6DCC8] tracking-tight text-xl hidden md:block">
          RINCÓN ARGENTINO
        </span>
      </Link>
      
      <div className="flex gap-6 md:gap-8 items-center font-light text-[#E6DCC8] opacity-80 uppercase tracking-widest text-sm">
        <Link to="/" className="hover:opacity-100 transition duration-300">Inicio</Link>
        <Link to="/about" className="hover:opacity-100 transition duration-300">Nosotros</Link>
        
        {/* Ícono de carrito con contador animado */}
        <Link to="/cart" className="relative group transition-all duration-300 hover:scale-110 active:scale-95">
          <ShoppingCart className="w-6 h-6 hover:opacity-100" />
          {cart.length > 0 && (
            <span className="absolute -top-3 -right-3 bg-[#E6DCC8] text-[#2D3025] text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
              {cart.length}
            </span>
          )}
        </Link>
      </div>
    </nav>
  )
}