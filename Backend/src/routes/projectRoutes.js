const express = require('express');
const { getDiscoveryProjects, expressInterest, getMyActiveProjects } = require('../controllers/projectController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const { interestLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// Route restricted to CLIENT users (and admins/managers for visibility) to see the discovery marketplace
router.get('/discovery', verifyToken, checkRole(['CLIENT', 'MANAGER', 'ADMIN']), getDiscoveryProjects);

// Express interest in a project
router.post('/:id/interest', verifyToken, checkRole(['CLIENT']), interestLimiter, expressInterest);

// My Active Projects
router.get('/active', verifyToken, checkRole(['CLIENT']), getMyActiveProjects);

module.exports = router;
