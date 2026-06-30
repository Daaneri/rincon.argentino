import { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';

export default function OrderForm() {
  const { cart } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', telefono: '', direccion: '' });

  const subtotal = useMemo(() => cart.reduce((sum, p) => sum + (p.price * p.quantity), 0), [cart]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Lógica para llamar a tu backend en Render
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
      alert("Error al conectar con Mercado Pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 grid md:grid-cols-5 gap-8 text-[#E6DCC8]">
      
      {/* Columna Izquierda: Datos y Pago (3/5) */}
      <div className="md:col-span-3 space-y-6">
        <div className="space-y-4">
          <h3 className="text-xl font-serif">Detalles de envío</h3>
          <input type="text" placeholder="Nombre y Apellido" className="w-full p-3 bg-[#2D3025] rounded border border-[#E6DCC8]/20" onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
          <input type="text" placeholder="Dirección" className="w-full p-3 bg-[#2D3025] rounded border border-[#E6DCC8]/20" onChange={(e) => setFormData({...formData, direccion: e.target.value})} />
        </div>

        <h3 className="text-xl font-serif pt-4">Medio de pago</h3>
        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className="w-full flex items-center justify-between p-4 bg-[#2D3025] border border-[#E6DCC8]/20 rounded-lg hover:border-[#E6DCC8] transition-all"
        >
          <span className="font-semibold">Mercado Pago</span>
          <span className="text-xl">💳</span>
        </button>
      </div>

      {/* Columna Derecha: Resumen (2/5) - Estilo image_801483.png */}
      <div className="md:col-span-2 bg-[#1A1C16] p-6 rounded-lg h-fit space-y-4">
        <h3 className="font-bold border-b border-[#E6DCC8]/20 pb-2">Resumen de compra</h3>
        <div className="space-y-2 text-sm">
          {cart.map((item, i) => (
            <div key={i} className="flex justify-between">
              <span>{item.name} x {item.quantity}</span>
              <span>${(item.price * item.quantity).toLocaleString('es-AR')}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-[#E6DCC8]/20 pt-4 flex justify-between text-xl font-bold">
          <span>Total</span>
          <span>${subtotal.toLocaleString('es-AR')}</span>
        </div>
      </div>
    </div>
  );
}