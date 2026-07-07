import ProductGrid from './ProductGrid';
 
export default function Home() {
  return (
    <>
      <section className="py-20 md:py-32 px-6 text-center">
        <h1 className="text-6xl md:text-8xl font-serif font-light text-rincon-cream tracking-tight mb-6">
          RINCÓN ARGENTINOO
        </h1>
        <p className="text-xl md:text-2xl text-rincon-cream/70 font-light tracking-widest uppercase mb-10">
          Artesanías auténticas con alma.
        </p>
        <a
          href="#seleccion"
          className="inline-block border border-rincon-cream/40 text-rincon-cream px-10 py-3 rounded-full text-sm tracking-widest uppercase hover:bg-rincon-cream hover:text-[#2D3025] transition-colors duration-300"
        >
          Ver Catálogo
        </a>
      </section>
 
      <section className="border-y border-rincon-cream/10">
        <div className="max-w-5xl mx-auto py-8 px-6 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <svg className="w-5 h-5 text-rincon-cream/70 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25h5.234a1.125 1.125 0 011.125 1.125v4.5" />
            </svg>
            <span className="text-xs sm:text-sm tracking-wide text-rincon-cream/70 uppercase">Envíos a todo el país</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <svg className="w-5 h-5 text-rincon-cream/70 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5h-15a1.5 1.5 0 00-1.5 1.5v10.5a1.5 1.5 0 001.5 1.5z" />
            </svg>
            <span className="text-xs sm:text-sm tracking-wide text-rincon-cream/70 uppercase">Pago seguro</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <svg className="w-5 h-5 text-rincon-cream/70 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <span className="text-xs sm:text-sm tracking-wide text-rincon-cream/70 uppercase">Hecho a mano</span>
          </div>
        </div>
      </section>
 
      <section id="seleccion" className="max-w-7xl mx-auto py-12 px-6">
        <h2 className="text-3xl font-serif font-bold text-rincon-cream mb-10 text-center">
          Nuestra Selección
        </h2>
        <ProductGrid />
      </section>
    </>
  );
}