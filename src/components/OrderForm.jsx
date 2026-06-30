import { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';

export default function OrderForm() {
  const { cart } = useCart();
  const [loading, setLoading] = useState(false);

  const subtotal = useMemo(() => cart.reduce((sum, p) => sum + (p.price * p.quantity), 0), [cart]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Lógica de Mercado Pago igual a la anterior...
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 grid md:grid-cols-3 gap-8 text-[#E6DCC8]">
      
      {/* Columna Izquierda: Datos y Pago */}
      <div className="md:col-span-2 space-y-6">
        {/* Aquí irían tus campos de datos de contacto (Nombre, dirección, etc) */}
        
        <h3 className="text-xl font-bold border-b border-[#E6DCC8]/20 pb-2">Medio de pago</h3>
        <div className="space-y-3">
          {/* Opción Mercado Pago estilo tarjeta */}
          <button 
            onClick={handleSubmit}
            className="w-full flex items-center justify-between p-4 bg-[#2D3025] border border-[#E6DCC8]/20 rounded-lg hover:border-[#E6DCC8] transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">💳</span>
              <span className="font-semibold">Mercado Pago</span>
            </div>
            <span>→</span>
          </button>
          
          {/* Otras opciones visuales */}
          <div className="p-4 bg-[#2D3025]/50 border border-[#E6DCC8]/10 rounded-lg text-sm text-[#E6DCC8]/70">
            Transferencia bancaria y efectivo disponibles
          </div>
        </div>
      </div>

      {/* Columna Derecha: Resumen (como en image_801483.png) */}
      <div className="bg-[#2D3025] p-6 rounded-xl border border-[#E6DCC8]/10 h-fit">
        <h3 className="text-lg font-bold mb-4">Resumen</h3>
        <div className="space-y-3 text-sm">
          {cart.map((item, i) => (
            <div key={i} className="flex justify-between">
              <span>{item.name} x {item.quantity}</span>
              <span>${(item.price * item.quantity).toLocaleString('es-AR')}</span>
            </div>
          ))}
          <div className="border-t border-[#E6DCC8]/20 pt-3 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${subtotal.toLocaleString('es-AR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}