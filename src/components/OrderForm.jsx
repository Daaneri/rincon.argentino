import { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function OrderForm() {
  const { cart } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', direccion: '', localidad: '' });

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

  const inputClass = "w-full p-4 rounded-xl bg-[#2D3025] border border-[#E6DCC8]/20 text-[#E6DCC8] mb-4";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-serif text-[#E6DCC8]/70">Detalles de envío</h3>
      <input type="text" placeholder="Nombre y Apellido" required className={inputClass} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
      <input type="text" placeholder="Dirección" required className={inputClass} onChange={(e) => setFormData({...formData, direccion: e.target.value})} />
      <input type="text" placeholder="Localidad" required className={inputClass} onChange={(e) => setFormData({...formData, localidad: e.target.value})} />
      
      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-[#E6DCC8] text-[#1A1C16] font-bold py-4 rounded-xl hover:bg-white transition-all mt-4"
      >
        {loading ? 'PROCESANDO...' : 'PAGAR CON MERCADO PAGO'}
      </button>
    </form>
  );
}