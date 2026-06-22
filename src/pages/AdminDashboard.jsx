import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from 'recharts';

export default function AdminDashboard() {
  const [view, setView] = useState('home'); // home, inventory, orders, metrics
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-[#2D3025] text-[#EAE6D6] font-sans">
      {/* SIDEBAR - Estilo Minimalista */}
      <aside className="w-64 border-r border-[#3d4234] p-8 flex flex-col">
        <h1 className="text-xl font-serif mb-12 italic">Rincón Admin</h1>
        <nav className="space-y-6 flex-grow">
          {['home', 'inventory', 'orders', 'metrics'].map(item => (
            <button key={item} onClick={() => setView(item)} className={`block capitalize hover:text-white transition ${view === item ? 'text-white font-bold' : 'text-[#8c9284]'}`}>
              {item}
            </button>
          ))}
        </nav>
        <button onClick={() => { supabase.auth.signOut(); navigate('/login'); }} className="text-sm text-[#5c6356]">Cerrar sesión</button>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-12">
        {view === 'inventory' && <InventorySection />}
        {view === 'metrics' && <MetricsSection />}
        {view === 'orders' && <OrdersSection />}
        {view === 'home' && <h2 className="text-3xl font-serif">Bienvenido al panel de gestión</h2>}
      </main>
    </div>
  );
}

// Componentes modulares para mantener el orden y la calidad visual
function InventorySection() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-serif mb-6">Inventario</h2>
      <div className="bg-[#35382d] p-6 rounded-lg border border-[#454a3b]">
        {/* Aquí iría el formulario con el input de imagen que definimos */}
        <p className="text-[#a8ad9e]">Panel de carga de nuevos productos...</p>
      </div>
    </div>
  );
}

function MetricsSection() {
  const data = [{name: 'Lun', ventas: 400}, {name: 'Mar', ventas: 700}, {name: 'Mié', ventas: 500}];
  return (
    <div>
      <h2 className="text-2xl font-serif mb-8">Métricas de Venta</h2>
      <div className="h-64 bg-[#35382d] p-6 rounded-lg border border-[#454a3b]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="name" stroke="#8c9284" />
            <Tooltip contentStyle={{ backgroundColor: '#2D3025', border: '1px solid #454a3b' }} />
            <Line type="monotone" dataKey="ventas" stroke="#EAE6D6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function OrdersSection() {
  return (
    <div>
      <h2 className="text-2xl font-serif mb-6">Pedidos Recientes</h2>
      <div className="bg-[#35382d] rounded-lg border border-[#454a3b] p-6">
        {/* Tabla estilizada */}
        <p className="text-[#a8ad9e]">Lista de pedidos en tiempo real...</p>
      </div>
    </div>
  );
}