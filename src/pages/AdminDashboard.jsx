import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [productos, setProductos] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editData, setEditData] = useState(null); // Estado para el producto en edición
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    fetchProductos();
    fetchOrders();
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) navigate('/login');
  }

  async function fetchProductos() {
    const { data } = await supabase.from('productos').select('*');
    setProductos(data || []);
  }

  async function fetchOrders() {
    const { data } = await supabase.from('orders').select('*');
    setOrders(data || []);
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newProduct = Object.fromEntries(formData.entries());
    await supabase.from('productos').insert([newProduct]);
    e.target.reset();
    fetchProductos();
  }

  async function handleDelete(id) {
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;
    await supabase.from('productos').delete().eq('id', id);
    fetchProductos();
  }

  async function handleUpdate(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updates = Object.fromEntries(formData.entries());
    await supabase.from('productos').update(updates).eq('id', editData.id);
    setEditData(null);
    fetchProductos();
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e6dcc8] p-8 font-sans">
      {/* MODAL DE EDICIÓN */}
      {editData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleUpdate} className="bg-[#2D3025] p-8 rounded-2xl w-full max-w-sm border border-[#e6dcc8]/20">
            <h2 className="text-xl font-bold mb-4">EDITAR PRODUCTO</h2>
            <input name="name" defaultValue={editData.name} className="w-full bg-[#1a1c17] p-3 mb-4 rounded-lg border border-[#e6dcc8]/10" />
            <input name="price" type="number" defaultValue={editData.price} className="w-full bg-[#1a1c17] p-3 mb-4 rounded-lg border border-[#e6dcc8]/10" />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-[#e6dcc8] text-black font-bold py-2 rounded-lg">GUARDAR</button>
              <button type="button" onClick={() => setEditData(null)} className="flex-1 bg-gray-800 py-2 rounded-lg">CANCELAR</button>
            </div>
          </form>
        </div>
      )}

      <header className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold font-serif tracking-widest">PANEL DE GESTIÓN</h1>
        <div className="space-x-4">
          <button onClick={() => navigate('/')} className="text-sm border border-[#2D3025] px-4 py-2 rounded-lg hover:bg-[#2D3025] transition">VER TIENDA</button>
          <button onClick={() => { supabase.auth.signOut(); navigate('/login'); }} className="text-sm bg-red-900/20 border border-red-900 px-4 py-2 rounded-lg hover:bg-red-900 transition">CERRAR SESIÓN</button>
        </div>
      </header>

      <div className="flex gap-4 mb-8">
        {['inventory', 'orders', 'metrics'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} 
            className={`px-6 py-2 rounded-lg capitalize text-sm font-bold transition ${activeTab === tab ? 'bg-[#2D3025] border border-[#e6dcc8]/20' : 'bg-[#1a1c17] hover:bg-[#2D3025]'}`}>
            {tab}
          </button>
        ))}
      </div>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {activeTab === 'inventory' && (
          <form onSubmit={handleAddProduct} className="bg-[#2D3025] p-6 rounded-2xl border border-[#e6dcc8]/5 h-fit">
            <h2 className="text-lg font-bold mb-6">NUEVO PRODUCTO</h2>
            <div className="space-y-4">
              <input name="name" placeholder="NOMBRE" required className="w-full bg-[#1a1c17] p-3 rounded-lg border border-[#e6dcc8]/10" />
              <input name="price" type="number" placeholder="PRECIO" required className="w-full bg-[#1a1c17] p-3 rounded-lg border border-[#e6dcc8]/10" />
              <input name="image_url" placeholder="URL IMAGEN" className="w-full bg-[#1a1c17] p-3 rounded-lg border border-[#e6dcc8]/10" />
              <button type="submit" className="w-full bg-[#e6dcc8] text-[#0a0a0a] font-bold py-3 rounded-lg">PUBLICAR</button>
            </div>
          </form>
        )}

        <div className={`bg-[#2D3025] p-6 rounded-2xl border border-[#e6dcc8]/5 ${activeTab === 'inventory' ? "md:col-span-2" : "md:col-span-3"}`}>
          <h2 className="text-lg font-bold mb-6 uppercase">{activeTab}</h2>
          
          {activeTab === 'inventory' && productos.map(p => (
            <div key={p.id} className="flex justify-between items-center bg-[#1a1c17] p-4 mb-2 rounded-lg border border-[#e6dcc8]/5">
              <span>{p.name} - ${p.price}</span>
              <div className="space-x-3">
                <button onClick={() => setEditData(p)} className="text-xs hover:text-[#e6dcc8]">EDITAR</button>
                <button onClick={() => handleDelete(p.id)} className="text-xs text-red-400">ELIMINAR</button>
              </div>
            </div>
          ))}

          {activeTab === 'orders' && orders.map(o => (
            <div key={o.id} className="flex justify-between p-4 border-b border-[#e6dcc8]/10">
              <span>{o.customer_name}</span>
              <span>${o.total}</span>
              <span className="text-xs px-2 py-1 bg-[#1a1c17] rounded">{o.status}</span>
            </div>
          ))}

          {activeTab === 'metrics' && (
            <div className="text-center py-10">
              <p className="text-sm text-[#e6dcc8]/50">TOTAL VENDIDO</p>
              <p className="text-4xl font-bold">${orders.reduce((acc, o) => acc + Number(o.total), 0)}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}