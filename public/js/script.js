
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

document.getElementById('diningHallForm').addEventListener('submit', function(event) {
    event.preventDefault();
    fetchMenu();
});

async function fetchMenu() {
    console.log('Fetching menu...');
    const diningHall = document.getElementById('diningHall').value;
    const date = document.getElementById('date').value;
    const meal = document.getElementById('meal').value;
    let newMeal = meal.charAt(0).toUpperCase() + meal.slice(1).toLowerCase();

    document.getElementById('diningHallMenu').innerHTML = '';

    fetch('https://michigan-dining-api.tendiesti.me/v1/items')
    .then(response => response.json())
    .then(data => {
        if(data.items && typeof data.items === 'object') {
            // Convert the items object into an array
            const itemsArray = Object.values(data.items);
            console.log(itemsArray);
            // Sort the items array by name
            itemsArray.forEach(item => {
                item.diningHallMatchesArray.forEach(diningHallMatch => {
                    if(diningHallMatch.name === diningHall && diningHallMatch.mealTimesArray.forEach(mealTime => {
                        if(mealTime.date === date && mealTime.mealNames[0] === meal) {

                            document.getElementById('selectedHall').innerText = diningHall + ' ' + newMeal + ' Menu';
                            var menuItemDiv = document.createElement('div'); // Create a div to hold both name and calories

                            var menuItemName = document.createElement('p'); // Use p for the item name
                            menuItemName.innerText = item.name;
                            menuItemDiv.appendChild(menuItemName); // Append the name to the div

                            document.getElementById('diningHallMenu').appendChild(menuItemDiv); // Append the div to the menu

                            getFoodNutrition(item.name.toLowerCase(), date, meal)
                            .then(calories => {
                                var caloriesInfo = document.createElement('p'); // Use another p for calories
                                caloriesInfo.textContent = `Calories: ${calories}`;
                                menuItemDiv.appendChild(caloriesInfo); // Append calories info below the item name
                            })
                            .catch(error => console.error('Error fetching nutrition:', error));
                        }
                    })
                    );
                });
            });

            
        }
    })

    .catch(error => {
        console.error('Error fetching menu:', error);
    });
}

function getFoodNutrition(name, date, meal) {
    const queryParams = new URLSearchParams({ name, date, meal }).toString();
    const url = `https://michigan-dining-api.tendiesti.me/v1/foods?${queryParams}`;
    return fetch(url) // Return the fetch promise
        .then(response => response.json())
        .then(data => {
            let calories = 0;
            const foodArr = data.foods;
            foodArr.forEach(food => {
                calories = food.menuItem.itemSizes[0].nutritionalInfo[0].value; // Assuming you want to sum calories
            });
            return calories; // Resolve the promise with calories
        })
        .catch(error => {
            console.error('Error fetching food nutrition:', error);
            throw error; // Re-throw the error to be catchable by the caller
        });
}