import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [productos, setProductos] = useState([]);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    fetchProductos();
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) navigate('/login');
  }

  async function fetchProductos() {
    const { data } = await supabase.from('productos').select('*');
    setProductos(data || []);
  }

  async function handleFileUpload(file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage.from('productos').upload(fileName, file);
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('productos').getPublicUrl(fileName);
    return urlData.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData(e.target);
      const name = formData.get('name').trim();
      const price = parseFloat(formData.get('price'));
      const description = formData.get('description').trim();

      // Validaciones
      if (isNaN(price) || price <= 0) throw new Error("Precio inválido");
      if (name.length < 3 || description.length < 10) throw new Error("Datos demasiado cortos");

      let imageUrl = editData?.image_url || "";
      if (file) imageUrl = await handleFileUpload(file);

      const payload = { name, price, description, image_url: imageUrl };

      if (editData) {
        await supabase.from('productos').update(payload).eq('id', editData.id);
        setEditData(null);
      } else {
        await supabase.from('productos').insert([payload]);
      }
      
      e.target.reset();
      setFile(null);
      fetchProductos();
    } catch (err) {
      alert("Error: " + err.message);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans p-6 md:p-12">
      <header className="max-w-6xl mx-auto mb-16 border-b border-zinc-900 pb-8 flex justify-between items-center">
        <h1 className="text-2xl font-light text-white">Panel de Gestión</h1>
        <button onClick={() => { supabase.auth.signOut(); navigate('/login'); }} className="text-xs text-zinc-600 hover:text-white">SALIR</button>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        <section className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-[#0c0c0c] border border-zinc-800 p-8 rounded-xl space-y-4">
            <h2 className="text-white text-xs font-bold uppercase">{editData ? "Editar" : "Nuevo Producto"}</h2>
            
            {/* Input de Imagen (Galería/Arrastrar) */}
            <input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:bg-zinc-800 file:border-0 file:text-white file:rounded" />
            
            <input name="name" defaultValue={editData?.name} placeholder="Nombre" className="w-full bg-transparent border-b border-zinc-700 py-2 text-sm outline-none focus:border-white" required />
            <input name="price" type="number" step="0.01" defaultValue={editData?.price} placeholder="Precio" className="w-full bg-transparent border-b border-zinc-700 py-2 text-sm outline-none focus:border-white" required />
            <textarea name="description" defaultValue={editData?.description} placeholder="Descripción" className="w-full bg-transparent border-b border-zinc-700 py-2 text-sm outline-none h-24" required />
            
            <button disabled={loading} className="w-full bg-white text-black font-bold py-3 rounded text-xs">
              {loading ? "PROCESANDO..." : "GUARDAR PRODUCTO"}
            </button>
          </form>
        </section>

        <section className="lg:col-span-2 space-y-4">
          {productos.map((p) => (
            <div key={p.id} className="bg-[#0c0c0c] border border-zinc-800 p-4 rounded-xl flex items-center gap-4">
              {p.image_url && <img src={p.image_url} className="w-16 h-16 object-cover rounded" />}
              <div className="flex-grow">
                <h3 className="text-white text-sm font-medium">{p.name}</h3>
                <p className="text-xs text-zinc-500 truncate">{p.description}</p>
                <p className="text-xs text-zinc-400 font-mono">${p.price}</p>
              </div>
              <button onClick={() => setEditData(p)} className="text-[10px] text-zinc-500 hover:text-white">EDITAR</button>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}