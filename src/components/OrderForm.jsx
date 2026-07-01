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

  const handleCalculateShipping = async (zipcode) => {
    if (zipcode.length < 4) return;
    
    setShippingLoading(true);
    try {
      const response = await fetch('https://rincon-argentino-backend.onrender.com/test-shipping', {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zipcode })
      });
      
      // Si el servidor devuelve un 404, lanzamos error
      if (!response.ok) throw new Error('Servidor no encontrado');
      
      const data = await response.json();
      if (data.price) setShippingCost(Number(data.price));
    } catch (error) {
      console.error("Error de conexión:", error);
      // Aquí podrías setear un estado de error visual si lo deseas
    } finally {
      setShippingLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('https://rincon-argentino-backend.onrender.com/create_preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: cart.map(p => ({ title: p.name, unit_price: Number(p.price), quantity: Number(p.quantity) })),
          payer: formData, 
          shippingCost 
        })
      });
      
      const data = await response.json();
      if (data.id) {
        window.location.href = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${data.id}`;
      }
    } catch (error) {
      alert("Error al conectar con el sistema de pagos.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-[#1A1C16] border border-[#E6DCC8]/20 p-3 rounded text-sm text-[#E6DCC8] focus:border-[#E6DCC8]/50 outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Inputs... */}
      <input type="text" placeholder="Código Postal" required className={inputClass} 
        onChange={(e) => {
          setFormData({...formData, zipcode: e.target.value});
          handleCalculateShipping(e.target.value);
        }} 
      />
      {/* ... Resto del renderizado ... */}
      <button type="submit" disabled={loading} className="w-full bg-[#E6DCC8] py-4 rounded font-bold uppercase">
        {loading ? 'PROCESANDO...' : 'REALIZAR PEDIDO'}
      </button>
    </form>
  );
}