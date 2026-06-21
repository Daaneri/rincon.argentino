import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { CartProvider } from './context/CartContext' // Importamos el proveedor
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CartProvider> {/* Envolvemos App para que el carrito viva en toda la web */}
      <App />
    </CartProvider>
  </React.StrictMode>,
)