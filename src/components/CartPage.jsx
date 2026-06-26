import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { Trash2, Minus, Plus } from 'lucide-react';
import OrderForm from './OrderForm'; // Importamos el formulario

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  
  const total = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [cart]);

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#E6DCC8]">
        <h2 className="text-3xl font-serif mb-4">Tu carrito está vacío</h2>
        <Link to="/" className="text-[#E6DCC8]/70 underline">Volver a la tienda</Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto py-12 px-6">
      <h1 className="text-4xl font-serif font-bold text-[#E6DCC8] mb-12 text-center">Tu Pedido</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Lista de productos */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-6 bg-[#E6DCC8]/5 rounded-2xl border border-[#E6DCC8]/10">
              <div className="flex items-center gap-6">
                <img src={item.image_url} alt={item.name} className="w-20 h-20 object-cover rounded-xl" />
                <div>
                  <h3 className="font-bold text-lg text-[#E6DCC8]">{item.name}</h3>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 bg-[#E6DCC8]/10 rounded-lg p-2">
                  <button onClick={() => updateQuantity(item.id, -1)}><Minus size={16} /></button>
                  <span className="font-bold w-8 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)}><Plus size={16} /></button>
                </div>
                <span className="font-bold text-lg text-[#E6DCC8] w-24 text-right">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={20} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Columna derecha con formulario */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#E6DCC8]/5 p-8 rounded-3xl border border-[#E6DCC8]/10 sticky top-24">
            <h2 className="text-2xl font-serif text-[#E6DCC8] mb-6">Sumario</h2>
            <div className="flex justify-between text-2xl font-bold text-[#E6DCC8] border-t border-[#E6DCC8]/10 pt-4 mb-6">
              <span>Total</span>
              <span>${total.toLocaleString('es-AR')}</span>
            </div>
            
            {/* Aquí insertamos el formulario en lugar del botón viejo */}
            <OrderForm />
          </div>
        </div>
      </div>
    </div>
  );
}