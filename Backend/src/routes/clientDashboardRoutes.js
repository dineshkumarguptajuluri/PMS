const express = require('express');
const { getClientProjects } = require('../controllers/clientDashboardController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/projects', verifyToken, checkRole(['CLIENT']), getClientProjects);

module.exports = router;
