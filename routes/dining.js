const express = require('express');
const router = express.Router();
const diningController = require('../controllers/diningController');

router.get('/dining-halls', diningController.getDiningHalls);
router.get('/menu', diningController.getMenu);

module.exports = router;