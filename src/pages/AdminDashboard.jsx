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
  const [busqueda, setBusqueda] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: '', price: '', stock: 0 });
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const mostrarMensaje = (texto) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(''), 3000);
  };

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
    const stock = parseInt(formData.get('stock'));
    const category = formData.get('category');
    
    let imageUrl = '';
    if (file) {
      const { data } = await supabase.storage.from('productos').upload(`${Date.now()}_${file.name}`, file);
      if (data) imageUrl = supabase.storage.from('productos').getPublicUrl(data.path).data.publicUrl;
    }

    const { error } = await supabase.from('productos').insert([{ name, price, stock, category, image_url: imageUrl }]);
    if (error) mostrarMensaje("Error: " + error.message);
    else {
      mostrarMensaje("Producto agregado con éxito");
      setFile(null);
      e.target.reset();
      fetchData();
    }
    setLoading(false);
  }

  async function handleUpdate(product) {
    const idNumerico = parseInt(product.id, 10);
    const { error } = await supabase.from('productos')
      .update({ name: editData.name, price: editData.price.toString(), stock: parseInt(editData.stock), category: product.category, image_url: product.image_url })
      .eq('id', idNumerico);

    if (error) mostrarMensaje("Error al actualizar: " + error.message);
    else {
      mostrarMensaje("Producto actualizado");
      setEditId(null);
      fetchData();
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("¿Eliminar este producto?")) return;
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) mostrarMensaje("Error: " + error.message);
    else {
      mostrarMensaje("Producto eliminado");
      fetchData();
    }
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) mostrarMensaje("Error al cerrar sesión");
    else navigate('/login');
  }

  const productosFiltrados = productos.filter(p => {
    const coincideCat = categoriaFiltro === 'Todos' || p.category === categoriaFiltro;
    const coincideBusqueda = p.name.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCat && coincideBusqueda;
  });

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#2D3025] text-[#EAE6D6] font-serif">
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#3d4234] p-6 flex flex-col">
        <h1 className="text-2xl mb-6 md:mb-12 italic">Rincón Admin</h1>
        <nav className="flex md:flex-col gap-4 md:space-y-6 flex-grow overflow-x-auto pb-2">
          {['inventory', 'orders', 'metrics'].map(item => (
            <button key={item} onClick={() => setView(item)} className={`capitalize transition whitespace-nowrap ${view === item ? 'text-white font-bold' : 'text-[#8c9284] hover:text-white'}`}>
              {item}
            </button>
          ))}
        </nav>
        <button onClick={handleSignOut} className="text-red-400 hover:text-red-300 italic text-left mt-4 md:mt-auto">Cerrar sesión</button>
      </aside>

      <main className="flex-1 p-6 md:p-16">
        {mensaje && <div className="bg-green-700 text-white p-3 rounded-xl mb-4 text-center animate-pulse">{mensaje}</div>}

        {view === 'inventory' && (
          <div className="max-w-4xl space-y-8">
            <form onSubmit={handleAddProduct} className="bg-[#35382d] p-6 md:p-8 rounded-2xl border border-[#454a3b] space-y-4">
              <h3 className="text-xl mb-4">Nuevo Producto</h3>
              <input name="name" placeholder="Nombre" className="w-full bg-[#2D3025] p-3 rounded-full border border-[#454a3b] px-6" required />
              <input name="price" type="number" step="any" placeholder="Precio" className="w-full bg-[#2D3025] p-3 rounded-full border border-[#454a3b] px-6" required />
              <input name="stock" type="number" placeholder="Stock" className="w-full bg-[#2D3025] p-3 rounded-full border border-[#454a3b] px-6" required />
              <select name="category" className="w-full bg-[#2D3025] p-3 rounded-full border border-[#454a3b] px-6">
                <option value="Mates">Mates</option><option value="Yerbas">Yerbas</option><option value="Bombillas">Bombillas</option><option value="Accesorios">Accesorios</option>
              </select>
              <div className="flex flex-col items-center gap-2">
                <input type="file" id="fileInput" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
                <label htmlFor="fileInput" className="cursor-pointer bg-[#454a3b] px-6 py-2 rounded-full border border-[#8c9284] hover:bg-[#5a614d] transition text-sm">
                  {file ? file.name : "Seleccionar Imagen"}
                </label>
              </div>
              <button disabled={loading} className="bg-[#EAE6D6] text-[#2D3025] w-full px-8 py-2 rounded-full font-bold">GUARDAR</button>
            </form>

            <input type="text" placeholder="🔍 Buscar producto..." className="w-full bg-[#35382d] p-3 rounded-full border border-[#454a3b] px-6 mb-4" onChange={(e) => setBusqueda(e.target.value)} />

            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {['Todos', 'Mates', 'Yerbas', 'Bombillas', 'Accesorios'].map(cat => (
                <button key={cat} onClick={() => setCategoriaFiltro(cat)} className={`px-6 py-1 rounded-full text-sm whitespace-nowrap ${categoriaFiltro === cat ? 'bg-[#EAE6D6] text-[#2D3025]' : 'bg-[#35382d] text-[#8c9284]'}`}>{cat}</button>
              ))}
            </div>

            <div className="space-y-4">
              {productosFiltrados.map(p => (
                <div key={p.id} className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#35382d] p-6 rounded-2xl border border-[#454a3b]">
                  {editId === p.id ? (
                    <div className="flex flex-col md:flex-row gap-2 w-full">
                      <input className="bg-[#2D3025] p-2 rounded-full border border-[#454a3b] flex-1" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} />
                      <div className="flex gap-2">
                        <input className="bg-[#2D3025] p-2 rounded-full border border-[#454a3b] w-20" value={editData.price} type="number" onChange={(e) => setEditData({...editData, price: e.target.value})} />
                        <input className="bg-[#2D3025] p-2 rounded-full border border-[#454a3b] w-20" value={editData.stock} type="number" onChange={(e) => setEditData({...editData, stock: e.target.value})} />
                        <button type="button" onClick={() => handleUpdate(p)} className="bg-green-600 text-white px-4 py-2 rounded-full text-xs font-bold">OK</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className={`truncate max-w-[40%] ${ (p.stock ?? 0) < 5 ? "text-red-400 font-bold" : "" }`}>
                        {p.name}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="font-bold">${p.price}</span>
                        <span className={`text-sm ${ (p.stock ?? 0) < 5 ? "text-red-400" : "text-gray-400" }`}>
                          Stock: {p.stock ?? 0}
                        </span>
                        <div className="flex gap-2">
                          <button onClick={() => { setEditId(p.id); setEditData({ name: p.name, price: p.price, stock: p.stock }); }} className="bg-[#2D3025] border border-[#454a3b] text-blue-400 px-4 py-1 rounded-full text-xs">Editar</button>
                          <button onClick={() => handleDelete(p.id)} className="bg-[#2D3025] border border-[#454a3b] text-red-400 px-4 py-1 rounded-full text-xs">Eliminar</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'orders' && (
           <div className="bg-[#35382d] p-4 md:p-8 rounded-2xl border border-[#454a3b] overflow-x-auto">
             <table className="w-full text-left min-w-[500px]">
               <thead><tr className="border-b border-[#454a3b] text-[#8c9284]"><th>Cliente</th><th>Total</th><th>Estado</th></tr></thead>
               <tbody>{pedidos.map(o => <tr key={o.id} className="h-16"><td>{o.cliente}</td><td>${o.total}</td><td>{o.estado}</td></tr>)}</tbody>
             </table>
           </div>
        )}

        {view === 'metrics' && (
           <div className="h-80 md:h-96 bg-[#35382d] p-4 md:p-8 rounded-2xl border border-[#454a3b]">
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