import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [productos, setProductos] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', price: '', stock: '', image_url: '' });
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

  // 1. Funcionalidad: Agregar productos (incluye image_url)
  async function handleAddProduct() {
    const name = document.getElementById('new-name').value;
    const price = document.getElementById('new-price').value;
    const stock = document.getElementById('new-stock').value;
    const image_url = document.getElementById('new-image').value;
    if (!name || !price) return alert("Completa al menos nombre y precio");
    await supabase.from('productos').insert([{ name, price, stock, image_url }]);
    fetchProductos();
  }

  // 2. Funcionalidad: Actualizar
  async function handleUpdate(id) {
    await supabase.from('productos').update(editData).eq('id', id);
    setEditingId(null);
    fetchProductos();
  }

  // 3. Funcionalidad: Confirmación de borrado
  async function handleDelete(id) {
    if (!window.confirm("¿Seguro que quieres borrar este producto?")) return;
    await supabase.from('productos').delete().eq('id', id);
    fetchProductos();
  }

  // 4. Funcionalidad: Estado de pedidos
  async function updateOrderStatus(id, newStatus) {
    await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    fetchOrders();
  }

  const productosFiltrados = productos.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#2D3025] text-[#E6DCC8] p-8 font-sans">
      <h1 className="text-4xl font-serif font-bold mb-8">Panel de Control</h1>

      <div className="flex gap-4 mb-8">
        {['inventory', 'orders', 'metrics'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} 
            className={`px-6 py-2 rounded-full capitalize ${activeTab === tab ? 'bg-[#E6DCC8] text-[#2D3025] font-bold' : 'bg-[#E6DCC8]/5 border border-[#E6DCC8]/10'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-[#E6DCC8]/5 border border-[#E6DCC8]/10 p-8 rounded-3xl">
        {activeTab === 'inventory' && (
          <div>
            {/* Formulario de creación */}
            <div className="mb-8 p-6 bg-[#E6DCC8]/5 rounded-2xl border border-[#E6DCC8]/10 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input id="new-name" placeholder="Nombre" className="p-3 bg-[#2D3025] border border-[#E6DCC8]/20 rounded-xl" />
              <input id="new-price" type="number" placeholder="Precio" className="p-3 bg-[#2D3025] border border-[#E6DCC8]/20 rounded-xl" />
              <input id="new-stock" type="number" placeholder="Stock" className="p-3 bg-[#2D3025] border border-[#E6DCC8]/20 rounded-xl" />
              <input id="new-image" placeholder="URL de la imagen" className="p-3 bg-[#2D3025] border border-[#E6DCC8]/20 rounded-xl" />
              <button onClick={handleAddProduct} className="bg-[#E6DCC8] text-[#2D3025] px-6 py-2 rounded-xl font-bold md:col-span-2">
                Agregar Producto
              </button>
            </div>

            <input placeholder="🔍 Buscar producto..." onChange={(e) => setSearchTerm(e.target.value)} 
              className="mb-6 p-3 bg-[#2D3025] border border-[#E6DCC8]/20 rounded-xl w-full" />
            
            <table className="w-full text-left">
              <thead>
                <tr className="text-[#E6DCC8]/60 border-b border-[#E6DCC8]/10 uppercase text-xs">
                  <th className="p-4">Nombre</th><th className="p-4">Precio</th><th className="p-4">Stock</th><th className="p-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map(p => (
                  <tr key={p.id} className="border-b border-[#E6DCC8]/5">
                    {editingId === p.id ? (
                      <>
                        <td className="p-4"><input defaultValue={p.name} onChange={(e) => setEditData({...editData, name: e.target.value})} className="bg-[#2D3025] p-2 rounded w-full" /></td>
                        <td className="p-4"><input type="number" defaultValue={p.price} onChange={(e) => setEditData({...editData, price: e.target.value})} className="bg-[#2D3025] p-2 rounded w-20" /></td>
                        <td className="p-4"><input type="number" defaultValue={p.stock} onChange={(e) => setEditData({...editData, stock: e.target.value})} className="bg-[#2D3025] p-2 rounded w-20" /></td>
                        <td className="p-4">
                          <input defaultValue={p.image_url} onChange={(e) => setEditData({...editData, image_url: e.target.value})} className="bg-[#2D3025] p-2 rounded w-full mb-2" placeholder="URL imagen" />
                          <button onClick={() => handleUpdate(p.id)} className="text-[#25D366] font-bold">Guardar</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-4">{p.name}</td>
                        <td className="p-4">${p.price}</td>
                        <td className="p-4">{p.stock}</td>
                        <td className="p-4 space-x-4">
                          <button onClick={() => { setEditingId(p.id); setEditData(p); }} className="text-[#E6DCC8]/60">Editar</button>
                          <button onClick={() => handleDelete(p.id)} className="text-red-400">Eliminar</button>
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
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-[#E6DCC8]/5">
                  <td className="p-4">{o.customer_name}</td>
                  <td className="p-4">${o.total}</td>
                  <td className="p-4">
                    <select value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                      className="bg-[#2D3025] border border-[#E6DCC8]/20 rounded p-1">
                      <option value="pendiente">Pendiente</option>
                      <option value="preparando">Preparando</option>
                      <option value="enviado">Enviado</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'metrics' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#2D3025] p-8 rounded-2xl border border-[#E6DCC8]/10">
              <h3 className="text-[#E6DCC8]/60 uppercase text-sm tracking-widest">Total Vendido</h3>
              <p className="text-5xl font-serif">${orders.reduce((acc, o) => acc + Number(o.total), 0)}</p>
            </div>
            <div className="bg-[#2D3025] p-8 rounded-2xl border border-[#E6DCC8]/10">
              <h3 className="text-[#E6DCC8]/60 uppercase text-sm tracking-widest">Pedidos</h3>
              <p className="text-5xl font-serif">{orders.length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}