import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Search, ImageOff } from 'lucide-react'

const CATEGORIES = ['Todos', 'Mates', 'Bombillas', 'Accesorios'];

function ProductCard({ product }) {
  const sinStock = (product.stock ?? 0) === 0;

  return (
    <div className="group bg-rincon-olive/40 backdrop-blur-md p-3 sm:p-4 md:p-6 rounded-2xl md:rounded-3xl border border-rincon-cream/10 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:bg-rincon-olive/60 flex flex-col relative">
      <div className="aspect-[4/5] bg-rincon-cream/10 rounded-xl md:rounded-2xl mb-3 sm:mb-4 md:mb-6 overflow-hidden relative">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 h-full text-rincon-cream/20">
            <ImageOff size={28} strokeWidth={1.25} />
            <span className="uppercase tracking-widest text-[10px]">Sin imagen</span>
          </div>
        )}
        {sinStock && (
          <span className="absolute top-2 left-2 bg-rincon-olive/90 border border-rincon-cream/20 text-rincon-cream/80 text-[9px] sm:text-[10px] uppercase tracking-widest px-2 sm:px-3 py-1 rounded-full">
            Sin stock
          </span>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xs sm:text-sm md:text-xl font-serif font-bold text-rincon-cream mb-1 truncate">{product.name}</h3>
          <p className="text-xs sm:text-sm md:text-lg font-medium text-rincon-cream/80 mb-3 sm:mb-4">${product.price.toLocaleString('es-AR')}</p>
        </div>
        <Link to={`/producto/${product.id}`} className="block">
          <button
            disabled={sinStock}
            className={`w-full border py-2 md:py-4 rounded-xl font-bold text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300 ${
              sinStock
                ? 'border-rincon-cream/10 text-rincon-cream/30 cursor-not-allowed'
                : 'border-rincon-cream/20 text-rincon-cream hover:bg-rincon-cream hover:text-rincon-olive'
            }`}
          >
            {sinStock ? 'Sin stock' : 'Ver detalle'}
          </button>
        </Link>
      </div>
    </div>
  );
}

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

  const filteredProducts = products
    .filter(p => p.archivado !== true)
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

  const mates = filteredProducts.filter(p => p.category === 'Mates');
  const otros = filteredProducts.filter(p => p.category !== 'Mates');

  return (
    <div className="px-4 sm:px-6 space-y-6 sm:space-y-8">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm transition-all border shrink-0 ${
                selectedCategory === cat
                ? 'bg-rincon-cream text-rincon-olive font-bold border-transparent'
                : 'bg-rincon-olive/30 text-rincon-cream border-rincon-cream/10 hover:bg-rincon-olive/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-3 sm:gap-4 bg-rincon-olive/20 p-3 sm:p-4 rounded-2xl border border-rincon-cream/10 backdrop-blur-md">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar artesanías..."
              className="w-full bg-rincon-cream/5 border border-rincon-cream/20 text-rincon-cream p-3 pl-10 rounded-xl outline-none focus:border-rincon-cream/50 transition-colors text-sm sm:text-base"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-3.5 text-rincon-cream/50" size={18} />
          </div>

          <select
            className="w-full md:w-auto bg-rincon-olive border border-rincon-cream/20 text-rincon-cream p-3 rounded-xl outline-none cursor-pointer hover:bg-rincon-olive/80 transition-colors text-sm sm:text-base"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Más destacados</option>
            <option value="price-low">Precio: más barato</option>
            <option value="price-high">Precio: más caro</option>
          </select>
        </div>

        {filteredProducts.length > 0 && (
          <p className="text-xs sm:text-sm text-rincon-cream/40 text-center tracking-wide">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'artesanía encontrada' : 'artesanías encontradas'}
          </p>
        )}
      </div>

      {filteredProducts.length > 0 ? (
        <>
          {selectedCategory === 'Todos' ? (
            <div className="space-y-8 sm:space-y-12">
              {mates.length > 0 && (
                <section>
                  <h2 className="max-w-7xl mx-auto text-xl sm:text-2xl font-serif font-bold text-rincon-cream mb-4 sm:mb-6">Nuestros Mates</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-8 max-w-7xl mx-auto">
                    {mates.map(p => <ProductCard key={p.id} product={p} />)}
                  </div>
                </section>
              )}
              {otros.length > 0 && (
                <section>
                  <h2 className="max-w-7xl mx-auto text-xl sm:text-2xl font-serif font-bold text-rincon-cream mb-4 sm:mb-6">Otros Productos</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-8 max-w-7xl mx-auto">
                    {otros.map(p => <ProductCard key={p.id} product={p} />)}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-8 max-w-7xl mx-auto">
              {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </>
      ) : (
        <div className="py-16 sm:py-20 text-center text-rincon-cream/50 italic text-sm sm:text-base px-4">
          No encontramos piezas con ese nombre o categoría.
        </div>
      )}
    </div>
  )
}