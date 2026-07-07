import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [view, setView] = useState('Inventario');
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: '', price: '', stock: 0, description: '', image_url: '', image_urls: [] });
  const [storageFiles, setStorageFiles] = useState([]);
  const [loadingStorage, setLoadingStorage] = useState(false);
  const [pickerMode, setPickerMode] = useState(null); // null | 'main' | 'extra'
  const navigate = useNavigate();

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/login');
      }
    }
    checkSession();
  }, []);

  useEffect(() => { fetchData(); }, []);

  const mostrarMensaje = (texto) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(''), 3000);
  };

  async function fetchData() {
    const { data: p } = await supabase.from('productos').select('*');
    const { data: o } = await supabase.from('orders').select('*').order('creado_en', { ascending: false });
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
    const description = formData.get('description');

    let imageUrl = '';
    if (file) {
      const { data } = await supabase.storage.from('productos').upload(`${Date.now()}_${file.name}`, file);
      if (data) imageUrl = supabase.storage.from('productos').getPublicUrl(data.path).data.publicUrl;
    }

    const { error } = await supabase.from('productos').insert([{ name, price, stock, category, image_url: imageUrl, description }]);
    if (error) mostrarMensaje("Error: " + error.message);
    else {
      mostrarMensaje("Producto agregado con éxito");
      setFile(null);
      e.target.reset();
      fetchData();
    }
    setLoading(false);
  }

  async function fetchStorageFiles() {
    setLoadingStorage(true);
    const { data, error } = await supabase.storage.from('productos').list('', { limit: 200, sortBy: { column: 'name', order: 'desc' } });
    if (!error && data) {
      const archivos = data
        .filter(f => f.name && !f.name.endsWith('/'))
        .map(f => ({
          name: f.name,
          url: supabase.storage.from('productos').getPublicUrl(f.name).data.publicUrl,
        }));
      setStorageFiles(archivos);
    }
    setLoadingStorage(false);
  }

  function abrirPicker(modo) {
    setPickerMode(modo);
    if (storageFiles.length === 0) fetchStorageFiles();
  }

  function elegirImagen(url) {
    if (pickerMode === 'main') {
      setEditData({ ...editData, image_url: url });
      setPickerMode(null);
    } else if (pickerMode === 'extra') {
      const yaEsta = editData.image_urls.includes(url);
      setEditData({
        ...editData,
        image_urls: yaEsta
          ? editData.image_urls.filter(u => u !== url)
          : [...editData.image_urls, url],
      });
    }
  }

  function quitarImagenExtra(url) {
    setEditData({ ...editData, image_urls: editData.image_urls.filter(u => u !== url) });
  }

  async function handleUpdate(product) {
    const idNumerico = parseInt(product.id, 10);
    const { error } = await supabase.from('productos')
      .update({
        name: editData.name,
        price: editData.price.toString(),
        stock: parseInt(editData.stock),
        description: editData.description,
        category: product.category,
        image_url: editData.image_url,
        image_urls: editData.image_urls,
      })
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

  async function handleUpdateOrderStatus(identificador, nuevoEstado) {
    const { error } = await supabase.from('orders').update({ estado: nuevoEstado }).eq('identificador', identificador);
    if (error) mostrarMensaje("Error al actualizar pedido: " + error.message);
    else {
      mostrarMensaje("Pedido actualizado");
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

  const estadoColor = (estado) => {
    if (estado === 'pagado') return 'bg-green-900/40 text-green-300 border-green-700/40';
    if (estado === 'pendiente') return 'bg-yellow-900/40 text-yellow-300 border-yellow-700/40';
    if (estado === 'fallido') return 'bg-red-900/40 text-red-300 border-red-700/40';
    return 'bg-[#2D3025] text-[#EAE6D6] border-[#454a3b]';
  };

  const stockColor = (stock) => {
    if (stock === 0) return 'bg-red-900/40 text-red-300 border-red-700/40';
    if (stock < 5) return 'bg-yellow-900/40 text-yellow-300 border-yellow-700/40';
    return 'bg-green-900/40 text-green-300 border-green-700/40';
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#2D3025] text-[#EAE6D6] font-serif">
      <aside className="w-full md:w-64 md:min-h-screen border-b md:border-b-0 md:border-r border-[#3d4234] p-4 md:p-6 flex flex-col shrink-0">
        <h1 className="text-xl md:text-2xl mb-4 md:mb-12 italic">Rincón Admin</h1>
        <nav className="flex md:flex-col gap-3 md:gap-0 md:space-y-6 flex-grow overflow-x-auto pb-2">
          {['Inventario', 'Pedidos', 'Métricas'].map(item => (
            <button key={item} onClick={() => setView(item)} className={`transition whitespace-nowrap text-sm md:text-base ${view === item ? 'text-white font-bold' : 'text-[#8c9284] hover:text-white'}`}>
              {item}
            </button>
          ))}
        </nav>
        <button onClick={handleSignOut} className="text-red-400 hover:text-red-300 italic text-left mt-4 md:mt-auto text-sm md:text-base">Cerrar sesión</button>
      </aside>

      <main className="flex-1 p-4 sm:p-6 md:p-16 min-w-0">
        {mensaje && <div className="bg-green-700 text-white p-3 rounded-xl mb-4 text-center animate-pulse text-sm">{mensaje}</div>}

        {view === 'Inventario' && (
          <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
            <form onSubmit={handleAddProduct} className="max-w-4xl mx-auto bg-[#35382d] p-5 md:p-8 rounded-2xl border border-[#454a3b] space-y-3 md:space-y-4">
              <h3 className="text-lg md:text-xl mb-2 md:mb-4">Nuevo Producto</h3>
              <input name="name" placeholder="Nombre" className="w-full bg-[#2D3025] p-3 rounded-full border border-[#454a3b] px-6 text-sm md:text-base" required />
              <input name="price" type="number" step="any" placeholder="Precio" className="w-full bg-[#2D3025] p-3 rounded-full border border-[#454a3b] px-6 text-sm md:text-base" required />
              <input name="stock" type="number" placeholder="Stock" className="w-full bg-[#2D3025] p-3 rounded-full border border-[#454a3b] px-6 text-sm md:text-base" required />
              <textarea name="description" placeholder="Descripción del producto" rows={3} className="w-full bg-[#2D3025] p-3 rounded-2xl border border-[#454a3b] px-6 text-sm md:text-base resize-none" />
              <select name="category" className="w-full bg-[#2D3025] p-3 rounded-full border border-[#454a3b] px-6 text-sm md:text-base">
                <option value="Mates">Mates</option><option value="Yerbas">Yerbas</option><option value="Bombillas">Bombillas</option><option value="Accesorios">Accesorios</option>
              </select>
              <div className="flex flex-col items-center gap-2">
                <input type="file" id="fileInput" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
                <label htmlFor="fileInput" className="cursor-pointer bg-[#454a3b] px-6 py-2 rounded-full border border-[#8c9284] hover:bg-[#5a614d] transition text-xs md:text-sm text-center break-all">
                  {file ? file.name : "Seleccionar Imagen"}
                </label>
              </div>
              <button disabled={loading} className="bg-[#EAE6D6] text-[#2D3025] w-full px-8 py-2 rounded-full font-bold text-sm md:text-base">GUARDAR</button>
            </form>

            <input type="text" placeholder="🔍 Buscar producto..." className="max-w-4xl mx-auto block w-full bg-[#35382d] p-3 rounded-full border border-[#454a3b] px-6 mb-2 text-sm md:text-base" onChange={(e) => setBusqueda(e.target.value)} />

            <div className="max-w-4xl mx-auto flex gap-2 mb-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-auto md:px-0">
              {['Todos', 'Mates', 'Yerbas', 'Bombillas', 'Accesorios'].map(cat => (
                <button key={cat} onClick={() => setCategoriaFiltro(cat)} className={`px-5 md:px-6 py-1 rounded-full text-xs md:text-sm whitespace-nowrap shrink-0 ${categoriaFiltro === cat ? 'bg-[#EAE6D6] text-[#2D3025]' : 'bg-[#35382d] text-[#8c9284]'}`}>{cat}</button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {productosFiltrados.map(p => (
                <div key={p.id} className="bg-[#35382d] p-4 md:p-5 rounded-2xl border border-[#454a3b] space-y-3 flex flex-col">
                  {editId === p.id ? (
                    <div className="space-y-2">
                      <input className="w-full bg-[#2D3025] p-2 rounded-full border border-[#454a3b] text-sm px-4" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} placeholder="Nombre" />
                      <textarea className="w-full bg-[#2D3025] p-2 rounded-2xl border border-[#454a3b] text-sm px-4 resize-none" rows={2} value={editData.description} onChange={(e) => setEditData({...editData, description: e.target.value})} placeholder="Descripción" />

                      <div className="space-y-2 bg-[#2D3025] p-3 rounded-xl border border-[#454a3b]">
                        <p className="text-xs text-[#8c9284] font-bold uppercase tracking-wide">Foto principal</p>
                        <div className="flex items-center gap-3">
                          {editData.image_url ? (
                            <img src={editData.image_url} alt="Principal" className="w-14 h-14 rounded-lg object-cover border border-[#454a3b]" />
                          ) : (
                            <div className="w-14 h-14 rounded-lg bg-[#35382d] border border-[#454a3b] flex items-center justify-center text-[9px] text-[#8c9284] text-center">Sin foto</div>
                          )}
                          <button type="button" onClick={() => abrirPicker('main')} className="text-xs bg-[#454a3b] px-3 py-2 rounded-full border border-[#8c9284] hover:bg-[#5a614d] transition">
                            Elegir del storage
                          </button>
                        </div>

                        <p className="text-xs text-[#8c9284] font-bold uppercase tracking-wide pt-2">Fotos adicionales</p>
                        <div className="flex flex-wrap gap-2">
                          {editData.image_urls.map(url => (
                            <div key={url} className="relative">
                              <img src={url} alt="Extra" className="w-12 h-12 rounded-lg object-cover border border-[#454a3b]" />
                              <button type="button" onClick={() => quitarImagenExtra(url)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 text-[9px] leading-none flex items-center justify-center">×</button>
                            </div>
                          ))}
                          <button type="button" onClick={() => abrirPicker('extra')} className="text-xs bg-[#454a3b] px-3 py-2 rounded-full border border-[#8c9284] hover:bg-[#5a614d] transition h-fit self-center">
                            + Agregar fotos
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <input className="bg-[#2D3025] p-2 rounded-full border border-[#454a3b] w-24 text-sm px-4" placeholder="Stock" value={editData.stock} type="number" onChange={(e) => setEditData({...editData, stock: e.target.value})} />
                        <input className="bg-[#2D3025] p-2 rounded-full border border-[#454a3b] w-28 text-sm px-4" placeholder="Precio" value={editData.price} type="number" onChange={(e) => setEditData({...editData, price: e.target.value})} />
                        <button type="button" onClick={() => handleUpdate(p)} className="bg-green-600 text-white px-5 py-2 rounded-full text-xs font-bold">Guardar cambios</button>
                        <button type="button" onClick={() => setEditId(null)} className="text-[#8c9284] px-3 py-2 text-xs">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col gap-3 flex-1">
                        <div className="min-w-0">
                          <p className="font-bold text-base md:text-lg text-[#EAE6D6]">{p.name}</p>
                          {p.description && (
                            <p className="text-xs md:text-sm text-[#8c9284] mt-1 line-clamp-2">{p.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-xs border font-medium ${stockColor(p.stock ?? 0)}`}>
                            Stock: {p.stock ?? 0}
                          </span>
                          <span className="font-bold text-lg md:text-xl text-white tracking-wide">
                            ${p.price}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-1 border-t border-[#454a3b]/60 mt-1">
                        <button onClick={() => { setEditId(p.id); setEditData({ name: p.name, price: p.price, stock: p.stock, description: p.description || '', image_url: p.image_url || '', image_urls: Array.isArray(p.image_urls) ? p.image_urls : [] }); }} className="text-blue-400 font-bold hover:text-blue-300 transition text-xs md:text-sm pt-2">Editar</button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-400 font-bold hover:text-red-300 transition text-xs md:text-sm pt-2">Eliminar</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'Pedidos' && (
          <div className="max-w-4xl mx-auto space-y-4">
            {pedidos.length === 0 && (
              <div className="bg-[#35382d] p-8 rounded-2xl border border-[#454a3b] text-center text-[#8c9284]">
                Todavía no hay pedidos.
              </div>
            )}

            {pedidos.map(o => (
              <div key={o.identificador} className="bg-[#35382d] p-5 md:p-6 rounded-2xl border border-[#454a3b] space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-base md:text-lg text-white">{o.nombre_del_cliente}</p>
                    <p className="text-xs md:text-sm text-[#8c9284]">{o.telefono}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs border shrink-0 ${estadoColor(o.estado)}`}>
                    {o.estado}
                  </span>
                </div>

                <div className="text-xs md:text-sm text-[#8c9284] space-y-0.5">
                  <p>{o.direccion}, {o.ciudad} {o.provincia && `(${o.provincia})`} {o.codigo_postal && `- CP ${o.codigo_postal}`}</p>
                  {o.creado_en && (
                    <p className="text-[#6b7160]">
                      {new Date(o.creado_en).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>

                {Array.isArray(o.productos) && o.productos.length > 0 && (
                  <div className="bg-[#2D3025] rounded-xl p-3 space-y-1">
                    {o.productos.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs md:text-sm text-[#EAE6D6]">
                        <span>{item.quantity}x {item.name}</span>
                        <span>${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#454a3b]">
                  <div className="text-xs md:text-sm text-[#8c9284]">
                    Envío: {o.costo_de_envio > 0 ? `$${Number(o.costo_de_envio).toLocaleString('es-AR')}` : 'Sin costo'}
                  </div>
                  <div className="font-bold text-lg md:text-xl text-white">
                    ${Number(o.total).toLocaleString('es-AR')}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {['pendiente', 'pagado', 'enviado', 'fallido'].map((estado) => (
                    <button
                      key={estado}
                      onClick={() => handleUpdateOrderStatus(o.identificador, estado)}
                      className={`px-3 py-1 rounded-full text-xs border transition ${
                        o.estado === estado
                          ? 'bg-[#EAE6D6] text-[#2D3025] border-[#EAE6D6]'
                          : 'border-[#454a3b] text-[#8c9284] hover:text-white hover:border-[#8c9284]'
                      }`}
                    >
                      {estado}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'Métricas' && (
          <div className="max-w-4xl mx-auto h-72 sm:h-96 bg-[#35382d] p-4 sm:p-6 md:p-8 rounded-2xl border border-[#454a3b]">
            <h3 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">Tendencia de Ventas</h3>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={[...pedidos].reverse()}>
                <CartesianGrid stroke="#454a3b" strokeDasharray="3 3" />
                <XAxis stroke="#8c9284" dataKey="nombre_del_cliente" tick={{ fontSize: 10, fill: '#8c9284' }} interval="preserveStartEnd" />
                <YAxis stroke="#8c9284" tick={{ fontSize: 10, fill: '#8c9284' }} width={40} />
                <Tooltip contentStyle={{ backgroundColor: '#2D3025', borderColor: '#454a3b', borderRadius: '0.75rem', color: '#EAE6D6', fontSize: '0.85rem' }} />
                <Line type="monotone" dataKey="total" stroke="#EAE6D6" strokeWidth={3} dot={{ r: 4, fill: '#EAE6D6' }} activeDot={{ r: 6, fill: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </main>

      {pickerMode && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setPickerMode(null)}>
          <div className="bg-[#2D3025] border border-[#454a3b] rounded-2xl p-4 md:p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">
                {pickerMode === 'main' ? 'Elegir foto principal' : 'Elegir fotos adicionales (podés tocar varias)'}
              </h3>
              <button onClick={() => setPickerMode(null)} className="text-[#8c9284] hover:text-white text-sm">Cerrar ✕</button>
            </div>

            {loadingStorage ? (
              <p className="text-[#8c9284] text-sm text-center py-8">Cargando fotos del storage...</p>
            ) : storageFiles.length === 0 ? (
              <p className="text-[#8c9284] text-sm text-center py-8">No se encontraron archivos en el storage.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 md:gap-3">
                {storageFiles.map(f => {
                  const seleccionada = pickerMode === 'main'
                    ? editData.image_url === f.url
                    : editData.image_urls.includes(f.url);
                  return (
                    <button
                      key={f.name}
                      type="button"
                      onClick={() => elegirImagen(f.url)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition ${seleccionada ? 'border-green-500' : 'border-[#454a3b] hover:border-[#8c9284]'}`}
                    >
                      <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}

            {pickerMode === 'extra' && (
              <div className="pt-4 flex justify-end">
                <button onClick={() => setPickerMode(null)} className="bg-[#EAE6D6] text-[#2D3025] px-6 py-2 rounded-full font-bold text-sm">Listo</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}