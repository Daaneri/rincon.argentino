import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { Trash2, Minus, Plus, ArrowRight } from 'lucide-react';
import { supabase } from '../supabaseClient'; // Importamos supabase

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  
  const total = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [cart]);

  const handleCheckout = async () => {
    // 1. Guardar en Supabase
    const { error } = await supabase
      .from('orders')
      .insert([{ 
        customer_name: 'Cliente Web', // Podrías pedir el nombre en un formulario
        total: total, 
        status: 'pendiente' 
      }]);

    if (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al procesar el pedido. Intenta nuevamente.");
      return;
    }

    // 2. Abrir WhatsApp si el registro fue exitoso
    const phoneNumber = "5493400000000"; 
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
    // ... el resto de tu código de renderizado (se mantiene igual)
    <div className="w-full max-w-[1200px] mx-auto py-12 px-6">
      <h1 className="text-4xl font-serif font-bold text-rincon-cream mb-12 text-center">Tu Pedido</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-6 bg-rincon-cream/5 rounded-2xl border border-rincon-cream/10">
              <div className="flex items-center gap-6">
                <img src={item.image_url} alt={item.name} className="w-20 h-20 object-cover rounded-xl" />
                <div>
                  <h3 className="font-bold text-lg text-rincon-cream">{item.name}</h3>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 bg-rincon-cream/10 rounded-lg p-2">
                  <button onClick={() => updateQuantity(item.id, -1)}><Minus size={16} /></button>
                  <span className="font-bold w-8 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)}><Plus size={16} /></button>
                </div>
                <span className="font-bold text-lg text-rincon-cream w-24 text-right">${item.price * item.quantity}</span>
                <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={20} /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-rincon-cream/5 p-8 rounded-3xl border border-rincon-cream/10 sticky top-24">
            <h2 className="text-2xl font-serif text-rincon-cream mb-6">Sumario</h2>
            <div className="flex justify-between text-2xl font-bold text-rincon-cream border-t border-rincon-cream/10 pt-4 mb-6">
              <span>Total</span><span>${total}</span>
            </div>
            <button onClick={handleCheckout} className="w-full bg-rincon-cream text-rincon-olive py-4 rounded-full font-bold text-lg hover:opacity-90 transition-all">
              FINALIZAR COMPRA <ArrowRight size={20} className="inline ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}