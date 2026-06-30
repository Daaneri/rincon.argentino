import { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';

export default function OrderForm() {
  const { cart } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', direccion: '' });

  // Calculamos el total
  const total = useMemo(() => cart.reduce((sum, p) => sum + (p.price * p.quantity), 0), [cart]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const items = cart.map(p => ({ title: p.name, unit_price: Number(p.price), quantity: Number(p.quantity) }));
    
    try {
      // Reemplazá con tu URL de Render real
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

  const inputStyle = "w-full p-3 rounded bg-[#1A1C16] border border-[#E6DCC8]/20 text-[#E6DCC8] placeholder-[#E6DCC8]/50";
  const titleStyle = "text-xl font-serif text-[#E6DCC8] mb-4";

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 text-[#E6DCC8]">
      <h1 className="text-4xl font-serif text-[#E6DCC8] text-center mb-12">Tu Pedido</h1>

      {/* Contenedor Principal en Grid (3 columnas para desktop) */}
      <div className="grid md:grid-cols-3 gap-8 items-start">

        {/* Columna Izquierda (2/3): Datos de Envío y Pago */}
        <div className="md:col-span-2 space-y-10">
          
          {/* Sección Envío */}
          <div className="bg-[#2D3025] p-6 md:p-8 rounded-2xl border border-[#E6DCC8]/10 shadow-lg">
            <h3 className={titleStyle}>Detalles de envío</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <input type="text" placeholder="Nombre" className={`${inputStyle} sm:col-span-2`} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
              <input type="text" placeholder="Dirección" className={inputStyle} onChange={(e) => setFormData({...formData, direccion: e.target.value})} />
              <input type="text" placeholder="Localidad" className={inputStyle} />
            </div>
          </div>

          {/* Sección Pago */}
          <div className="bg-[#2D3025] p-6 md:p-8 rounded-2xl border border-[#E6DCC8]/10 shadow-lg">
            <h3 className={titleStyle}>Medio de pago</h3>
            <button 
              onClick={handleSubmit} 
              disabled={loading}
              className="w-full flex items-center justify-between p-4 bg-[#1A1C16] border border-[#E6DCC8]/20 rounded-xl hover:border-[#E6DCC8] transition-all group"
            >
              <span className="font-semibold text-base">Mercado Pago</span>
              <span className="text-2xl opacity-70 group-hover:opacity-100">💳</span>
            </button>
          </div>
        </div>

        {/* Columna Derecha (1/3): Resumen (Fondo Oscuro y Fijo) */}
        <div className="bg-[#1A1C16] p-6 md:p-8 rounded-2xl border border-[#E6DCC8]/10 space-y-6 sticky top-8 shadow-2xl">
          <h3 className={titleStyle}>Sumario</h3>
          
          {/* Listado de productos del carrito (Simplificado pero claro) */}
          <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
            {cart.map((item, i) => (
              <div key={i} className="flex justify-between items-center gap-4 text-sm">
                <div className="flex items-center gap-3">
                  {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-md border border-[#E6DCC8]/10" />}
                  <span>{item.name} <span className="opacity-70">x{item.quantity}</span></span>
                </div>
                <span className="font-semibold">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
              </div>
            ))}
          </div>

          {/* Totales */}
          <div className="border-t border-[#E6DCC8]/20 pt-4 space-y-2">
            <div className="flex justify-between text-sm opacity-80">
              <span>Subtotal</span>
              <span>${total.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-[#E6DCC8]">
              <span>Total</span>
              <span>${total.toLocaleString('es-AR')}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}