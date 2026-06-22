import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [stats, setStats] = useState({ totalVentas: 0, dataGrafico: [] });
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    // Cargar Productos
    const { data: prodData } = await supabase.from('productos').select('*');
    setProductos(prodData || []);

    // Cargar Pedidos (Asumiendo que tienes una tabla 'pedidos')
    const { data: pedData } = await supabase.from('pedidos').select('*');
    setPedidos(pedData || []);

    // Calcular estadísticas simples
    const total = pedData?.reduce((acc, p) => acc + (p.total || 0), 0) || 0;
    setStats({
      totalVentas: total,
      dataGrafico: [
        { name: 'Lun', ventas: 400 }, { name: 'Mar', ventas: 300 },
        { name: 'Mié', ventas: 600 }, { name: 'Jue', ventas: 800 }
      ]
    });
  }

  return (
    <div className="min-h-screen bg-[#0a1f10] text-[#e0eadd] p-6 md:p-12 font-sans">
      <header className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-white mb-6">Panel de Control</h1>
        <nav className="flex gap-2 border-b border-[#1e5c26] pb-2">
          {['inventory', 'orders', 'metrics'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-t-lg capitalize transition ${activeTab === tab ? 'bg-[#1e5c26] text-white font-bold' : 'text-[#88a88c] hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-6xl mx-auto">
        {/* PESTAÑA INVENTARIO */}
        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#0e2a14] p-6 rounded-xl border border-[#1e5c26]">
              <h2 className="text-white mb-4">Gestión de Stock</h2>
              {/* Aquí va tu formulario de productos completo */}
            </div>
            <div className="space-y-4">
              {productos.map(p => <div key={p.id} className="bg-[#0e2a14] p-4 rounded-lg border border-[#1e5c26] flex justify-between"><span>{p.name}</span><span className="text-[#4ade80]">${p.price}</span></div>)}
            </div>
          </div>
        )}

        {/* PESTAÑA PEDIDOS */}
        {activeTab === 'orders' && (
          <div className="bg-[#0e2a14] p-8 rounded-xl border border-[#1e5c26]">
            <table className="w-full text-left">
              <thead><tr className="text-[#88a88c] border-b border-[#1e5c26]"><th>Cliente</th><th>Total</th><th>Estado</th></tr></thead>
              <tbody>
                {pedidos.map(p => <tr key={p.id} className="border-b border-[#1e5c26]"><td>{p.cliente}</td><td>${p.total}</td><td className="text-[#4ade80]">{p.estado}</td></tr>)}
              </tbody>
            </table>
          </div>
        )}

        {/* PESTAÑA MÉTRICAS */}
        {activeTab === 'metrics' && (
          <div className="bg-[#0e2a14] p-8 rounded-xl border border-[#1e5c26]">
            <div className="mb-8">
              <p className="text-[#88a88c]">Ingresos Totales</p>
              <h3 className="text-4xl font-bold text-white">${stats.totalVentas}</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.dataGrafico}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e5c26" />
                  <XAxis dataKey="name" stroke="#88a88c" />
                  <YAxis stroke="#88a88c" />
                  <Tooltip contentStyle={{ backgroundColor: '#0e2a14', border: '1px solid #1e5c26' }} />
                  <Line type="monotone" dataKey="ventas" stroke="#4ade80" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}