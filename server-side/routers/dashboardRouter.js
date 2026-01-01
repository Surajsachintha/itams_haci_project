const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/stats', dashboardController.getStats);
router.get('/devices-by-category', dashboardController.getDevicesByCategory);
router.get('/devices-by-station', dashboardController.getDevicesByStation);
router.get('/top-brands', dashboardController.getTopBrands);
router.get('/device-status', dashboardController.getDeviceStatus);

module.exports = router;