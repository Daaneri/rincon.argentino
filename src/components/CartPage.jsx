import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { Trash2, ShieldCheck, Truck, ArrowRight, Minus, Plus } from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = () => {
    const phoneNumber = "5493400000000"; // Tu número aquí
    let message = "¡Hola! Quiero realizar este pedido:\n\n";
    cart.forEach(item => message += `- ${item.name} (x${item.quantity}): $${item.price * item.quantity}\n`);
    message += `\n*Total: $${total}*`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-rincon-cream">
        <h2 className="text-3xl font-serif mb-4">Tu carrito está vacío</h2>
        <Link to="/" className="text-rincon-cream/70 underline">Volver a la tienda</Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto py-12 px-6">
      <h1 className="text-4xl font-serif font-bold text-rincon-cream mb-12 text-center">Tu Pedido</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* COLUMNA IZQUIERDA: LISTADO EXTENDIDO */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-6 bg-rincon-cream/5 rounded-2xl border border-rincon-cream/10">
              <div className="flex items-center gap-6">
                <img src={item.image_url} alt={item.name} className="w-24 h-24 object-cover rounded-xl" />
                <div>
                  <h3 className="font-bold text-xl text-rincon-cream">{item.name}</h3>
                  <p className="text-rincon-cream/60 text-sm">Material: Cuero y Madera</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 bg-rincon-cream/10 rounded-lg p-2">
                  <button onClick={() => updateQuantity(item.id, -1)}><Minus size={16} /></button>
                  <span className="font-bold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)}><Plus size={16} /></button>
                </div>
                <span className="font-bold text-lg text-rincon-cream w-24 text-right">${item.price * item.quantity}</span>
                <button onClick={() => removeFromCart(item.id)} className="text-red-400"><Trash2 size={20} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* COLUMNA DERECHA: RESUMEN ROBUSTO (Como en image_145806.jpg) */}
        <div className="lg:col-span-1">
          <div className="bg-rincon-cream/5 p-8 rounded-3xl border border-rincon-cream/10 sticky top-24">
            <h2 className="text-2xl font-serif text-rincon-cream mb-6">Sumario de pedido</h2>
            <div className="space-y-3 text-rincon-cream/80 mb-6">
              <div className="flex justify-between"><span>Subtotal</span><span>${total}</span></div>
              <div className="flex justify-between"><span>Envío</span><span>Calcular/Gratis</span></div>
            </div>
            <div className="flex justify-between text-2xl font-bold text-rincon-cream border-t border-rincon-cream/10 pt-4 mb-6">
              <span>Total</span><span>${total}</span>
            </div>
            
            <button onClick={handleCheckout} className="w-full bg-rincon-cream text-rincon-olive py-4 rounded-full font-bold text-lg hover:opacity-90 transition-all mb-4">
              FINALIZAR COMPRA
            </button>
            <div className="text-xs text-rincon-cream/50 space-y-2">
              <p>✓ Envío a todo el país.</p>
              <p>✓ Pago seguro vía Mercado Pago.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}