import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus } from 'lucide-react';
import OrderForm from './OrderForm';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();
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
    <div className="w-full max-w-6xl mx-auto py-12 px-6">
      <h1 className="text-4xl font-serif text-[#E6DCC8] mb-12 text-center">Tu Pedido</h1>
      
      {/* Grilla principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Columna Izquierda: Productos */}
        <div className="lg:col-span-7 space-y-6">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-6 bg-[#2D3025]/40 rounded-2xl border border-[#E6DCC8]/10">
              <div className="flex items-center gap-6">
                <img src={item.image_url} alt={item.name} className="w-20 h-20 object-cover rounded-xl" />
                <h3 className="font-bold text-[#E6DCC8]">{item.name}</h3>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => updateQuantity(item.id, -1)}><Minus size={18} /></button>
                <span className="font-bold w-8 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)}><Plus size={18} /></button>
                <button onClick={() => removeFromCart(item.id)} className="text-red-400"><Trash2 size={20} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Columna Derecha: Sumario y Formulario */}
        <div className="lg:col-span-5 bg-[#1A1C16] p-8 rounded-2xl border border-[#E6DCC8]/10 sticky top-24">
          <h2 className="text-2xl font-serif text-[#E6DCC8] mb-6">Sumario</h2>
          <div className="flex justify-between text-2xl font-bold text-[#E6DCC8] border-b border-[#E6DCC8]/10 pb-6 mb-8">
            <span>Total</span>
            <span>${total.toLocaleString('es-AR')}</span>
          </div>
          {/* Aquí inyectamos el formulario limpio */}
          <OrderForm />
        </div>
      </div>
    </div>
  );
}