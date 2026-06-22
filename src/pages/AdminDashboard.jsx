{activeTab === 'inventory' && (
  <div>
    {/* Formulario para agregar nuevos productos con imagen */}
    <div className="mb-8 p-6 bg-[#E6DCC8]/5 rounded-2xl border border-[#E6DCC8]/10 grid grid-cols-1 md:grid-cols-2 gap-4">
      <input id="new-name" placeholder="Nombre" className="p-3 bg-[#2D3025] border border-[#E6DCC8]/20 rounded-xl" />
      <input id="new-price" type="number" placeholder="Precio" className="p-3 bg-[#2D3025] border border-[#E6DCC8]/20 rounded-xl" />
      <input id="new-stock" type="number" placeholder="Stock" className="p-3 bg-[#2D3025] border border-[#E6DCC8]/20 rounded-xl" />
      <input id="new-image" placeholder="URL de la imagen" className="p-3 bg-[#2D3025] border border-[#E6DCC8]/20 rounded-xl" />
      <button onClick={async () => {
        const name = document.getElementById('new-name').value;
        const price = document.getElementById('new-price').value;
        const stock = document.getElementById('new-stock').value;
        const image_url = document.getElementById('new-image').value;
        await supabase.from('productos').insert([{ name, price, stock, image_url }]);
        fetchProductos();
      }} className="bg-[#E6DCC8] text-[#2D3025] px-6 py-2 rounded-xl font-bold md:col-span-2">
        Agregar Producto
      </button>
    </div>

    {/* Buscador */}
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
                <td className="p-4"><input defaultValue={p.image_url} onChange={(e) => setEditData({...editData, image_url: e.target.value})} className="bg-[#2D3025] p-2 rounded w-full mb-2" placeholder="URL imagen" />
                  <button onClick={() => handleUpdate(p.id)} className="text-[#25D366] font-bold">Guardar</button></td>
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