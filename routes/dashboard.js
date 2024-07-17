const express = require('express');
const router = express.Router();

router.post('/users/dashboard', (req, res) => {
    const diningHall = req.body.diningHall;
    req.session.selectedDiningHall = diningHall;
    req.status(200).redirect('/users/dashboard');
});

module.exports = router;