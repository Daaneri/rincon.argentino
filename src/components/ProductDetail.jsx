import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useCart } from '../context/CartContext';
import { MessageCircle, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [agregarCaja, setAgregarCaja] = useState(false);
  const [cajaPresentacion, setCajaPresentacion] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase.from('productos').select('*').eq('id', id).single();
      if (!error) {
        setProduct(data);
        setSelectedImage(data.image_url);
      }
    }
    async function fetchCaja() {
      const { data } = await supabase
        .from('productos')
        .select('*')
        .ilike('name', '%Caja de Presentación%')
        .limit(1)
        .maybeSingle();
      if (data) setCajaPresentacion(data);
    }
    fetchProduct();
    fetchCaja();
  }, [id]);

  if (!product) return (
    <div className="flex items-center justify-center min-h-[60vh] font-serif text-lg sm:text-2xl text-[#E6DCC8]/50 animate-pulse px-6 text-center">
      Cargando belleza...
    </div>
  );

  const whatsappMessage = `Hola! Me interesa saber más sobre el producto: ${product.name}`;
  const whatsappUrl = `https://wa.me/5491133962727?text=${encodeURIComponent(whatsappMessage)}`;

  function handleAgregarCarrito() {
    addToCart(product);
    if (agregarCaja && cajaPresentacion) addToCart(cajaPresentacion);
  }

  const extraImages = Array.isArray(product.image_urls) ? product.image_urls : [];
  const gallery = [product.image_url, ...extraImages].filter((url, i, arr) => url && arr.indexOf(url) === i);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-12 animate-in fade-in duration-700">
      <Link to="/" className="inline-flex items-center gap-2 text-[#E6DCC8]/60 hover:text-[#E6DCC8] transition-colors mb-6 sm:mb-8 text-xs sm:text-sm uppercase tracking-widest">
        <ArrowLeft size={16} /> Volver a la selección
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 md:gap-16 items-start bg-[#252820]/50 backdrop-blur-xl p-5 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl border border-[#E6DCC8]/10 shadow-2xl">

        <div className="space-y-3 sm:space-y-4">
          <div className="bg-[#E6DCC8]/5 p-2 rounded-2xl sm:rounded-3xl border border-[#E6DCC8]/10 shadow-inner">
            <img src={selectedImage || product.image_url} alt={product.name} className="w-full rounded-xl sm:rounded-2xl aspect-square object-cover transition-transform duration-700 hover:scale-[1.02]" />
          </div>

          {gallery.length > 1 && (
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1">
              {gallery.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(url)}
                  className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === url
                      ? 'border-[#E6DCC8]'
                      : 'border-[#E6DCC8]/15 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 sm:gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#E6DCC8] mb-3 sm:mb-4 break-words">{product.name}</h1>
            <p className="text-xl sm:text-2xl md:text-3xl font-light text-[#E6DCC8]/80 tracking-tight mb-3 sm:mb-4">${product.price.toLocaleString('es-AR')}</p>

            {cajaPresentacion && (
              <label className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-[#E6DCC8]/70 cursor-pointer w-fit">
                <input
                  type="checkbox"
                  checked={agregarCaja}
                  onChange={(e) => setAgregarCaja(e.target.checked)}
                  className="w-4 h-4 accent-[#E6DCC8] cursor-pointer"
                />
                Agregar {cajaPresentacion.name} + ${Number(cajaPresentacion.price).toLocaleString('es-AR')}
              </label>
            )}
          </div>

          <div className="border-y border-[#E6DCC8]/10 py-6 sm:py-8">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#E6DCC8]/50 mb-3 sm:mb-4 font-bold">Sobre esta pieza</h4>
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-[#E6DCC8]/70 font-light">
              {product.description || "Cada pieza de Rincón Argentinoo es única, seleccionada con cuidado y hecha para durar. Si tienes dudas sobre los materiales o procesos, no dudes en consultarnos."}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4">
            <button
              onClick={handleAgregarCarrito}
              className="group flex items-center justify-center gap-2 sm:gap-3 bg-[#E6DCC8] text-[#2D3025] text-sm sm:text-base md:text-lg py-4 sm:py-5 rounded-xl font-bold hover:bg-white transition-all shadow-[0_10px_30px_rgba(230,220,200,0.15)] active:scale-[0.98]"
            >
              <ShoppingCart size={18} className="group-hover:-translate-y-1 transition-transform shrink-0" />
              AGREGAR AL CARRITO
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 sm:gap-3 border border-[#E6DCC8]/20 text-[#E6DCC8] text-sm sm:text-base md:text-lg py-4 sm:py-5 rounded-xl font-bold hover:bg-[#E6DCC8]/10 transition-all active:scale-[0.98]"
            >
              <MessageCircle size={18} className="shrink-0" />
              CONSULTAR POR WHATSAPP
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}