import { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';

export default function OrderForm() {
  const { cart } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', direccion: '', localidad: '' });

  // Calculamos los costos para el desglose
  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);
  const costoEnvio = 8741; // Podrías hacerlo dinámico luego
  const total = subtotal + costoEnvio;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const items = cart.map(p => ({ title: p.name, unit_price: Number(p.price), quantity: Number(p.quantity) }));
    
    try {
      const response = await fetch('https://rincon-argentino-backend.onrender.com/create_preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, payer: formData })
      });
      const data = await response.json();
      if (data.id) window.location.href = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${data.id}`;
    } catch (error) {
      alert("Error al conectar con el sistema de pagos.");
    } finally {
      setLoading(false);
    }
  };

  // Clases sobrias al estilo "Nube"
  const inputClass = "w-full bg-[#1A1C16] border border-[#E6DCC8]/20 p-3 rounded text-sm text-[#E6DCC8] focus:border-[#E6DCC8]/50 outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sección de Campos */}
      <div className="space-y-3">
        <h3 className="text-[#E6DCC8] text-sm font-medium border-b border-[#E6DCC8]/10 pb-2">Información de entrega</h3>
        <input type="text" placeholder="Nombre y Apellido" required className={inputClass} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
        <input type="text" placeholder="Dirección" required className={inputClass} onChange={(e) => setFormData({...formData, direccion: e.target.value})} />
        <input type="text" placeholder="Localidad" required className={inputClass} onChange={(e) => setFormData({...formData, localidad: e.target.value})} />
      </div>

      {/* Desglose de Precios (se ve como en image_8153b1.png) */}
      <div className="space-y-2 pt-2 text-[#E6DCC8]">
        <div className="flex justify-between text-sm opacity-70">
          <span>Subtotal</span>
          <span>${subtotal.toLocaleString('es-AR')}</span>
        </div>
        <div className="flex justify-between text-sm opacity-70">
          <span>Costo de envío</span>
          <span>${costoEnvio.toLocaleString('es-AR')}</span>
        </div>
        <div className="flex justify-between text-xl font-bold border-t border-[#E6DCC8]/10 pt-3">
          <span>Total</span>
          <span>${total.toLocaleString('es-AR')}</span>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-[#E6DCC8] text-[#1A1C16] font-bold py-4 rounded hover:bg-white transition-all text-sm uppercase tracking-wider"
      >
        {loading ? 'PROCESANDO...' : 'REALIZAR PEDIDO'}
      </button>
    </form>
  );
}