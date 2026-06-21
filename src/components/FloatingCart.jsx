import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

export default function FloatingCart() {
  const { cart } = useCart();
  
  const totalItems = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <Link 
      to="/cart" 
      className="fixed bottom-6 right-6 z-40 bg-[#E6DCC8] text-[#2D3025] p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300"
    >
      <div className="relative">
        <ShoppingCart size={24} />
        
        {totalItems > 0 && (
          <span className="absolute -top-3 -right-3 bg-[#2D3025] text-[#E6DCC8] text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold animate-bounce">
            {totalItems}
          </span>
        )}
      </div>
    </Link>
  );
}