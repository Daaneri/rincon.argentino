export default function About() {
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-20 text-center">
      <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#E6DCC8] mb-8">Nuestra Historia</h1>
      
      <div className="bg-[#252820] p-8 md:p-12 rounded-3xl border border-[#E6DCC8]/10 shadow-2xl">
        <p className="text-xl leading-relaxed text-[#E6DCC8]/80 font-light mb-8">
          En <strong>Rincón Argentinoo</strong>, creemos que cada objeto tiene una historia para contar. 
          Nuestra misión es rescatar la tradición y el alma de las artesanías de nuestra tierra, 
          acercando piezas únicas a quienes valoran el trabajo hecho a mano.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mt-12 border-t border-[#E6DCC8]/10 pt-12">
          <div>
            <h3 className="text-[#E6DCC8] font-bold uppercase tracking-widest mb-4">Calidad Noble</h3>
            <p className="text-[#E6DCC8]/60 italic">Trabajamos con materiales seleccionados, respetando procesos ancestrales para asegurar la durabilidad y belleza de cada pieza.</p>
          </div>
          <div>
            <h3 className="text-[#E6DCC8] font-bold uppercase tracking-widest mb-4">Hecho con Alma</h3>
            <p className="text-[#E6DCC8]/60 italic">No vendemos productos masivos; cada artesanía es seleccionada o creada pensando en su propósito y en su conexión con nuestra cultura.</p>
          </div>
        </div>
      </div>
    </div>
  );
}