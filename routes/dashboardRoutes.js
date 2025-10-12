const express = require('express');
const router = express.Router();
const { getDashboardStats, getSalesStats, getTopSellingPackages } = require('../controllers/dashboardController');

// Get overall dashboard summary
router.get('/', getDashboardStats);

// Get daily sales statistics (for Recharts)
router.get('/sales-stats', getSalesStats);

router.get('/top-packages', getTopSellingPackages);

module.exports = router;
