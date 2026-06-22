import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [view, setView] = useState('inventory');
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos');
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    const { data: p } = await supabase.from('productos').select('*');
    const { data: o } = await supabase.from('pedidos').select('*');
    setProductos(p || []);
    setPedidos(o || []);
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const price = parseFloat(formData.get('price'));
    const category = formData.get('category');
    const file = formData.get('image');
    
    let imageUrl = '';
    if (file && file.size > 0) {
        const { data } = await supabase.storage.from('productos').upload(`${Date.now()}`, file);
        imageUrl = supabase.storage.from('productos').getPublicUrl(data.path).data.publicUrl;
    }

    await supabase.from('productos').insert([{ name, price, category, image_url: imageUrl }]);
    e.target.reset();
    fetchData();
    setLoading(false);
  }

  async function handleDelete(id) {
    await supabase.from('productos').delete().eq('id', id);
    fetchData();
  }

  const productosFiltrados = categoriaFiltro === 'Todos' 
    ? productos 
    : productos.filter(p => p.category === categoriaFiltro);

  return (
    <div className="flex min-h-screen bg-[#2D3025] text-[#EAE6D6] font-serif">
      <aside className="w-64 border-r border-[#3d4234] p-10 flex flex-col">
        <h1 className="text-2xl mb-12 italic">Rincón Admin</h1>
        <nav className="space-y-6 flex-grow">
          {['inventory', 'orders', 'metrics'].map(item => (
            <button key={item} onClick={() => setView(item)} className={`block capitalize transition ${view === item ? 'text-white font-bold' : 'text-[#8c9284] hover:text-white'}`}>
              {item}
            </button>
          ))}
        </nav>
        <button onClick={() => { supabase.auth.signOut(); navigate('/login'); }} className="text-xs text-[#5c6356] uppercase tracking-widest">Cerrar sesión</button>
      </aside>

      <main className="flex-1 p-16">
        {view === 'inventory' && (
          <div className="max-w-4xl space-y-8">
            <form onSubmit={handleAddProduct} className="bg-[#35382d] p-8 rounded-2xl border border-[#454a3b] space-y-4">
              <h3 className="text-xl mb-4">Nuevo Producto</h3>
              <input name="name" placeholder="Nombre" className="w-full bg-[#2D3025] p-3 rounded-lg border border-[#454a3b]" required />
              <input name="price" type="number" placeholder="Precio" className="w-full bg-[#2D3025] p-3 rounded-lg border border-[#454a3b]" required />
              <select name="category" className="w-full bg-[#2D3025] p-3 rounded-lg border border-[#454a3b]">
                <option value="Mates">Mates</option>
                <option value="Yerbas">Yerbas</option>
                <option value="Bombillas">Bombillas</option>
                <option value="Accesorios">Accesorios</option>
              </select>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer bg-[#2D3025] border border-[#454a3b] px-4 py-2 rounded-lg text-sm hover:bg-[#3d4234] transition">
                  SELECCIONAR FOTO <input type="file" name="image" className="hidden" />
                </label>
                <button disabled={loading} className="bg-[#EAE6D6] text-[#2D3025] px-8 py-2 rounded-lg font-bold hover:opacity-90">GUARDAR</button>
              </div>
            </form>

            <div className="flex gap-2 mb-4">
              {['Todos', 'Mates', 'Yerbas', 'Bombillas', 'Accesorios'].map(cat => (
                <button key={cat} onClick={() => setCategoriaFiltro(cat)} className={`px-4 py-1 rounded-full text-sm ${categoriaFiltro === cat ? 'bg-[#EAE6D6] text-[#2D3025]' : 'bg-[#35382d] text-[#8c9284]'}`}>
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {productosFiltrados.map(p => (
                <div key={p.id} className="flex justify-between items-center bg-[#35382d] p-6 rounded-2xl border border-[#454a3b]">
                  <span>{p.name} - {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(p.price)}</span>
                  <div className="flex gap-4">
                    <button onClick={() => navigator.clipboard.writeText(p.id)} className="text-xs uppercase opacity-50">ID</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-400 text-xs uppercase underline">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'orders' && (
          <div className="bg-[#35382d] p-8 rounded-2xl border border-[#454a3b]">
            <table className="w-full text-left">
              <thead><tr className="border-b border-[#454a3b] text-[#8c9284]"><th>Cliente</th><th>Total</th><th>Estado</th></tr></thead>
              <tbody>
                {pedidos.map(o => <tr key={o.id} className="h-16"><td>{o.cliente}</td><td>${o.total}</td><td>{o.estado}</td></tr>)}
              </tbody>
            </table>
          </div>
        )}

        {view === 'metrics' && (
          <div className="h-96 bg-[#35382d] p-8 rounded-2xl border border-[#454a3b]">
            <h3 className="text-xl mb-6">Tendencia de Ventas</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pedidos}>
                <CartesianGrid stroke="#454a3b" strokeDasharray="3 3" />
                <XAxis stroke="#8c9284" dataKey="cliente" />
                <YAxis stroke="#8c9284" />
                <Tooltip contentStyle={{ backgroundColor: '#2D3025', borderColor: '#454a3b', borderRadius: '1rem' }} />
                <Line type="monotone" dataKey="total" stroke="#EAE6D6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </main>
    </div>
  );
}