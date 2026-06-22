import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [view, setView] = useState('inventory');
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
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
    const file = formData.get('image');
    
    let imageUrl = '';
    if (file && file.size > 0) {
        const { data } = await supabase.storage.from('productos').upload(`${Date.now()}`, file);
        imageUrl = supabase.storage.from('productos').getPublicUrl(data.path).data.publicUrl;
    }

    await supabase.from('productos').insert([{ name, price, image_url: imageUrl }]);
    e.target.reset();
    fetchData();
    setLoading(false);
  }

  async function handleDelete(id) {
    await supabase.from('productos').delete().eq('id', id);
    fetchData();
  }

  return (
    <div className="flex min-h-screen bg-[#2D3025] text-[#EAE6D6] font-sans">
      {/* Sidebar estilo Rincón Argentino */}
      <aside className="w-64 border-r border-[#3d4234] p-10 flex flex-col">
        <h1 className="text-2xl font-serif mb-12 tracking-wide italic">Rincón Admin</h1>
        <nav className="space-y-8 flex-grow">
          {['inventory', 'orders', 'metrics'].map(item => (
            <button key={item} onClick={() => setView(item)} className={`block capitalize transition ${view === item ? 'text-white font-bold border-l-2 border-[#EAE6D6] pl-4' : 'text-[#8c9284] hover:text-white pl-4'}`}>
              {item}
            </button>
          ))}
        </nav>
        <button onClick={() => { supabase.auth.signOut(); navigate('/login'); }} className="text-xs text-[#5c6356] uppercase tracking-widest">Cerrar sesión</button>
      </aside>

      <main className="flex-1 p-16">
        {view === 'inventory' && (
          <div className="max-w-4xl space-y-12">
            {/* Formulario mejorado según image_57279e.png */}
            <form onSubmit={handleAddProduct} className="bg-[#35382d] p-8 rounded border border-[#454a3b] space-y-4">
              <h3 className="font-serif text-lg mb-4">Nuevo Producto</h3>
              <input name="name" placeholder="Nombre" className="w-full bg-[#2D3025] p-3 border border-[#454a3b] placeholder-[#8c9284]" required />
              <input name="price" type="number" placeholder="Precio" className="w-full bg-[#2D3025] p-3 border border-[#454a3b] placeholder-[#8c9284]" required />
              
              {/* Botón personalizado para archivo */}
              <div className="flex items-center gap-4">
                <label className="cursor-pointer bg-[#2D3025] border border-[#454a3b] px-4 py-2 text-sm text-[#EAE6D6] hover:bg-[#3d4234] transition">
                  SELECCIONAR FOTO
                  <input type="file" name="image" className="hidden" />
                </label>
                <button disabled={loading} className="bg-[#EAE6D6] text-[#2D3025] px-8 py-2 font-bold hover:opacity-90">
                  {loading ? 'GUARDANDO...' : 'GUARDAR'}
                </button>
              </div>
            </form>

            <div className="grid gap-4">
              {productos.map(p => (
                <div key={p.id} className="flex justify-between items-center bg-[#35382d] p-4 rounded border border-[#454a3b]">
                  <span>{p.name} - ${p.price}</span>
                  <button onClick={() => handleDelete(p.id)} className="text-red-400 text-xs uppercase">Eliminar</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'orders' && (
          <div className="bg-[#35382d] p-8 rounded border border-[#454a3b]">
            <table className="w-full text-left">
              <thead><tr className="border-b border-[#454a3b] text-[#8c9284]"><th>Cliente</th><th>Total</th><th>Estado</th></tr></thead>
              <tbody>
                {pedidos.map(o => <tr key={o.id} className="border-b border-[#454a3b] h-12"><td>{o.cliente}</td><td>${o.total}</td><td>{o.estado}</td></tr>)}
              </tbody>
            </table>
          </div>
        )}

        {view === 'metrics' && (
          <div className="h-96 bg-[#35382d] p-8 rounded border border-[#454a3b]">
            <h3 className="font-serif text-lg mb-6">Tendencia de Ventas</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pedidos}>
                <CartesianGrid stroke="#454a3b" strokeDasharray="3 3" />
                <XAxis stroke="#8c9284" dataKey="cliente" />
                <YAxis stroke="#8c9284" />
                <Tooltip contentStyle={{ backgroundColor: '#2D3025', borderColor: '#454a3b' }} />
                <Line type="monotone" dataKey="total" stroke="#EAE6D6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </main>
    </div>
  );
}