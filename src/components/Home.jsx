import ProductGrid from './ProductGrid';

export default function Home() {
  return (
    <>
      <section className="py-20 md:py-32 px-6 text-center">
        <h1 className="text-6xl md:text-8xl font-serif font-light text-rincon-cream tracking-tight mb-6">
          RINCÓN ARGENTINO
        </h1>
        <p className="text-xl md:text-2xl text-rincon-cream/70 font-light tracking-widest uppercase">
          Artesanías auténticas con alma.
        </p>
      </section>

      <section className="max-w-7xl mx-auto py-12 px-6">
        <h2 className="text-3xl font-serif font-bold text-rincon-cream mb-10 text-center">
          Nuestra Selección
        </h2>
        <ProductGrid />
      </section>
    </>
  );
}