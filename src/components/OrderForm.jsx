const handleTestClick = async () => {
    try {
        const response = await fetch('https://rincon-argentino.onrender.com/test-shipping', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ zipcode: '2919' })
        });
        
        const data = await response.json();
        console.log("Respuesta del servidor:", data);
        alert("¡Éxito! El servidor respondió: " + data.mensaje);
    } catch (error) {
        console.error("Error al conectar:", error);
        alert("Hubo un error al conectar con el servidor.");
    }
};

// Asegúrate de que el botón en tu JSX llame a esta función:
// <button onClick={handleTestClick}>Probar Conexión</button>