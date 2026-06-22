import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [productos, setProductos] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProductos();
    fetchOrders();
  }, []);

  async function fetchProductos() {
    const { data } = await supabase.from('productos').select('*');
    setProductos(data || []);
  }

  async function fetchOrders() {
    const { data } = await supabase.from('orders').select('*');
    setOrders(data || []);
  }

  // --- COMPONENTES AUXILIARES ---
  const Card = ({ children, className = "" }) => (
    <div className={`bg-[#2d3025] rounded-3xl p-8 border border-[#e6dcc8]/5 shadow-xl ${className}`}>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1a1c17] text-[#e6dcc8] p-10 font-sans selection:bg-[#e6dcc8] selection:text-[#1a1c17]">
      <header className="mb-12">
        <h1 className="text-5xl font-serif font-light tracking-tight mb-3">Panel de Gestión</h1>
        <div className="flex gap-2 bg-[#2d3025] p-1.5 rounded-2xl w-fit border border-[#e6dcc8]/10">
          {['inventory', 'orders', 'metrics'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-2.5 rounded-xl capitalize transition-all duration-300 ${activeTab === tab ? 'bg-[#e6dcc8] text-[#1a1c17] font-medium shadow-lg' : 'text-[#e6dcc8]/60 hover:text-[#e6dcc8]'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main>
        {activeTab === 'inventory' && (
          <Card>
            <div className="flex justify-between items-center mb-8">
              <input 
                placeholder="Buscar productos..." 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#1a1c17] border border-[#e6dcc8]/10 p-3 px-5 rounded-xl w-1/3 outline-none focus:border-[#e6dcc8]/40" 
              />
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-[#e6dcc8]/40 text-left border-b border-[#e6dcc8]/10 text-xs uppercase tracking-widest">
                  <th className="pb-6 font-normal">Nombre</th>
                  <th className="pb-6 font-normal">Precio</th>
                  <th className="pb-6 font-normal">Stock</th>
                  <th className="pb-6 font-normal text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6dcc8]/5">
                {productos.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                  <tr key={p.id} className="group hover:bg-[#e6dcc8]/5 transition-colors">
                    <td className="py-6">{p.name}</td>
                    <td className="py-6 font-mono">${p.price}</td>
                    <td className="py-6">{p.stock || 0}</td>
                    <td className="py-6 text-right">
                      <button className="text-red-400/40 hover:text-red-400 transition-colors">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {activeTab === 'orders' && (
          <Card>
            <table className="w-full">
              <thead>
                <tr className="text-[#e6dcc8]/40 text-left border-b border-[#e6dcc8]/10 text-xs uppercase tracking-widest">
                  <th className="pb-6 font-normal">Cliente</th>
                  <th className="pb-6 font-normal">Total</th>
                  <th className="pb-6 font-normal">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6dcc8]/5">
                {orders.map(o => (
                  <tr key={o.id}>
                    <td className="py-6">{o.customer_name}</td>
                    <td className="py-6">${o.total}</td>
                    <td className="py-6">
                      <span className="px-3 py-1 rounded-full bg-[#e6dcc8]/5 text-xs uppercase tracking-wider">{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {activeTab === 'metrics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="flex flex-col justify-between h-48">
              <span className="text-[#e6dcc8]/50 uppercase tracking-widest text-xs">Ingresos Totales</span>
              <p className="text-5xl font-serif">${orders.reduce((acc, o) => acc + Number(o.total), 0)}</p>
            </Card>
            <Card className="flex flex-col justify-between h-48">
              <span className="text-[#e6dcc8]/50 uppercase tracking-widest text-xs">Total Pedidos</span>
              <p className="text-5xl font-serif">{orders.length}</p>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}