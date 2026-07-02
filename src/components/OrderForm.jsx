const handleShippingCheck = async () => {
    try {
        const response = await fetch('https://rincon-argentino.onrender.com/test-shipping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ zipcode: '2919' }) // O el valor de tu input
        });
        
        const data = await response.json();
        console.log("Respuesta de Envíos.com:", data);
        alert("Respuesta del servidor: " + data.mensaje);
    } catch (error) {
        console.error("Error:", error);
    }
};