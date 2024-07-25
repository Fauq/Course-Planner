const express = require('express');
const router = express.Router();

const { getMenu } = require('../controllers/diningcontroller');

// router.post('/users/dashboard', (req, res) => {
//     const diningHall = req.body.diningHall;
//     req.session.selectedDiningHall = diningHall;
//     req.status(200).redirect('/users/dashboard');
// });

router.post('/users/dashboard/diningHall', getMenu);


module.exports = router;