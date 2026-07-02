import React, { useState } from 'react';

const OrderForm = () => {
    const [nombre, setNombre] = useState('');
    const [direccion, setDireccion] = useState('');
    const [cp, setCp] = useState('');

    const handleShippingCheck = async () => {
        try {
            console.log("Enviando CP:", cp);
            const response = await fetch('https://rincon-argentino.onrender.com/test-shipping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ zipcode: cp })
            });
            
            const data = await response.json();
            console.log("Respuesta de Envíos:", data);
            alert("El costo de envío es: " + data.costo);
        } catch (error) {
            console.error("Error al conectar con el servidor:", error);
            alert("Error al conectar con el servidor.");
        }
    };

    return (
        <div className="order-form">
            <input 
                type="text" 
                placeholder="Nombre" 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)} 
            />
            <input 
                type="text" 
                placeholder="Dirección" 
                value={direccion} 
                onChange={(e) => setDireccion(e.target.value)} 
            />
            <input 
                type="text" 
                placeholder="Código Postal" 
                value={cp} 
                onChange={(e) => setCp(e.target.value)} 
            />
            
            <button onClick={handleShippingCheck}>
                Calcular Envío
            </button>
        </div>
    );
};

export default OrderForm;