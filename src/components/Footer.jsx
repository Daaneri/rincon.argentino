export default function Footer() {
  return (
    <footer className="mt-12 sm:mt-20 py-10 sm:py-16 bg-[#252820] border-t border-[#E6DCC8]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 text-center md:text-left">

        <div className="flex flex-col gap-2 items-center md:items-start">
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#E6DCC8]">RINCON.ARGENTINOO</h3>
          <p className="text-sm text-[#E6DCC8]/60 italic">Artesanías con alma.</p>
        </div>

        <div className="flex flex-col gap-3 items-center md:items-start">
          <h4 className="font-bold uppercase tracking-widest text-xs text-[#E6DCC8]/40 mb-1">Contacto</h4>

          <a href="https://wa.me/5491133962727" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center md:justify-start gap-2 text-[#E6DCC8]/70 hover:text-[#E6DCC8] transition text-sm sm:text-base">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span>11 3396 2727</span>
          </a>

          <a href="https://instagram.com/rincon.argentinoo" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center md:justify-start gap-2 text-[#E6DCC8]/70 hover:text-[#E6DCC8] transition text-sm sm:text-base">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            <span>@rincon.argentinoo</span>
          </a>
        </div>

        <div className="flex flex-col gap-2 items-center md:items-end">
          <p className="text-xs sm:text-sm text-[#E6DCC8]/50">© 2026 rincon.argentinoo.</p>
          <p className="text-[10px] sm:text-xs text-[#E6DCC8]/30 mt-1">
            Hecho por <a href="https://www.instagram.com/desarrollando.andoo/" target="_blank" rel="noopener noreferrer" className="hover:text-[#E6DCC8] underline transition-colors">Desarrollando.andoo</a>
          </p>
        </div>

      </div>
    </footer>
  );
}