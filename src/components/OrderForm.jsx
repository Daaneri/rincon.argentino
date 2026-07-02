const handleGetShipping = async () => {
    try {
        const response = await fetch('https://rincon-argentino.onrender.com/shipping-quote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ zipcode: cp }) // 'cp' es el estado de tu input
        });
        
        const data = await response.json();
        if(data.success) {
            alert("El costo de envío es: $" + data.cost);
        }
    } catch (error) {
        console.error("Error en cotización:", error);
    }
};