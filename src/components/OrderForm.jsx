import { useState } from 'react';
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Armamos el resumen de productos
    const productos = cart.map(p => `- ${p.name} ($${p.price})`).join('\n');
    const total = cart.reduce((sum, p) => sum + p.price, 0);

    const mensaje = `Hola! Quiero realizar un pedido a Rincon Argentinoo:
    
    *DATOS DEL CLIENTE:*
    Nombre: ${formData.nombre}
    Teléfono: ${formData.telefono}
    Dirección: ${formData.direccion}
    Localidad: ${formData.localidad}
    Correo preferido: ${formData.correo}

    *PEDIDO:*
    ${productos}
    
    *TOTAL ESTIMADO:* $${total}
    
    Espero tu confirmación para el envío, gracias!`;

    const url = `https://wa.me/5491133962727?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#252820]/50 p-6 rounded-2xl border border-[#E6DCC8]/10 space-y-4">
      <h3 className="text-xl font-serif text-[#E6DCC8] mb-4">Finalizar Pedido</h3>
      
      <input type="text" placeholder="Nombre y Apellido" required className="w-full p-3 rounded bg-[#2D3025] border border-[#E6DCC8]/20 text-[#E6DCC8]" onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
      <input type="tel" placeholder="WhatsApp" required className="w-full p-3 rounded bg-[#2D3025] border border-[#E6DCC8]/20 text-[#E6DCC8]" onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
      <input type="text" placeholder="Dirección" required className="w-full p-3 rounded bg-[#2D3025] border border-[#E6DCC8]/20 text-[#E6DCC8]" onChange={(e) => setFormData({...formData, direccion: e.target.value})} />
      <input type="text" placeholder="Localidad" required className="w-full p-3 rounded bg-[#2D3025] border border-[#E6DCC8]/20 text-[#E6DCC8]" onChange={(e) => setFormData({...formData, localidad: e.target.value})} />
      
      <select className="w-full p-3 rounded bg-[#2D3025] border border-[#E6DCC8]/20 text-[#E6DCC8]" onChange={(e) => setFormData({...formData, correo: e.target.value})}>
        <option value="Andreani">Andreani</option>
        <option value="Correo Argentino">Correo Argentino</option>
      </select>

      <button type="submit" className="w-full bg-[#E6DCC8] text-[#2D3025] font-bold py-3 rounded-xl hover:bg-white transition-colors">
        ENVIAR PEDIDO POR WHATSAPP
      </button>
    </form>
  );
}