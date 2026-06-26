import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Search } from 'lucide-react'

// Categorías definidas de forma estática
const CATEGORIES = ['Todos', 'Mates', 'Yerbas', 'Bombillas', 'Accesorios'];

export default function ProductGrid() {
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('default')
  const [selectedCategory, setSelectedCategory] = useState('Todos')

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from('productos').select('*')
      if (error) console.error("Error al traer productos:", error)
      else setProducts(data)
    }
    fetchProducts()
  }, [])

  // Lógica de filtrado (Categoría + Búsqueda) y Ordenamiento
  const filteredProducts = products
    .filter(p => {
      const productCat = (p.category || 'Otros').toLowerCase();
      const matchesCategory = selectedCategory === 'Todos' || productCat === selectedCategory.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });

  return (
    <div className="p-4 space-y-8">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm transition-all border ${
                selectedCategory === cat 
                ? 'bg-rincon-cream text-rincon-olive font-bold border-transparent' 
                : 'bg-rincon-olive/30 text-rincon-cream border-rincon-cream/10 hover:bg-rincon-olive/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4 bg-rincon-olive/20 p-4 rounded-2xl border border-rincon-cream/10 backdrop-blur-md">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Buscar artesanías..." 
              className="w-full bg-rincon-cream/5 border border-rincon-cream/20 text-rincon-cream p-3 pl-10 rounded-xl outline-none focus:border-rincon-cream/50 transition-colors"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-3.5 text-rincon-cream/50" size={18} />
          </div>

          <select 
            className="bg-rincon-olive border border-rincon-cream/20 text-rincon-cream p-3 rounded-xl outline-none cursor-pointer hover:bg-rincon-olive/80 transition-colors"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Más destacados</option>
            <option value="price-low">Precio: más barato</option>
            <option value="price-high">Precio: más caro</option>
          </select>
        </div>
      </div>

      {/* Grid de Productos con manejo de estado vacío */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-7xl mx-auto">
           {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="group bg-rincon-olive/40 backdrop-blur-md p-4 rounded-3xl border border-rincon-cream/10 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:bg-rincon-olive/60"
            >
              <div className="aspect-[4/3] bg-rincon-cream/10 rounded-2xl mb-5 overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                  ) : (
                    <div className="flex items-center justify-center h-full text-rincon-cream/20 uppercase tracking-widest text-sm">Sin imagen</div>
                  )}
              </div>
              
              <div className="px-2 pb-2">
                 <h3 className="text-lg font-serif font-bold text-rincon-cream mb-1 truncate">{product.name}</h3>
                  <p className="text-lg font-medium text-rincon-cream/80 mb-6">${product.price.toLocaleString('es-AR')}</p>
                  <Link to={`/producto/${product.id}`} className="block">
                  <button className="w-full border border-rincon-cream/20 py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest text-rincon-cream hover:bg-rincon-cream hover:text-rincon-olive transition-all duration-300">
                      Ver detalle
                  </button>
                  </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-rincon-cream/50 italic">
            No encontramos piezas con ese nombre o categoría. ¡Intentá con otra búsqueda!
          </div>
        )}
      </div>
    </div>
  )
}