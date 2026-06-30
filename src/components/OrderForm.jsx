import { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';

export default function OrderForm() {
  const { cart } = useCart();
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    localidad: '',
    correo: 'Andreani'
  });
  const [loading, setLoading] = useState(false);

  // Calculamos el total de forma segura usando useMemo
  const total = useMemo(() => {
    return cart.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  }, [cart]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Preparamos los items para Mercado Pago
    const items = cart.map(p => ({
      title: p.name,
      unit_price: Number(p.price),
      quantity: Number(p.quantity)
    }));

    try {
      // 2. Llamamos a tu servidor en Render con tu enlace real
      const response = await fetch('https://rincon-argentino-backend.onrender.com/create_preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items,
          payer: formData // Enviamos los datos del cliente junto con los items
        })
      });

      const data = await response.json();

      // 3. Redirigimos al cliente a Mercado Pago
      if (data.id) {
        window.location.href = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${data.id}`;
      } else {
        alert("No se pudo generar la orden de pago. Verificá la configuración del backend.");
      }
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      alert("Hubo un error al conectar con el sistema de pagos. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="text-lg font-serif text-[#E6DCC8]">Finalizar Pedido</h3>
      
      <input type="text" placeholder="Nombre y Apellido" required className="w-full p-2 rounded bg-[#E6DCC8]/10 border border-[#E6DCC8]/20 text-[#E6DCC8]" onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
      <input type="tel" placeholder="WhatsApp" required className="w-full p-2 rounded bg-[#E6DCC8]/10 border border-[#E6DCC8]/20 text-[#E6DCC8]" onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
      <input type="text" placeholder="Dirección" required className="w-full p-2 rounded bg-[#E6DCC8]/10 border border-[#E6DCC8]/20 text-[#E6DCC8]" onChange={(e) => setFormData({...formData, direccion: e.target.value})} />
      <input type="text" placeholder="Localidad" required className="w-full p-2 rounded bg-[#E6DCC8]/10 border border-[#E6DCC8]/20 text-[#E6DCC8]" onChange={(e) => setFormData({...formData, localidad: e.target.value})} />
      
      <select className="w-full p-2 rounded bg-[#E6DCC8]/10 border border-[#E6DCC8]/20 text-[#E6DCC8]" onChange={(e) => setFormData({...formData, correo: e.target.value})}>
        <option value="Andreani">Andreani</option>
        <option value="Correo Argentino">Correo Argentino</option>
      </select>

      <div className="text-[#E6DCC8] font-bold text-xl py-2">Total: ${total.toLocaleString('es-AR')}</div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-[#E6DCC8] text-[#2D3025] font-bold py-2 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
      >
        {loading ? 'PROCESANDO...' : 'PAGAR CON MERCADO PAGO'}
      </button>
    </form>
  );
}