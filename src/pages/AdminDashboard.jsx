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
    try {
      const { data, error } = await supabase.from('productos').select('*');
      if (error) throw error;
      setProductos(data || []);
    } catch (error) {
      console.error("Error al cargar productos:", error.message);
    }
  }

  async function handleFileUpload(file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
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
      const name = formData.get('name');
      const price = parseFloat(formData.get('price'));
      const description = formData.get('description');

      // Validaciones robustas
      if (!name || name.length < 3) throw new Error("Nombre muy corto.");
      if (isNaN(price) || price <= 0) throw new Error("El precio debe ser positivo.");
      if (description.length < 10) throw new Error("Descripción debe tener al menos 10 caracteres.");

      let imageUrl = editData?.image_url || "";
      if (file) imageUrl = await handleFileUpload(file);

      const payload = { name, price, description, image_url: imageUrl };

      if (editData) {
        const { error } = await supabase.from('productos').update(payload).eq('id', editData.id);
        if (error) throw error;
        setEditData(null);
      } else {
        const { error } = await supabase.from('productos').insert([payload]);
        if (error) throw error;
      }
      
      e.target.reset();
      setFile(null);
      fetchProductos();
      alert("Operación exitosa");
    } catch (err) {
      alert("Error: " + err.message);
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("¿Eliminar producto permanentemente?")) return;
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchProductos();
  }

  return (
    <div className="min-h-screen bg-[#060a06] text-emerald-50 p-6 md:p-12 font-sans">
      <header className="max-w-6xl mx-auto mb-12 flex justify-between items-center border-b border-emerald-900 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-emerald-400">Rincón Argentino</h1>
          <p className="text-emerald-700 text-sm">Administración central de productos</p>
        </div>
        <button onClick={() => { supabase.auth.signOut(); navigate('/login'); }} className="text-xs bg-emerald-950 px-4 py-2 rounded border border-emerald-800 hover:text-emerald-400">CERRAR SESIÓN</button>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="bg-[#0b120b] border border-emerald-800 p-8 rounded-2xl h-fit">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-emerald-400 font-semibold mb-4 uppercase text-sm tracking-widest">{editData ? "Editar Producto" : "Nuevo Producto"}</h2>
            <input name="name" defaultValue={editData?.name} placeholder="Nombre del producto" className="w-full bg-emerald-950 border border-emerald-800 p-3 rounded-lg text-sm outline-none focus:border-emerald-500" required />
            <input name="price" type="number" step="0.01" defaultValue={editData?.price} placeholder="Precio ($)" className="w-full bg-emerald-950 border border-emerald-800 p-3 rounded-lg text-sm outline-none focus:border-emerald-500" required />
            <input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full text-xs text-emerald-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-900 file:text-emerald-100" />
            <textarea name="description" defaultValue={editData?.description} placeholder="Descripción detallada..." className="w-full bg-emerald-950 border border-emerald-800 p-3 rounded-lg text-sm h-32 outline-none focus:border-emerald-500" required />
            <button disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition">{loading ? "PROCESANDO..." : "GUARDAR CAMBIOS"}</button>
          </form>
        </section>

        <section className="lg:col-span-2 space-y-4">
          {productos.map((p) => (
            <div key={p.id} className="bg-[#0b120b] border border-emerald-900 p-5 rounded-xl flex items-center gap-6 hover:border-emerald-700 transition">
              {p.image_url && <img src={p.image_url} className="w-20 h-20 object-cover rounded-lg border border-emerald-800" />}
              <div className="flex-grow">
                <h3 className="text-emerald-100 font-medium">{p.name}</h3>
                <p className="text-emerald-700 text-xs mt-1">{p.description}</p>
                <p className="text-emerald-500 font-mono text-sm mt-2 font-bold">${p.price}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => setEditData(p)} className="text-[10px] bg-emerald-900 px-3 py-1 rounded text-emerald-300">EDITAR</button>
                <button onClick={() => handleDelete(p.id)} className="text-[10px] text-red-400 hover:text-red-300">BORRAR</button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}