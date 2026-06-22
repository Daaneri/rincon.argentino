import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [productos, setProductos] = useState([]);
  const [orders, setOrders] = useState([]);

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

  // Función para agregar producto
  async function handleAddProduct() {
    const name = document.getElementById('new-name').value;
    const price = document.getElementById('new-price').value;
    const stock = document.getElementById('new-stock').value;
    
    if (!name || !price) return alert("Completa al menos nombre y precio");

    const { error } = await supabase.from('productos').insert([{ name, price, stock }]);
    if (error) alert("Error al guardar: " + error.message);
    else {
      alert("Producto agregado");
      fetchProductos();
    }
  }

  // Función para eliminar producto
  async function handleDelete(id) {
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) alert("Error al eliminar");
    else fetchProductos();
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Panel de Control</h1>

      <div className="flex gap-4 mb-8">
        {['inventory', 'orders', 'metrics'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded capitalize ${activeTab === tab ? 'bg-blue-600' : 'bg-neutral-800'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-neutral-800 p-6 rounded-lg">
        {activeTab === 'inventory' && (
          <div>
            <div className="mb-8 p-4 bg-neutral-700 rounded-lg flex gap-4">
              <input id="new-name" placeholder="Nombre" className="p-2 bg-neutral-600 rounded w-full" />
              <input id="new-price" type="number" placeholder="Precio" className="p-2 bg-neutral-600 rounded w-24" />
              <input id="new-stock" type="number" placeholder="Stock" className="p-2 bg-neutral-600 rounded w-24" />
              <button onClick={handleAddProduct} className="bg-green-600 px-4 py-2 rounded font-bold">Guardar</button>
            </div>

            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="p-2">Nombre</th>
                  <th className="p-2">Precio</th>
                  <th className="p-2">Stock</th>
                  <th className="p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(p => (
                  <tr key={p.id} className="border-t border-neutral-700">
                    <td className="p-2">{p.name}</td>
                    <td className="p-2">${p.price}</td>
                    <td className="p-2">{p.stock || 0}</td>
                    <td className="p-2">
                      <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Registro de Ventas</h2>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="p-2">Cliente</th>
                  <th className="p-2">Total</th>
                  <th className="p-2">Estado</th>
                  <th className="p-2">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-t border-neutral-700">
                    <td className="p-2">{o.customer_name}</td>
                    <td className="p-2">${o.total}</td>
                    <td className="p-2">
                      <span className="bg-yellow-600 px-2 py-1 rounded text-xs">{o.status}</span>
                    </td>
                    <td className="p-2">{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'metrics' && <p>Métricas en desarrollo...</p>}
      </div>
    </div>
  );
}