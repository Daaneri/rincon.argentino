import { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';

export default function OrderForm() {
  const { cart } = useCart();
  const [loading, setLoading] = useState(false);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [formData, setFormData] = useState({ 
    nombre: '', direccion: '', localidad: '', zipcode: '' 
  });

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);
  const total = subtotal + shippingCost;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCalculateShipping = async (zipcode) => {
    if (zipcode.length < 4) return;
    setShippingLoading(true);
    try {
      const response = await fetch('https://rincon-argentino.onrender.com/test-shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zipcode })
      });
      const data = await response.json();
      if (data.price) setShippingCost(Number(data.price));
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setShippingLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('https://rincon-argentino.onrender.com/create_preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: cart.map(p => ({ title: p.name, unit_price: Number(p.price), quantity: Number(p.quantity) })),
          payer: formData, 
          shippingCost 
        })
      });
      const data = await response.json();
      if (data.id) window.location.href = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${data.id}`;
    } catch (error) {
      alert("Error al conectar con el sistema de pagos.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-[#1A1C16] border border-[#E6DCC8]/20 p-3 rounded text-sm text-[#E6DCC8] focus:border-[#E6DCC8]/50 outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input name="nombre" placeholder="Nombre completo" required className={inputClass} onChange={handleInputChange} />
      <input name="direccion" placeholder="Dirección" required className={inputClass} onChange={handleInputChange} />
      <input name="localidad" placeholder="Localidad" required className={inputClass} onChange={handleInputChange} />
      <input name="zipcode" placeholder="Código Postal" required className={inputClass} onChange={(e) => { handleInputChange(e); handleCalculateShipping(e.target.value); }} />
      <div className="text-[#E6DCC8] space-y-2 pt-4">
        <p>Subtotal: ${subtotal.toLocaleString()}</p>
        <p>Envío: {shippingLoading ? 'Calculando...' : `$${shippingCost.toLocaleString()}`}</p>
        <p className="font-bold text-lg">Total: ${total.toLocaleString()}</p>
      </div>
      <button type="submit" disabled={loading || shippingLoading} className="w-full bg-[#E6DCC8] py-4 rounded font-bold uppercase transition-colors disabled:opacity-50">
        {loading ? 'PROCESANDO...' : 'REALIZAR PEDIDO'}
      </button>
    </form>
  );
}