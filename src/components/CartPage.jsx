import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus } from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#E6DCC8] px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-serif mb-4">Tu carrito está vacío</h2>
        <Link to="/" className="text-[#E6DCC8]/70 underline">Volver a la tienda</Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-10 sm:py-16 px-4 sm:px-6">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#E6DCC8] mb-10 sm:mb-16 text-center tracking-tight">Tu Pedido</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">

        <div className="lg:col-span-7 space-y-4 sm:space-y-6 md:space-y-8">
          {cart.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 sm:p-6 md:p-8 bg-[#2D3025]/40 rounded-2xl sm:rounded-3xl border border-[#E6DCC8]/10">
              <div className="flex items-center gap-4 sm:gap-6 md:gap-8 min-w-0">
                <img src={item.image_url} alt={item.name} className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-cover rounded-xl sm:rounded-2xl shrink-0" />
                <h3 className="font-bold text-base sm:text-lg md:text-xl text-[#E6DCC8] truncate">{item.name}</h3>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 md:gap-6">
                <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-[#E6DCC8]/10 rounded-lg shrink-0"><Minus size={18} /></button>
                  <span className="font-bold text-base sm:text-lg w-8 sm:w-10 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-[#E6DCC8]/10 rounded-lg shrink-0"><Plus size={18} /></button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 shrink-0"><Trash2 size={20} /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-5 bg-[#1A1C16] p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border border-[#E6DCC8]/10 lg:sticky lg:top-28 shadow-2xl">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-[#E6DCC8] mb-6 sm:mb-8">Sumario de compra</h2>

          <div className="flex justify-between items-center text-lg sm:text-xl md:text-2xl font-bold text-[#E6DCC8] border-b border-[#E6DCC8]/10 pb-6 sm:pb-8 mb-6 sm:mb-8">
            <span>Total</span>
            <span className="text-2xl sm:text-3xl md:text-4xl tracking-tight">${total.toLocaleString('es-AR')}</span>
          </div>

          <button
            onClick={() => navigate('/checkout/entrega')}
            className="w-full bg-[#E6DCC8] hover:bg-white text-[#2D3025] font-semibold tracking-wide rounded-xl px-6 py-3.5 sm:py-4 transition-colors text-base sm:text-lg"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}