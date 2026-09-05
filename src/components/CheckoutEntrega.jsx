import { useState } from "react";
import { useCart } from "../context/CartContext";

const PROVINCIAS = [
  { code: "BA", name: "Buenos Aires" }, { code: "CT", name: "Catamarca" },
  { code: "CH", name: "Chaco" }, { code: "CU", name: "Chubut" },
  { code: "DF", name: "CABA" }, { code: "CB", name: "Córdoba" },
  { code: "CN", name: "Corrientes" }, { code: "ER", name: "Entre Ríos" },
  { code: "FO", name: "Formosa" }, { code: "JY", name: "Jujuy" },
  { code: "LP", name: "La Pampa" }, { code: "LR", name: "La Rioja" },
  { code: "MZ", name: "Mendoza" }, { code: "MN", name: "Misiones" },
  { code: "NQ", name: "Neuquén" }, { code: "RN", name: "Río Negro" },
  { code: "SA", name: "Salta" }, { code: "SJ", name: "San Juan" },
  { code: "SL", name: "San Luis" }, { code: "SC", name: "Santa Cruz" },
  { code: "SF", name: "Santa Fe" }, { code: "SE", name: "Santiago del Estero" },
  { code: "TF", name: "Tierra del Fuego" }, { code: "TU", name: "Tucumán" },
];

const PUNTOS_ENCUENTRO = [
  "Tortugas Open Mall (Tortuguitas)",
  "Puma Energy 197 y Panamericana (El Talar)",
  "Pueyrredón 2679 (Villa Ballester)",
];

const NUMERO_WHATSAPP = "5491133962727";

