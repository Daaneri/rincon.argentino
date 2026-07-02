const handleShippingCheck = async () => {
    try {
        const response = await fetch('https://rincon-argentino.onrender.com/test-shipping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ zipcode: '2919' })
        });
        
        const data = await response.json();
        console.log("Respuesta:", data);
        alert("Costo: " + data.costo);
    } catch (error) {
        console.error("Error:", error);
    }
};