const express = require('express');
const { onboardClient, getPendingClients } = require('../controllers/clientController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Upload any files attached mapping to any field name to act as docType
router.post('/onboard', verifyToken, checkRole(['ADMIN', 'MANAGER', 'CLIENT']), upload.any(), onboardClient);

// Fetch all profiles awaiting approval
router.get('/pending', verifyToken, checkRole(['ADMIN']), getPendingClients);

module.exports = router;
