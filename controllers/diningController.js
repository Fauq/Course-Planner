const axios = require('axios');

exports.getDiningHalls = async (req, res) => {
    try {
        const response = await axios.get('https://michigan-dining-api.tendiesti.me/v1/diningHalls');
        res.json(response.data.diningHalls);
    } catch (error) {
        console.error('Error fetching dining hall data:', error);
        res.status(500).send('Server error');
    }
};


exports.getMenu = async (req, res) => {
    const diningHall = req.params.diningHall;
    try {
        const response = await axios.get(`https://michigan-dining-api.tendiesti.me/v1/menus`, {
            params: {
                date,
                diningHall,
                meal
            }
        });
        console.log("Success loading menu data");
        res.json(response.data.menuItems);
    } catch (error) {
        console.log("Error fetching menu data: ", error);
        res.status(500).send("Server Error");
    }
};