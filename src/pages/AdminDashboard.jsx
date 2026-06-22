import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [productos, setProductos] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', price: '', stock: '' });

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

  async function handleAddProduct() {
    const name = document.getElementById('new-name').value;
    const price = document.getElementById('new-price').value;
    const stock = document.getElementById('new-stock').value;
    if (!name || !price) return alert("Completa al menos nombre y precio");
    const { error } = await supabase.from('productos').insert([{ name, price, stock }]);
    if (error) alert("Error: " + error.message);
    else { alert("Producto agregado"); fetchProductos(); }
  }

  async function handleUpdate(id) {
    const { error } = await supabase.from('productos').update({ name: editData.name, price: Number(editData.price), stock: Number(editData.stock) }).eq('id', id);
    if (error) alert("Error: " + error.message);
    else { setEditingId(null); fetchProductos(); }
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) alert("Error al eliminar");
    else fetchProductos();
  }

  return (
    <div className="min-h-screen bg-[#2D3025] text-[#E6DCC8] p-8 font-sans">
      <h1 className="text-4xl font-serif font-bold mb-8 opacity-90">Panel de Control</h1>

      <div className="flex gap-4 mb-8">
        {['inventory', 'orders', 'metrics'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-full capitalize transition-all ${activeTab === tab ? 'bg-[#E6DCC8] text-[#2D3025] font-bold' : 'bg-[#E6DCC8]/5 border border-[#E6DCC8]/10 hover:bg-[#E6DCC8]/10'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-[#E6DCC8]/5 border border-[#E6DCC8]/10 p-8 rounded-3xl">
        {activeTab === 'inventory' && (
          <div>
            <div className="mb-8 p-6 bg-[#E6DCC8]/5 rounded-2xl flex gap-4 border border-[#E6DCC8]/10">
              <input id="new-name" placeholder="Nombre" className="p-3 bg-[#2D3025] border border-[#E6DCC8]/20 rounded-xl w-full" />
              <input id="new-price" type="number" placeholder="Precio" className="p-3 bg-[#2D3025] border border-[#E6DCC8]/20 rounded-xl w-24" />
              <input id="new-stock" type="number" placeholder="Stock" className="p-3 bg-[#2D3025] border border-[#E6DCC8]/20 rounded-xl w-24" />
              <button onClick={handleAddProduct} className="bg-[#E6DCC8] text-[#2D3025] px-6 py-2 rounded-xl font-bold">Guardar</button>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E6DCC8]/10 text-[#E6DCC8]/60">
                  <th className="p-4 uppercase text-xs tracking-widest">Nombre</th>
                  <th className="p-4 uppercase text-xs tracking-widest">Precio</th>
                  <th className="p-4 uppercase text-xs tracking-widest">Stock</th>
                  <th className="p-4 uppercase text-xs tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(p => (
                  <tr key={p.id} className="border-b border-[#E6DCC8]/5 hover:bg-[#E6DCC8]/5 transition-colors">
                    {editingId === p.id ? (
                      <>
                        <td className="p-4"><input defaultValue={p.name} onChange={(e) => setEditData({...editData, name: e.target.value})} className="bg-[#2D3025] p-2 rounded w-full" /></td>
                        <td className="p-4"><input type="number" defaultValue={p.price} onChange={(e) => setEditData({...editData, price: e.target.value})} className="bg-[#2D3025] p-2 rounded w-20" /></td>
                        <td className="p-4"><input type="number" defaultValue={p.stock} onChange={(e) => setEditData({...editData, stock: e.target.value})} className="bg-[#2D3025] p-2 rounded w-20" /></td>
                        <td className="p-4 space-x-2">
                          <button onClick={() => handleUpdate(p.id)} className="text-[#25D366] font-bold">Guardar</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-4">{p.name}</td>
                        <td className="p-4">${p.price}</td>
                        <td className="p-4">{p.stock || 0}</td>
                        <td className="p-4 space-x-4">
                          <button onClick={() => { setEditingId(p.id); setEditData(p); }} className="text-[#E6DCC8]/60 hover:text-[#E6DCC8]">Editar</button>
                          <button onClick={() => handleDelete(p.id)} className="text-red-400/80 hover:text-red-400">Eliminar</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {activeTab === 'orders' && (
          <table className="w-full text-left">
            <thead>
              <tr className="text-[#E6DCC8]/60 border-b border-[#E6DCC8]/10"><th className="p-4">Cliente</th><th className="p-4">Total</th><th className="p-4">Estado</th><th className="p-4">Fecha</th></tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-[#E6DCC8]/5">
                  <td className="p-4">{o.customer_name}</td>
                  <td className="p-4">${o.total}</td>
                  <td className="p-4"><span className="bg-[#E6DCC8]/10 px-3 py-1 rounded-full text-xs border border-[#E6DCC8]/20">{o.status}</span></td>
                  <td className="p-4">{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'metrics' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#2D3025] p-8 rounded-2xl border border-[#E6DCC8]/10">
              <h3 className="text-[#E6DCC8]/60 uppercase text-sm tracking-widest">Total Vendido</h3>
              <p className="text-5xl font-serif mt-2">${orders.reduce((acc, o) => acc + Number(o.total), 0)}</p>
            </div>
            <div className="bg-[#2D3025] p-8 rounded-2xl border border-[#E6DCC8]/10">
              <h3 className="text-[#E6DCC8]/60 uppercase text-sm tracking-widest">Pedidos</h3>
              <p className="text-5xl font-serif mt-2">{orders.length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}