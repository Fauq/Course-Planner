
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

                            document.getElementById('selectedHall').innerText = `${diningHall} \n${newMeal} Menu`;

                            const buttonWrapper = document.createElement('div');
                            buttonWrapper.className = 'button-wrapper';

                            const menuItemName = document.createElement('div');
                            menuItemName.className = 'menu-item-name';
                            menuItemName.innerText = item.name;
                            buttonWrapper.appendChild(menuItemName);

                            const nutritionInfoWrapper = document.createElement('div');
                            nutritionInfoWrapper.className = 'nutrition-info-wrapper';

                            const caloriesDiv = document.createElement('div');
                            const proteinDiv = document.createElement('div');

                            nutritionInfoWrapper.appendChild(caloriesDiv);
                            nutritionInfoWrapper.appendChild(proteinDiv);

                            buttonWrapper.appendChild(nutritionInfoWrapper);

                            // Add the log button
                            const logButton = document.createElement('button');
                            logButton.className = 'log-button';
                            logButton.innerText = '+';
                            logButton.addEventListener('click', () => logFood(item, caloriesDiv.innerText));
                            buttonWrapper.appendChild(logButton);

                            document.getElementById('diningHallMenu').appendChild(buttonWrapper);

                                        getFoodNutrition(item.name.toLowerCase(), date, meal)
                                        .then(nutrition => {
                                            caloriesDiv.textContent = `Calories: ${nutrition.calories}`;
                                            proteinDiv.textContent = `Protein: ${nutrition.protein}g`;
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
            let protein = 0;
            const foodArr = data.foods;
            foodArr.forEach(food => {
                calories = food.menuItem.itemSizes[0].nutritionalInfo[0].value; 
                protein = food.menuItem.itemSizes[0].nutritionalInfo[9].value;
            });
            return {calories, protein}; // Resolve the promise with calories
        })
        .catch(error => {
            console.error('Error fetching food nutrition:', error);
            throw error; // Re-throw the error to be catchable by the caller
        });
}

function logFood(item, calories) {
    const log = {
        name: item.name,
        calories: calories
    };
    console.log('Logging:', log);
}