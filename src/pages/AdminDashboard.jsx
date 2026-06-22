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

  const Card = ({ children, className = "" }) => (
    <div className={`bg-[#181818] rounded-2xl p-6 border border-[#2a2a2a] ${className}`}>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">PANEL DE GESTIÓN</h1>
          <p className="text-gray-500 text-sm">admin: ejemplo@gmail.com</p>
        </div>
        <div className="space-x-4">
          <button className="text-sm border border-gray-800 px-4 py-2 rounded-lg hover:bg-white hover:text-black transition">VER TIENDA</button>
          <button className="text-sm bg-gray-900 border border-gray-800 px-4 py-2 rounded-lg hover:bg-red-900 transition">CERRAR SESIÓN</button>
        </div>
      </header>

      {/* Tabs con el nuevo color verde */}
      <div className="flex gap-4 mb-8">
        {['inventory', 'orders', 'metrics'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg capitalize text-sm font-bold transition ${activeTab === tab ? 'bg-[#25D366] text-black' : 'bg-gray-900 hover:bg-gray-800'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {activeTab === 'inventory' && (
          <Card className="md:col-span-1">
            <h2 className="text-lg font-bold mb-6 text-[#25D366]">NUEVO PRODUCTO</h2>
            <div className="space-y-4">
              <input placeholder="NOMBRE" className="w-full bg-[#0d0d0d] p-3 rounded-lg border border-[#2a2a2a] outline-none focus:border-[#25D366]" />
              <input placeholder="PRECIO ($)" className="w-full bg-[#0d0d0d] p-3 rounded-lg border border-[#2a2a2a] outline-none focus:border-[#25D366]" />
              <input placeholder="URL DE LA IMAGEN" className="w-full bg-[#0d0d0d] p-3 rounded-lg border border-[#2a2a2a] outline-none focus:border-[#25D366]" />
              <textarea placeholder="DESCRIPCIÓN CORTA" className="w-full bg-[#0d0d0d] p-3 rounded-lg border border-[#2a2a2a] h-24 outline-none focus:border-[#25D366]" />
              <button className="w-full bg-[#25D366] text-black font-bold py-3 rounded-lg hover:bg-white transition">PUBLICAR EN WEB</button>
            </div>
          </Card>
        )}

        <Card className={activeTab === 'inventory' ? "md:col-span-2" : "md:col-span-3"}>
          <h2 className="text-lg font-bold mb-6 uppercase">
            {activeTab === 'inventory' ? `PRODUCTOS ONLINE (${productos.length})` : activeTab}
          </h2>
          
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              {productos.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-[#0d0d0d] p-4 rounded-lg border border-[#2a2a2a]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-800 rounded"></div>
                    <div>
                      <p className="font-bold uppercase">{p.name}</p>
                      <p className="text-[#25D366] font-bold">${p.price}</p>
                    </div>
                  </div>
                  <div className="space-x-2">
                    <button className="text-xs bg-gray-800 px-3 py-1 rounded hover:bg-white hover:text-black">EDITAR</button>
                    <button className="text-xs bg-gray-900 px-3 py-1 rounded hover:bg-red-900">ELIMINAR</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'orders' && (
            <table className="w-full text-left">
              <thead className="text-gray-500 text-xs uppercase"><tr><th className="pb-4">Cliente</th><th className="pb-4">Total</th><th className="pb-4">Estado</th></tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-t border-[#2a2a2a]">
                    <td className="py-4">{o.customer_name}</td>
                    <td className="py-4">${o.total}</td>
                    <td className="py-4"><span className="bg-gray-800 px-2 py-1 rounded text-xs">{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'metrics' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0d0d0d] p-6 rounded-lg border border-[#2a2a2a]">
                <p className="text-gray-500 text-sm">TOTAL VENDIDO</p>
                <p className="text-3xl font-bold text-[#25D366]">${orders.reduce((acc, o) => acc + Number(o.total), 0)}</p>
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}