export default function CheckoutEntrega() {
  const { cart } = useCart();

  const [shippingData, setShippingData] = useState({
    name: "", dni: "", phone: "", email: "", street: "", floor: "", city: "", state: "", postalCode: "",
  });
  const [tipoEntrega, setTipoEntrega] = useState("envio"); // "envio" | "pickup" | "puntoEncuentro"
  const [puntoEncuentro, setPuntoEncuentro] = useState("");

  const totalProductos = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function irAWhatsapp() {
    if (!shippingData.name || !shippingData.dni || !shippingData.phone || !shippingData.email) {
      alert("Completá nombre, DNI, teléfono y correo antes de continuar.");
      return;
    }
    if (tipoEntrega === "envio" && !shippingData.street) {
      alert("Completá la dirección de envío.");
      return;
    }
    if (tipoEntrega === "puntoEncuentro" && !puntoEncuentro) {
      alert("Elegí un punto de encuentro.");
      return;
    }

    const direccionCompleta = shippingData.floor
      ? `${shippingData.street}, ${shippingData.floor}`
      : shippingData.street;

    let mensaje = "¡Hola! Quiero hacer este pedido:%0A%0A";
    cart.forEach((item) => {
      mensaje += `• ${item.quantity}x ${item.name} - $${(item.price * item.quantity).toLocaleString("es-AR")}%0A`;
    });
    mensaje += `%0A*Subtotal: $${totalProductos.toLocaleString("es-AR")}*%0A%0A`;
    mensaje += `*Datos de contacto:*%0A`;
    mensaje += `Nombre: ${shippingData.name}%0A`;
    mensaje += `DNI: ${shippingData.dni}%0A`;
    mensaje += `Teléfono: ${shippingData.phone}%0A`;
    mensaje += `Email: ${shippingData.email}%0A%0A`;

    if (tipoEntrega === "pickup") {
      mensaje += `*Entrega:* Retiro a coordinar`;
    } else if (tipoEntrega === "puntoEncuentro") {
      mensaje += `*Entrega:* Punto de encuentro - ${puntoEncuentro}`;
    } else {
      mensaje += `*Dirección de envío:*%0A`;
      mensaje += `${direccionCompleta}, ${shippingData.city}, ${shippingData.state} (CP ${shippingData.postalCode})%0A`;
      mensaje += `*Costo de envío:* a coordinar`;
    }

    window.location.href = `https://wa.me/${NUMERO_WHATSAPP}?text=${mensaje}`;
  }

  const inputClass =
    "w-full bg-transparent border border-[#E6DCC8]/20 rounded-xl px-4 py-3 text-[#E6DCC8] placeholder:text-[#E6DCC8]/40 focus:outline-none focus:border-[#E6DCC8]/60 transition-colors text-sm sm:text-base";

  return (
    <div className="w-full max-w-6xl mx-auto py-10 sm:py-16 px-4 sm:px-6">
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10 sm:mb-16 text-xs sm:text-sm text-[#E6DCC8]/50">
        <span className="text-[#E6DCC8]">Carrito</span>
        <div className="h-px w-8 sm:w-12 bg-[#E6DCC8]/20" />
        <span className="text-[#E6DCC8] font-semibold">Entrega</span>
        <div className="h-px w-8 sm:w-12 bg-[#E6DCC8]/20" />
        <span>WhatsApp</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
          <div className="bg-[#2D3025]/40 rounded-2xl sm:rounded-3xl border border-[#E6DCC8]/10 p-5 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-serif text-[#E6DCC8] mb-4 sm:mb-6">Datos de contacto</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <input className={inputClass} placeholder="Nombre y apellido" value={shippingData.name} onChange={(e) => setShippingData({ ...shippingData, name: e.target.value })} />
              <input className={inputClass} placeholder="DNI" value={shippingData.dni} onChange={(e) => setShippingData({ ...shippingData, dni: e.target.value })} />
              <input className={inputClass} placeholder="Teléfono de contacto" value={shippingData.phone} onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })} />
              <input className={inputClass} type="email" placeholder="Correo electrónico" value={shippingData.email} onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })} />
            </div>
          </div>

          <div className="bg-[#2D3025]/40 rounded-2xl sm:rounded-3xl border border-[#E6DCC8]/10 p-5 sm:p-8 space-y-3 sm:space-y-4">
            <h2 className="text-xl sm:text-2xl font-serif text-[#E6DCC8] mb-1 sm:mb-2">Entrega</h2>

            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setTipoEntrega("envio")}
                className={`flex-1 rounded-xl px-3 py-3 border text-xs sm:text-sm transition-colors ${tipoEntrega === "envio" ? "bg-[#E6DCC8] text-[#2D3025] border-[#E6DCC8]" : "border-[#E6DCC8]/20 text-[#E6DCC8]"}`}
              >
                Envío
              </button>
              <button
                onClick={() => setTipoEntrega("pickup")}
                className={`flex-1 rounded-xl px-3 py-3 border text-xs sm:text-sm transition-colors ${tipoEntrega === "pickup" ? "bg-[#E6DCC8] text-[#2D3025] border-[#E6DCC8]" : "border-[#E6DCC8]/20 text-[#E6DCC8]"}`}
              >
                Retiro
              </button>
              <button
                onClick={() => setTipoEntrega("puntoEncuentro")}
                className={`flex-1 rounded-xl px-3 py-3 border text-xs sm:text-sm transition-colors ${tipoEntrega === "puntoEncuentro" ? "bg-[#E6DCC8] text-[#2D3025] border-[#E6DCC8]" : "border-[#E6DCC8]/20 text-[#E6DCC8]"}`}
              >
                Punto de encuentro
              </button>
            </div>

            {tipoEntrega === "envio" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <input className={inputClass} placeholder="Código Postal" value={shippingData.postalCode} onChange={(e) => setShippingData({ ...shippingData, postalCode: e.target.value })} />
                  <input className={inputClass} placeholder="Localidad" value={shippingData.city} onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })} />
                  <select className={inputClass} value={shippingData.state} onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })}>
                    <option value="" className="text-black">Provincia</option>
                    {PROVINCIAS.map((p) => (<option key={p.code} value={p.code} className="text-black">{p.name}</option>))}
                  </select>
                </div>
                <input className={inputClass} placeholder="Calle y número" value={shippingData.street} onChange={(e) => setShippingData({ ...shippingData, street: e.target.value })} />
                <input className={inputClass} placeholder="Piso / Departamento (opcional)" value={shippingData.floor} onChange={(e) => setShippingData({ ...shippingData, floor: e.target.value })} />
                <p className="text-xs text-[#E6DCC8]/50">El costo de envío se coordina por WhatsApp.</p>
              </>
            )}

            {tipoEntrega === "pickup" && (
              <p className="text-sm text-[#E6DCC8]/70">Coordinás día y horario de retiro por WhatsApp.</p>
            )}

            {tipoEntrega === "puntoEncuentro" && (
              <div className="space-y-2">
                {PUNTOS_ENCUENTRO.map((punto) => (
                  <label
                    key={punto}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors text-sm ${
                      puntoEncuentro === punto ? "border-[#E6DCC8] bg-[#E6DCC8]/10" : "border-[#E6DCC8]/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name="puntoEncuentro"
                      checked={puntoEncuentro === punto}
                      onChange={() => setPuntoEncuentro(punto)}
                      className="accent-[#E6DCC8]"
                    />
                    <span className="text-[#E6DCC8]">{punto}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#1A1C16] p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-[#E6DCC8]/10 lg:sticky lg:top-28 shadow-2xl space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-3xl font-serif text-[#E6DCC8] mb-4 sm:mb-6">Sumario de compra</h2>
          <div className="flex justify-between items-center text-lg sm:text-2xl font-bold text-[#E6DCC8] border-t border-[#E6DCC8]/10 pt-4 sm:pt-6">
            <span>Total</span>
            <span className="text-2xl sm:text-4xl tracking-tight">${totalProductos.toLocaleString("es-AR")}</span>
          </div>
          <button onClick={irAWhatsapp} className="w-full bg-[#E6DCC8] hover:bg-white text-[#2D3025] font-semibold rounded-xl px-6 py-3.5 sm:py-4 transition-colors text-base sm:text-lg mt-2">
            Continuar por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}