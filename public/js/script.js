
document.addEventListener('DOMContentLoaded', function() {
    fetchDiningHalls();

});

async function fetchDiningHalls() {
    try {
        const response = await fetch('https://michigan-dining-api.tendiesti.me/v1/diningHalls');
        const data = await response.json();

        const diningHalls = data.diningHalls;
        if (Array.isArray(diningHalls)) {
            const diningHallSelect = document.getElementById('diningHall');
            diningHalls.forEach(diningHall => {
                if (diningHall.campus === "DINING HALLS" && (diningHall.name.includes("Dining Hall") || diningHall.name === "Twigs At Oxford")) {
                    const option = document.createElement('option');
                    option.value = diningHall.name;
                    option.innerText = diningHall.name;
                    diningHallSelect.appendChild(option);
                }
            });
        }
    } catch (error) {
        console.error('Error fetching dining halls:', error);
    }
}