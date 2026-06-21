import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { Trash2, ShieldCheck, Truck } from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart } = useCart();
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-rincon-cream">
        <h2 className="text-3xl font-serif mb-4">Tu carrito está vacío</h2>
        <Link to="/" className="text-rincon-cream/70 underline hover:text-rincon-cream">Volver a la selección</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <h1 className="text-4xl font-serif font-bold text-rincon-cream mb-8 text-center">Tu Pedido</h1>
      
      <div className="bg-rincon-cream/5 backdrop-blur-md rounded-3xl p-8 border border-rincon-cream/10">
        {cart.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-4 border-b border-rincon-cream/10">
            <div className="flex flex-col">
              <h3 className="text-lg font-bold text-rincon-cream">{item.name}</h3>
              <p className="text-rincon-cream/70 text-sm">{item.quantity} unidad(es)</p>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-rincon-cream font-bold">${item.price * item.quantity}</span>
              <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-300">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        
        <div className="mt-6 pt-6 border-t-2 border-rincon-cream/10">
            <div className="flex justify-between items-center text-xl font-bold text-rincon-cream mb-6">
                <span>Total</span>
                <span>${total}</span>
            </div>

            {/* SECCIÓN DE CONFIANZA */}
            <div className="space-y-3 text-sm text-rincon-cream/60 mb-8">
                <div className="flex items-center gap-2"><Truck size={16} /> Envío a todo el país a través de correo privado.</div>
                <div className="flex items-center gap-2"><ShieldCheck size={16} /> Pago seguro gestionado por Mercado Pago.</div>
            </div>

            <button className="w-full bg-rincon-cream text-rincon-olive py-4 rounded-full font-bold text-lg hover:scale-[1.02] transition-transform">
                FINALIZAR COMPRA
            </button>
        </div>
      </div>
    </div>
  );
}