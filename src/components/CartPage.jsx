import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus } from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#E6DCC8]">
        <h2 className="text-3xl font-serif mb-4">Tu carrito está vacío</h2>
        <Link to="/" className="text-[#E6DCC8]/70 underline">Volver a la tienda</Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-16 px-6">
      <h1 className="text-5xl font-serif text-[#E6DCC8] mb-16 text-center tracking-tight">Tu Pedido</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

        <div className="lg:col-span-7 space-y-8">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-8 bg-[#2D3025]/40 rounded-3xl border border-[#E6DCC8]/10 transition-transform">
              <div className="flex items-center gap-8">
                <img src={item.image_url} alt={item.name} className="w-24 h-24 object-cover rounded-2xl" />
                <h3 className="font-bold text-xl text-[#E6DCC8]">{item.name}</h3>
              </div>
              <div className="flex items-center gap-6">
                <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-[#E6DCC8]/10 rounded-lg"><Minus size={20} /></button>
                <span className="font-bold text-lg w-10 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-[#E6DCC8]/10 rounded-lg"><Plus size={20} /></button>
                <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 ml-4"><Trash2 size={22} /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-5 bg-[#1A1C16] p-10 rounded-3xl border border-[#E6DCC8]/10 sticky top-28 shadow-2xl">
          <h2 className="text-3xl font-serif text-[#E6DCC8] mb-8">Sumario de compra</h2>

          <div className="flex justify-between items-center text-2xl font-bold text-[#E6DCC8] border-b border-[#E6DCC8]/10 pb-8 mb-8">
            <span>Total</span>
            <span className="text-4xl tracking-tight">${total.toLocaleString('es-AR')}</span>
          </div>

          <button
            onClick={() => navigate('/checkout/entrega')}
            className="w-full bg-[#E6DCC8] hover:bg-white text-[#2D3025] font-semibold tracking-wide rounded-xl px-6 py-4 transition-colors text-lg"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}