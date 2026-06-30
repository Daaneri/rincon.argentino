// En CartPage.jsx
return (
  // p-4 en celular, py-16 px-8 en computadora
  <div className="w-full max-w-6xl mx-auto py-8 px-4 md:py-16 md:px-8"> 
    <h1 className="text-3xl md:text-5xl font-serif font-bold text-[#E6DCC8] mb-10 md:mb-16 text-center">Tu Pedido</h1>
    
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
      
      {/* Lista de productos */}
      <div className="lg:col-span-7 space-y-4 md:space-y-6">
        {cart.map((item) => (
          <div key={item.id} className="flex flex-col sm:flex-row items-center justify-between p-4 md:p-8 bg-[#2D3025]/40 rounded-2xl md:rounded-3xl border border-[#E6DCC8]/10 shadow-lg gap-4">
            <div className="flex items-center gap-4 md:gap-8 w-full sm:w-auto">
              <img src={item.image_url} alt={item.name} className="w-20 h-20 md:w-32 md:h-32 object-cover rounded-xl md:rounded-2xl" />
              <div>
                <h3 className="font-bold text-lg md:text-2xl text-[#E6DCC8]">{item.name}</h3>
                <span className="text-[#E6DCC8]/70 text-base md:text-lg">${item.price.toLocaleString('es-AR')}</span>
              </div>
            </div>
            {/* Controles de cantidad */}
            <div className="flex items-center gap-4 bg-[#1A1C16] rounded-xl p-2 md:p-3 border border-[#E6DCC8]/10 w-full sm:w-auto justify-center">
              <button onClick={() => updateQuantity(item.id, -1)} className="p-2"><Minus size={18} /></button>
              <span className="font-bold text-lg w-8 text-center">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, 1)} className="p-2"><Plus size={18} /></button>
              <button onClick={() => removeFromCart(item.id)} className="ml-4 text-red-400"><Trash2 size={20} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Sumario y Formulario */}
      <div className="lg:col-span-5 w-full">
        <div className="bg-[#1A1C16] p-6 md:p-10 rounded-2xl md:rounded-3xl border border-[#E6DCC8]/10 sticky top-24 shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-serif text-[#E6DCC8] mb-6 md:mb-8">Sumario</h2>
          <div className="flex justify-between text-xl md:text-2xl font-bold text-[#E6DCC8] border-b border-[#E6DCC8]/10 pb-4 md:pb-6 mb-6 md:mb-8">
            <span>Total</span>
            <span>${total.toLocaleString('es-AR')}</span>
          </div>
          <OrderForm />
        </div>
      </div>
    </div>
  </div>
);