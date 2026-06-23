import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [view, setView] = useState('inventory');
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos');
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: '', price: '' });
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    const { data: p } = await supabase.from('productos').select('*');
    const { data: o } = await supabase.from('orders').select('*');
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
    
    let imageUrl = '';
    if (file) {
      const { data } = await supabase.storage.from('productos').upload(`${Date.now()}_${file.name}`, file);
      imageUrl = supabase.storage.from('productos').getPublicUrl(data.path).data.publicUrl;
    }

    await supabase.from('productos').insert([{ name, price, category, image_url: imageUrl }]);
    setFile(null);
    e.target.reset();
    fetchData();
    setLoading(false);
  }

  async function handleUpdate(id) {
    console.log("Intentando actualizar ID:", id, "con datos:", editData);
    
    // Usamos .select() para forzar a Supabase a devolver el registro actualizado
    const { data, error } = await supabase
      .from('productos')
      .update({ name: editData.name, price: Number(editData.price) })
      .eq('id', id)
      .select(); 
    
    if (error) {
      console.error("ERROR DE SUPABASE:", error);
      alert("Error en la base de datos: " + error.message);
    } else if (!data || data.length === 0) {
      console.error("No se actualizó nada. Revisa las políticas RLS en Supabase.");
      alert("Error: Supabase no permitió la actualización. Revisa las políticas RLS.");
    } else {
      console.log("Éxito. Registro actualizado:", data);
      setEditId(null);
      await fetchData(); 
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("¿Eliminar este producto?")) return;
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) alert("Error: " + error.message);
    else fetchData();
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
        <button type="button" onClick={() => handleUpdate(p.id)} className="bg-green-600 text-white px-4 py-1 rounded-full text-xs font-bold">OK</button>
      </aside>

      <main className="flex-1 p-16">
        {view === 'inventory' && (
          <div className="max-w-4xl space-y-8">
            <form onSubmit={handleAddProduct} className="bg-[#35382d] p-8 rounded-2xl border border-[#454a3b] space-y-4">
              <h3 className="text-xl mb-4">Nuevo Producto</h3>
              <input name="name" placeholder="Nombre" className="w-full bg-[#2D3025] p-3 rounded-full border border-[#454a3b] px-6" required />
              <input name="price" type="number" step="any" placeholder="Precio" className="w-full bg-[#2D3025] p-3 rounded-full border border-[#454a3b] px-6" required />
              <select name="category" className="w-full bg-[#2D3025] p-3 rounded-full border border-[#454a3b] px-6">
                <option value="Mates">Mates</option>
                <option value="Yerbas">Yerbas</option>
                <option value="Bombillas">Bombillas</option>
                <option value="Accesorios">Accesorios</option>
              </select>
              <button disabled={loading} className="bg-[#EAE6D6] text-[#2D3025] px-8 py-2 rounded-full font-bold">GUARDAR</button>
            </form>

            <div className="flex gap-2 mb-4">
              {['Todos', 'Mates', 'Yerbas', 'Bombillas', 'Accesorios'].map(cat => (
                <button key={cat} onClick={() => setCategoriaFiltro(cat)} className={`px-6 py-1 rounded-full text-sm ${categoriaFiltro === cat ? 'bg-[#EAE6D6] text-[#2D3025]' : 'bg-[#35382d] text-[#8c9284]'}`}>{cat}</button>
              ))}
            </div>

            <div className="space-y-4">
              {productosFiltrados.map(p => (
                <div key={p.id} className="flex justify-between items-center bg-[#35382d] p-6 rounded-2xl border border-[#454a3b]">
                  {editId === p.id ? (
                    <div className="flex gap-2 w-full">
                      <input className="bg-[#2D3025] px-4 py-1 rounded-full border border-[#454a3b]" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} />
                      <input className="bg-[#2D3025] px-4 py-1 rounded-full border border-[#454a3b] w-24" value={editData.price} type="number" step="any" onChange={(e) => setEditData({...editData, price: e.target.value})} />
                      <button type="button" onClick={() => handleUpdate(p.id)} className="bg-green-600 text-white px-4 py-1 rounded-full text-xs font-bold">OK</button>
                    </div>
                  ) : (
                    <>
                      <span>{p.name} - ${p.price}</span>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => { setEditId(p.id); setEditData({ name: p.name, price: p.price }); }} className="bg-[#2D3025] border border-[#454a3b] text-blue-400 px-4 py-1 rounded-full text-xs hover:bg-[#454a3b]">Editar</button>
                        <button type="button" onClick={() => handleDelete(p.id)} className="bg-[#2D3025] border border-[#454a3b] text-red-400 px-4 py-1 rounded-full text-xs hover:bg-[#454a3b]">Eliminar</button>
                      </div>
                    </>
                  )}
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