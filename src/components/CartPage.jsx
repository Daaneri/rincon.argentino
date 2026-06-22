import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { Trash2, ShieldCheck, Truck, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart } = useCart();
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = () => {
    const phoneNumber = "5493400000000"; // REEMPLAZÁ CON TU NÚMERO
    let message = "¡Hola! Quiero realizar el siguiente pedido:\n\n";
    cart.forEach((item) => {
      message += `- ${item.name} (x${item.quantity}): $${item.price * item.quantity}\n`;
    });
    message += `\n*Total: $${total}*`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-rincon-cream">
        <h2 className="text-3xl font-serif mb-4">Tu carrito está vacío</h2>
        <Link to="/" className="text-rincon-cream/70 underline hover:text-rincon-cream">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <h1 className="text-4xl font-serif font-bold text-rincon-cream mb-12 text-center">Tu Pedido</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-6">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-6 bg-rincon-cream/5 rounded-2xl border border-rincon-cream/10">
              <div className="flex items-center gap-4">
                <img src={item.image_url} alt={item.name} className="w-20 h-20 object-cover rounded-xl" />
                <div>
                  <h3 className="font-bold text-lg text-rincon-cream">{item.name}</h3>
                  <p className="text-rincon-cream/60 text-sm">Cantidad: {item.quantity}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-rincon-cream font-bold text-lg">${item.price * item.quantity}</span>
                <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={20} /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="md:col-span-1">
          <div className="bg-rincon-cream/5 p-8 rounded-3xl border border-rincon-cream/10 sticky top-24">
            <h2 className="text-2xl font-serif text-rincon-cream mb-6">Resumen</h2>
            <div className="flex justify-between items-center text-lg text-rincon-cream mb-8">
              <span>Total</span>
              <span className="font-bold text-3xl">${total}</span>
            </div>
            <div className="space-y-4 text-sm text-rincon-cream/60 mb-8 border-t border-rincon-cream/10 pt-6">
              <div className="flex items-center gap-3"><Truck size={18} /> <span>Envío a todo el país.</span></div>
              <div className="flex items-center gap-3"><ShieldCheck size={18} /> <span>Pago seguro vía Mercado Pago.</span></div>
            </div>
            <button onClick={handleCheckout} className="w-full flex items-center justify-center gap-2 bg-rincon-cream text-rincon-olive py-4 rounded-full font-bold text-lg hover:scale-[1.02] transition-transform shadow-lg">
              FINALIZAR COMPRA
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}