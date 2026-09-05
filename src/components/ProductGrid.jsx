import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Search, ImageOff } from 'lucide-react'

const CATEGORIES = ['Todos', 'Mates', 'Yerbas', 'Bombillas', 'Accesorios'];
const GOLD = "#C9A227";

function ProductCard({ product, priority = false }) {
  const sinStock = (product.stock ?? 0) === 0;

  return (
    <div className="group bg-rincon-olive/40 backdrop-blur-md rounded-2xl md:rounded-3xl border border-rincon-cream/10 hover:border-[#C9A227]/40 shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col relative overflow-hidden">
      <div className="aspect-[4/5] bg-rincon-cream/10 overflow-hidden relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding={priority ? "sync" : "async"}
            className="w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:scale-105 group-hover:transition-transform group-hover:duration-700"
            onLoad={(e) => e.currentTarget.classList.remove('opacity-0')}
          />
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

        {/* Botón que aparece solo al pasar el mouse, no ocupa espacio fijo */}
        <Link
          to={`/producto/${product.id}`}
          className={`absolute inset-x-0 bottom-0 py-2.5 md:py-3 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest transition-transform duration-300 translate-y-0 md:translate-y-full md:group-hover:translate-y-0 ${
            sinStock ? 'bg-rincon-olive/90 text-rincon-cream/30 pointer-events-none' : 'bg-[#C9A227] text-rincon-olive'
          }`}
        >
          {sinStock ? 'Sin stock' : 'Ver detalle'}
        </Link>
      </div>

      <div className="p-3 sm:p-4 md:p-5">
        <h3 className="text-xs sm:text-sm md:text-lg font-serif font-bold text-rincon-cream mb-1 truncate">{product.name}</h3>
        <p className="text-xs sm:text-sm md:text-base font-semibold" style={{ color: GOLD }}>
          ${product.price.toLocaleString('es-AR')}
        </p>
      </div>
    </div>
  );
}

// Cuántas imágenes cargar con prioridad alta (las que se ven sin scrollear)
const PRIORITY_COUNT = 4;

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
  const yerbas = filteredProducts.filter(p => p.category === 'Yerbas');
  const otros = filteredProducts.filter(p => p.category !== 'Mates' && p.category !== 'Yerbas');

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
                  ? 'font-bold border-transparent text-rincon-olive'
                  : 'bg-rincon-olive/30 text-rincon-cream border-rincon-cream/10 hover:bg-rincon-olive/50'
              }`}
              style={selectedCategory === cat ? { backgroundColor: GOLD } : undefined}
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
              className="w-full bg-rincon-cream/5 border border-rincon-cream/20 text-rincon-cream p-3 pl-10 rounded-xl outline-none focus:border-[#C9A227]/50 transition-colors text-sm sm:text-base"
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
                  <div className="max-w-7xl mx-auto flex items-center gap-4 mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-rincon-cream shrink-0">Nuestros Mates</h2>
                    <div className="h-px flex-1 bg-rincon-cream/10" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-8 max-w-7xl mx-auto">
                    {mates.map((p, i) => <ProductCard key={p.id} product={p} priority={i < PRIORITY_COUNT} />)}
                  </div>
                </section>
              )}
              {yerbas.length > 0 && (
                <section>
                  <div className="max-w-7xl mx-auto flex items-center gap-4 mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-rincon-cream shrink-0">Nuestras Yerbas</h2>
                    <div className="h-px flex-1 bg-rincon-cream/10" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-8 max-w-7xl mx-auto">
                    {yerbas.map(p => <ProductCard key={p.id} product={p} />)}
                  </div>
                </section>
              )}
              {otros.length > 0 && (
                <section>
                  <div className="max-w-7xl mx-auto flex items-center gap-4 mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-rincon-cream shrink-0">Otros Productos</h2>
                    <div className="h-px flex-1 bg-rincon-cream/10" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-8 max-w-7xl mx-auto">
                    {otros.map(p => <ProductCard key={p.id} product={p} />)}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-8 max-w-7xl mx-auto">
              {filteredProducts.map((p, i) => <ProductCard key={p.id} product={p} priority={i < PRIORITY_COUNT} />)}
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